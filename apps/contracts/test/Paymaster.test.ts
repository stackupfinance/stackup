import { expect } from 'chai'
import { ethers } from 'hardhat'
import { Contract } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'

import {deploy, instanceAt} from './utils/helpers/contracts'
import { getSigners } from './utils/helpers/signers'
import { bn, decimal, fp } from './utils/helpers/numbers'
import { ADMIN_ROLE, GUARDIAN_ROLE, MAX_UINT256, OWNER_ROLE, ZERO_ADDRESS } from './utils/helpers/constants'
import { encodePaymasterData, encodePaymasterSignature, encodeTokenApproval, encodeWalletExecute } from './utils/helpers/encoding'

import Paymaster from './utils/models/paymaster/Paymaster'
import { BigNumberish, UserOp, buildOp } from './utils/types'

describe('Paymaster', () => {
  let paymaster: Paymaster, owner: SignerWithAddress, guardian: SignerWithAddress, sender: SignerWithAddress, other: SignerWithAddress

  beforeEach('deploy paymaster', async () => {
    [, owner, guardian, sender, other] = await getSigners()
    paymaster = await Paymaster.create({ owner, guardians: [guardian] })
  })

  describe('initialization', () => {
    it('defines role constants properly', async () => {
      expect(await paymaster.instance.OWNER_ROLE()).to.be.equal(OWNER_ROLE)
      expect(await paymaster.instance.GUARDIAN_ROLE()).to.be.equal(GUARDIAN_ROLE)
    })

    it('sets up owners properly', async () => {
      expect(await paymaster.getOwnerCount()).to.be.equal(1)
      expect(await paymaster.getRoleMemberCount(OWNER_ROLE)).to.be.equal(1)
      expect(await paymaster.hasRole(OWNER_ROLE, owner)).to.be.true
      expect(await paymaster.getOwner(0)).to.be.equal(owner.address)
    })

    it('sets up guardians properly', async () => {
      expect(await paymaster.getGuardianCount()).to.be.equal(1)
      expect(await paymaster.getRoleMemberCount(GUARDIAN_ROLE)).to.be.equal(1)
      expect(await paymaster.hasRole(GUARDIAN_ROLE, guardian)).to.be.true
      expect(await paymaster.getGuardian(0)).to.be.equal(guardian.address)
      expect(await paymaster.getMinGuardiansSignatures()).to.be.equal(1)
    })

    it('sets up admin roles properly', async () => {
      expect(await paymaster.getRoleAdmin(OWNER_ROLE)).to.be.equal(OWNER_ROLE)
      expect(await paymaster.getRoleAdmin(GUARDIAN_ROLE)).to.be.equal(OWNER_ROLE)
      expect(await paymaster.getRoleMemberCount(ADMIN_ROLE)).to.be.equal(0)
    })

    it('cannot be initialized twice', async () => {
      await expect(paymaster.instance.initialize(paymaster.entryPoint.address, owner.address, [])).to.be.revertedWith('Initializable: contract is already initialized')
    })

    it('cannot be initialized with the owner as a guardian', async () => {
      await expect(Paymaster.create({ owner, guardians: [owner] })).to.be.revertedWith('ACL: Owner cannot be guardian')
    })
  })

  describe('receive', () => {
    const amount = fp(1)

    it('accepts ETH from anyone', async () => {
      await other.sendTransaction({ to: paymaster.address, value: amount })
      await guardian.sendTransaction({ to: paymaster.address, value: amount })

      expect(await ethers.provider.getBalance(paymaster.address)).to.be.equal(amount.mul(2))
    })
  })

  describe('validatePaymasterUserOp', () => {
    let op: UserOp

    beforeEach('build op', () => {
      // These are required fields the op must have filled in order to allow the wallet decoding properly
      // It must have any calldata cause it will check the paymaster allowance is not changing
      op = buildOp({ sender: sender.address, paymaster: paymaster.address, callData: '0xabcdef1111' })
    })

    context('when a signature is given', () => {
      context('when the signature can be decoded', () => {
        let token: Contract, feed: Contract
        const fee = bn(100000), exchangeRate = fp(2)

        beforeEach('prepare paymaster data', async () => {
          token = await deploy('TokenMock', ['DAI', 18])
          feed = await deploy('PriceFeedMock', [18, exchangeRate])
        })

        const signPaymasterData = async (signer = owner) => {
          const data = encodePaymasterData(op, fee, token, feed)
          const signature = await signer.signMessage(ethers.utils.arrayify((data)))
          return encodePaymasterSignature(fee, token, feed, signature)
        }

        context('when the signer is the owner', () => {
          beforeEach('sign op', async () => {
            op.paymasterData = await signPaymasterData(owner)
          })

          const itReturnsTheEncodedContext = (maxCost: BigNumberish, expectedFee: BigNumberish = fee) => {
            it('returns the corresponding context', async () => {
              const context = await paymaster.validatePaymasterUserOp(op, maxCost)

              const results = ethers.utils.defaultAbiCoder.decode(['address', 'address', 'uint256', 'uint256'], context)
              expect(results[0]).to.equal(op.sender)
              expect(results[1]).to.equal(token.address)
              expect(results[2]).to.equal(exchangeRate)
              expect(results[3]).to.equal(expectedFee)
            })
          }

          const itReverts = (maxCost: BigNumberish) => {
            it('reverts', async () => {
              await expect(paymaster.validatePaymasterUserOp(op, maxCost)).to.be.revertedWith('Paymaster: Not approved')
            })
          }

          context('when the given max cost is zero', () => {
            const maxCost = 0
            const expectedCost = fee

            context('when the tokens were already approved for the paymaster', () => {
              beforeEach('allow tokens from wallet to paymaster', async () => {
                await token.connect(sender).approve(paymaster.address, expectedCost)
              })

              context('when the allowance is not being affected in the current op', () => {
                context('when the op is not calling the token allowance', () => {
                  beforeEach('set calldata and re-sign', async () => {
                    op.callData = '0xaabbccdd'
                    op.paymasterData = await signPaymasterData()
                  })

                  itReturnsTheEncodedContext(maxCost)
                })

                context.skip('when the op is calling the token allowance for other user', () => {
                  // TODO: AUDIT! contracts are not using the spender properly for this check

                  beforeEach('set calldata and re-sign', async () => {
                    op.callData = await encodeWalletExecute(token, await encodeTokenApproval(other, fp(1)))
                    op.paymasterData = await signPaymasterData()
                  })

                  itReturnsTheEncodedContext(maxCost)
                })
              })

              context('when the allowance is being increased in the current op', () => {
                const amount = expectedCost.add(1)

                beforeEach('set calldata and re-sign', async () => {
                  op.callData = await encodeWalletExecute(token, await encodeTokenApproval(op.paymaster, amount))
                  op.paymasterData = await signPaymasterData()
                })

                itReturnsTheEncodedContext(maxCost)
              })

              context('when the allowance is being decreased in the current op', () => {
                const amount = expectedCost.sub(1)

                beforeEach('set calldata and re-sign', async () => {
                  op.callData = await encodeWalletExecute(token, await encodeTokenApproval(op.paymaster, amount))
                  op.paymasterData = await signPaymasterData()
                })

                itReverts(maxCost)
              })
            })

            context('when the tokens were not approved for the paymaster', () => {
              context('when the tokens are being approved in the current op', () => {
                context('when the approved amount is enough', () => {
                  const amount = expectedCost

                  beforeEach('set calldata and re-sign', async () => {
                    op.callData = await encodeWalletExecute(token, await encodeTokenApproval(op.paymaster, amount))
                    op.paymasterData = await signPaymasterData()
                  })

                  itReturnsTheEncodedContext(maxCost)
                })

                context('when the approved amount is not enough', () => {
                  const amount = expectedCost.sub(1)

                  beforeEach('set calldata and re-sign', async () => {
                    op.callData = await encodeWalletExecute(token, await encodeTokenApproval(op.paymaster, amount))
                    op.paymasterData = await signPaymasterData()
                  })

                  itReverts(maxCost)
                })
              })

              context('when the tokens are not being approved in the current op', () => {
                context('when the tokens were approved in a previous op', () => {
                  const fee = 0

                  beforeEach('re-sign op without fees', async () => {
                    const data = encodePaymasterData(op, fee, token, feed)
                    const signature = await owner.signMessage(ethers.utils.arrayify((data)))
                    op.paymasterData = encodePaymasterSignature(fee, token, feed, signature)
                  })

                  itReturnsTheEncodedContext(maxCost, fee)
                })

                context('when the tokens were not approved in a previous op', () => {
                  itReverts(maxCost)
                })
              })
            })
          })

          context('when the given max cost is greater than zero', () => {
            const maxCost = fp(10)
            const expectedCost = maxCost.mul(exchangeRate).div(fp(1)).add(fee)

            context('when the tokens were already approved for the paymaster', () => {
              beforeEach('allow tokens from wallet to paymaster', async () => {
                await token.connect(sender).approve(paymaster.address, expectedCost)
              })

              context('when the allowance is not being affected in the current op', () => {
                context('when the op is not calling the token allowance', () => {
                  beforeEach('set calldata and re-sign', async () => {
                    op.callData = '0xaabbccdd'
                    op.paymasterData = await signPaymasterData()
                  })

                  itReturnsTheEncodedContext(maxCost)
                })

                context.skip('when the op is calling the token allowance for other user', () => {
                  // TODO: AUDIT! contracts are not using the spender properly for this check

                  beforeEach('set calldata and re-sign', async () => {
                    op.callData = await encodeWalletExecute(token, await encodeTokenApproval(other, fp(1)))
                    op.paymasterData = await signPaymasterData()
                  })

                  itReturnsTheEncodedContext(maxCost)
                })
              })

              context('when the allowance is being increased in the current op', () => {
                const amount = expectedCost.add(1)

                beforeEach('set calldata and re-sign', async () => {
                  op.callData = await encodeWalletExecute(token, await encodeTokenApproval(op.paymaster, amount))
                  op.paymasterData = await signPaymasterData()
                })

                itReturnsTheEncodedContext(maxCost)
              })

              context('when the allowance is being decreased in the current op', () => {
                const amount = expectedCost.sub(1)

                beforeEach('set calldata and re-sign', async () => {
                  op.callData = await encodeWalletExecute(token, await encodeTokenApproval(op.paymaster, amount))
                  op.paymasterData = await signPaymasterData()
                })

                itReverts(maxCost)
              })
            })

            context('when the tokens were not approved for the paymaster', () => {
              context('when the tokens are being approved in the current op', () => {
                context('when the approved amount is enough', () => {
                  const amount = expectedCost

                  beforeEach('set calldata and re-sign', async () => {
                    op.callData = await encodeWalletExecute(token, await encodeTokenApproval(op.paymaster, amount))
                    op.paymasterData = await signPaymasterData()
                  })

                  itReturnsTheEncodedContext(maxCost)
                })

                context('when the approved amount is not enough', () => {
                  const amount = expectedCost.sub(1)

                  beforeEach('set calldata and re-sign', async () => {
                    op.callData = await encodeWalletExecute(token, await encodeTokenApproval(op.paymaster, amount))
                    op.paymasterData = await signPaymasterData()
                  })

                  itReverts(maxCost)
                })
              })

              context('when the tokens are not being approved in the current op', () => {
                context('when the tokens were approved in a previous op', () => {
                  const fee = 0

                  beforeEach('re-sign op without fees', async () => {
                    const data = encodePaymasterData(op, fee, token, feed)
                    const signature = await owner.signMessage(ethers.utils.arrayify((data)))
                    op.paymasterData = encodePaymasterSignature(fee, token, feed, signature)
                  })

                  itReturnsTheEncodedContext(maxCost, fee)
                })

                context('when the tokens were not approved in a previous op', () => {
                  itReverts(maxCost)
                })
              })
            })
          })
        })

        context('when the signer is not the owner', () => {
          beforeEach('sign op', async () => {
            op.paymasterData = await signPaymasterData(guardian)
          })

          it('reverts', async () => {
            await expect(paymaster.validatePaymasterUserOp(op)).to.be.revertedWith('Paymaster: Invalid signature')
          })
        })
      })

      context('when the signature cannot be decoded', () => {
        beforeEach('set bad signature', () => {
          op.signature = '0xabcdef'
        })

        it('reverts', async () => {
          await expect(paymaster.validatePaymasterUserOp(op)).to.be.reverted
        })
      })
    })

    context('when no signature is given', () => {
      it('reverts', async () => {
        await expect(paymaster.validatePaymasterUserOp(op)).to.be.reverted
      })
    })
  })

  describe('postOp', () => {
    let token: Contract, contextData: string
    const fee = bn(10), exchangeRate = fp(2), actualGasCost = fp(1)

    beforeEach('build context', async () => {
      token = await deploy('TokenMock', ['DAI', 18])
      const params = [sender.address, token.address, exchangeRate, fee]
      contextData = ethers.utils.defaultAbiCoder.encode(['address', 'address', 'uint256', 'uint256'], params)
    })

    context('when the sender is the entry point', () => {
      let from: Contract

      beforeEach('set sender', async () => {
        from = paymaster.entryPoint
      })

      context('when the payer has approved the wallet enough tokens', () => {
        beforeEach('approve tokens', async () => {
          await token.connect(sender).approve(paymaster.address, MAX_UINT256)
        })

        context('when the payer has approved the wallet enough tokens', () => {
          beforeEach('approve tokens', async () => {
            await token.mint(sender.address, fp(100))
          })

          it('transfers the tokens', async () => {
            const previousSenderBalance = await token.balanceOf(sender.address)
            const previousWalletBalance = await token.balanceOf(paymaster.address)

            await paymaster.postOp(contextData, actualGasCost, { from })

            const expectedCost = actualGasCost.mul(exchangeRate).div(fp(1)).add(fee)
            const currentSenderBalance = await token.balanceOf(sender.address)
            expect(currentSenderBalance).to.be.equal(previousSenderBalance.sub(expectedCost))

            const currentWalletBalance = await token.balanceOf(paymaster.address)
            expect(currentWalletBalance).to.be.equal(previousWalletBalance.add(expectedCost))
          })
        })

        context('when the payer does not have enough tokens', () => {
          it('reverts', async () => {
            await expect(paymaster.postOp(contextData, actualGasCost, { from })).to.be.revertedWith('ERC20: transfer amount exceeds balance')
          })
        })
      })

      context('when the payer has not approved the wallet enough tokens', () => {
        it('reverts', async () => {
          await expect(paymaster.postOp(contextData, actualGasCost, { from })).to.be.revertedWith('ERC20: insufficient allowance')
        })
      })
    })

    context('when the sender is not the entry point', () => {
      let from: SignerWithAddress

      beforeEach('set sender', async () => {
        from = other
      })

      it('reverts', async () => {
        await expect(paymaster.postOp(contextData, actualGasCost, { from })).to.be.revertedWith('ACL: sender not allowed')
      })
    })
  })

  describe('getTokenFee', () => {
    const COST = fp(1)
    const FEE = decimal(3)
    const RATE = decimal(2)

    const itExpressTheRateCorrectly = (tokenDecimals: number, feedDecimals: number) => {
      let token: Contract, feed: Contract

      beforeEach('deploy token and feed', async () => {
        token = await deploy('TokenMock', ['TKN', tokenDecimals])
        feed = await deploy('PriceFeedMock', [feedDecimals, bn(RATE.mul(10**feedDecimals))])
      })

      it(`expresses token rate with ${tokenDecimals} decimals`, async () => {
        // pre-approve tokens since paymaster validation will check that
        const op = buildOp({ sender: owner.address, paymaster: paymaster.address, callData: '0xabcdef1111' })
        await token.connect(owner).approve(paymaster.address, MAX_UINT256)

        const baseFee = bn(FEE.mul(10**tokenDecimals))
        const data = encodePaymasterData(op, baseFee, token, feed)
        const signature = await owner.signMessage(ethers.utils.arrayify((data)))
        op.paymasterData = encodePaymasterSignature(baseFee, token, feed, signature)

        const context = await paymaster.validatePaymasterUserOp(op, COST)
        const results = ethers.utils.defaultAbiCoder.decode(['address', 'address', 'uint256', 'uint256'], context)

        const expectedRate = bn(RATE.mul(10**tokenDecimals))
        expect(results[2]).to.be.equal(expectedRate)
        expect(results[3]).to.be.equal(baseFee)
      })
    }

    context('when the token has 6 decimals', () => {
      const tokenDecimals = 6

      context('when the feed has 6 decimals', () => {
        const feedDecimals = 6

        itExpressTheRateCorrectly(tokenDecimals, feedDecimals)
      })

      context('when the feed has 18 decimals', () => {
        const feedDecimals = 18

        itExpressTheRateCorrectly(tokenDecimals, feedDecimals)
      })

      context('when the feed has 20 decimals', () => {
        const feedDecimals = 20

        itExpressTheRateCorrectly(tokenDecimals, feedDecimals)
      })
    })

    context('when the token has 18 decimals', () => {
      const tokenDecimals = 18

      context('when the feed has 6 decimals', () => {
        const feedDecimals = 6

        itExpressTheRateCorrectly(tokenDecimals, feedDecimals)
      })

      context('when the feed has 18 decimals', () => {
        const feedDecimals = 18

        itExpressTheRateCorrectly(tokenDecimals, feedDecimals)
      })

      context('when the feed has 20 decimals', () => {
        const feedDecimals = 20

        itExpressTheRateCorrectly(tokenDecimals, feedDecimals)
      })
    })

    context('when the token has 20 decimals', () => {
      const tokenDecimals = 20

      context('when the feed has 6 decimals', () => {
        const feedDecimals = 6

        itExpressTheRateCorrectly(tokenDecimals, feedDecimals)
      })

      context('when the feed has 18 decimals', () => {
        const feedDecimals = 18

        itExpressTheRateCorrectly(tokenDecimals, feedDecimals)
      })

      context('when the feed has 20 decimals', () => {
        const feedDecimals = 20

        itExpressTheRateCorrectly(tokenDecimals, feedDecimals)
      })
    })
  })

  describe('isValidSignature', () => {
    const message = ethers.utils.hashMessage("Test message!")

    context('when the given message was signed by the owner', () => {
      let signature: string

      beforeEach('sign message', async () => {
        signature = await owner.signMessage('Test message!')
      })

      it('returns the function selector', async () => {
        const result = await paymaster.isValidSignature(message, signature)
        expect(result).to.be.equal(paymaster.instance.interface.getSighash('isValidSignature(bytes32,bytes)'))
      })
    })

    context('when the given message was not signed by the owner', () => {
      let signature: string

      beforeEach('sign message', async () => {
        signature = await guardian.signMessage('Test message!')
      })

      it('reverts', async () => {
        await expect(paymaster.isValidSignature(message, signature)).to.be.revertedWith('ACL: Invalid signature')
      })
    })
  })

  describe('transferOwner', () => {
    context('when the sender is the entry point', () => {
      let from: Contract

      beforeEach('set sender', async () => {
        from = paymaster.entryPoint
      })

      context('when the new owner is not the address zero', () => {
        it('transfer ownership to the grantee', async () => {
          await paymaster.transferOwner(other, { from })

          expect(await paymaster.getOwnerCount()).to.be.equal(1)
          expect(await paymaster.getRoleMemberCount(OWNER_ROLE)).to.be.equal(1)
          expect(await paymaster.hasRole(OWNER_ROLE, owner)).to.be.false
          expect(await paymaster.hasRole(OWNER_ROLE, other)).to.be.true
          expect(await paymaster.getOwner(0)).to.be.equal(other.address)
        })
      })

      context('when the new owner is the address zero', () => {
        // TODO: fix

        it.skip('reverts', async () => {
          await expect(paymaster.transferOwner(ZERO_ADDRESS, { from })).to.be.reverted
        })
      })
    })

    context('when the sender is not the entry point', () => {
      let from: SignerWithAddress

      beforeEach('set sender', async () => {
        from = other
      })

      it('reverts', async () => {
        await expect(paymaster.transferOwner(other, { from })).to.be.revertedWith('ACL: sender not allowed')
      })
    })
  })

  describe('grantGuardian', () => {
    context('when the sender is the entry point', () => {
      let from: Contract

      beforeEach('set sender', async () => {
        from = paymaster.entryPoint
      })

      context('when the grantee is not the owner', () => {
        context('when the grantee was not a guardian yet', () => {
          it('grants the guardian role to the grantee', async () => {
            await paymaster.grantGuardian(other, { from })

            expect(await paymaster.getGuardianCount()).to.be.equal(2)
            expect(await paymaster.getRoleMemberCount(GUARDIAN_ROLE)).to.be.equal(2)
            expect(await paymaster.hasRole(GUARDIAN_ROLE, guardian)).to.be.true
            expect(await paymaster.hasRole(GUARDIAN_ROLE, other)).to.be.true
            expect(await paymaster.getGuardian(0)).to.be.equal(guardian.address)
            expect(await paymaster.getGuardian(1)).to.be.equal(other.address)
          })
        })

        context('when the grantee was already a guardian', () => {
          it('does not affect the guardian list', async () => {
            await paymaster.grantGuardian(guardian, { from })

            expect(await paymaster.getGuardianCount()).to.be.equal(1)
            expect(await paymaster.getRoleMemberCount(GUARDIAN_ROLE)).to.be.equal(1)
            expect(await paymaster.hasRole(GUARDIAN_ROLE, guardian)).to.be.true
            expect(await paymaster.getGuardian(0)).to.be.equal(guardian.address)
          })
        })
      })

      context('when the grantee is the owner', () => {
        it('reverts', async () => {
          await expect(paymaster.grantGuardian(owner, { from })).to.be.revertedWith('ACL: Owner cannot be guardian')
        })
      })
    })

    context('when the sender is not the entry point', () => {
      let from: SignerWithAddress

      beforeEach('set sender', async () => {
        from = other
      })

      it('reverts', async () => {
        await expect(paymaster.grantGuardian(other, { from })).to.be.revertedWith('ACL: sender not allowed')
      })
    })
  })

  describe('revokeGuardian', () => {
    context('when the sender is the entry point', () => {
      let from: Contract

      beforeEach('set sender', async () => {
        from = paymaster.entryPoint
      })

      context('when the grantee was already a guardian', () => {
        it('revokes the guardian role to the grantee', async () => {
          await paymaster.revokeGuardian(guardian, { from })

          expect(await paymaster.getGuardianCount()).to.be.equal(0)
          expect(await paymaster.getRoleMemberCount(GUARDIAN_ROLE)).to.be.equal(0)
          expect(await paymaster.hasRole(GUARDIAN_ROLE, guardian)).to.be.false
        })
      })

      context('when the grantee was not a guardian', () => {
        it('does not affect the guardian list', async () => {
          await paymaster.revokeGuardian(other, { from })

          expect(await paymaster.getGuardianCount()).to.be.equal(1)
          expect(await paymaster.getRoleMemberCount(GUARDIAN_ROLE)).to.be.equal(1)
          expect(await paymaster.hasRole(GUARDIAN_ROLE, guardian)).to.be.true
          expect(await paymaster.getGuardian(0)).to.be.equal(guardian.address)
        })
      })
    })

    context('when the sender is not the entry point', () => {
      let from: SignerWithAddress

      beforeEach('set sender', async () => {
        from = other
      })

      it('reverts', async () => {
        await expect(paymaster.revokeGuardian(other, { from })).to.be.revertedWith('ACL: sender not allowed')
      })
    })
  })

  describe('upgradeTo', () => {
    let newImplementation: Contract

    context('when the sender is the entry point', () => {
      let from: Contract

      beforeEach('set sender', async () => {
        from = paymaster.entryPoint
      })

      context('when the new implementation is UUPS-compliant', () => {
        beforeEach('deploy new UUPS-compliant implementation', async () => {
          newImplementation = await deploy('Wallet')
        })

        it('upgrades to the new implementation', async () => {
          await paymaster.upgradeTo(newImplementation, { from })

          expect(await paymaster.getCurrentImplementation()).to.be.equal(newImplementation.address)
        })

        it.skip('works fine with storage layout changes', async () => {
          // TODO: implement
        })
      })

      context('when the new implementation is not UUPS-compliant', () => {
        beforeEach('deploy non UUPS-compliant implementation', async () => {
          newImplementation = await deploy('TokenMock', ['TKN', 18])
        })

        it('reverts', async () => {
          await expect(paymaster.upgradeTo(newImplementation, { from })).to.be.revertedWith('ERC1967Upgrade: new implementation is not UUPS')
        })
      })
    })

    context('when the sender is not the entry point', () => {
      let from: SignerWithAddress

      beforeEach('set sender', async () => {
        from = other
      })

      it('reverts', async () => {
        await expect(paymaster.upgradeTo(newImplementation, { from })).to.be.revertedWith('ACL: sender not allowed')
      })
    })
  })
})
