import { expect } from 'chai'
import { ethers } from 'hardhat'
import { Contract } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'

import { bn, fp } from './utils/helpers/numbers'
import { deploy } from './utils/helpers/contracts'
import { getSigners } from './utils/helpers/signers'
import { assertIndirectEvent } from './utils/helpers/asserts'
import { ADMIN_ROLE, GUARDIAN_ROLE, MAX_UINT256, OWNER_ROLE, ZERO_ADDRESS, ZERO_BYTES32 } from './utils/helpers/constants'
import {
  encodeCounterIncrement,
  encodePaymasterData,
  encodePaymasterSignature,
  encodeReverterFail,
  encodeSignatures,
  encodeTokenApproval,
  encodeWalletExecute,
  encodeWalletOwnerTransfer
} from './utils/helpers/encoding'

import Wallet from './utils/models/wallet/Wallet'
import { UserOp, BigNumberish, buildOp } from './utils/types'

describe('Wallet', () => {
  let wallet: Wallet
  let owner: SignerWithAddress, guardian: SignerWithAddress, other: SignerWithAddress

  before('setup signers', async () => {
    [, owner, guardian, other] = await getSigners()
  })

  beforeEach('deploy wallet', async () => {
    wallet = await Wallet.create({ owner, guardians: [guardian] })
  })

  describe('initialization', () => {
    it('starts with nonce zero', async () => {
      expect(await wallet.nonce()).to.be.equal(0)
    })

    it('defines role constants properly', async () => {
      expect(await wallet.instance.OWNER_ROLE()).to.be.equal(OWNER_ROLE)
      expect(await wallet.instance.GUARDIAN_ROLE()).to.be.equal(GUARDIAN_ROLE)
    })

    it('sets up owners properly', async () => {
      expect(await wallet.getOwnerCount()).to.be.equal(1)
      expect(await wallet.getRoleMemberCount(OWNER_ROLE)).to.be.equal(1)
      expect(await wallet.hasRole(OWNER_ROLE, owner)).to.be.true
      expect(await wallet.getOwner(0)).to.be.equal(owner.address)
    })

    it('sets up guardians properly', async () => {
      expect(await wallet.getGuardianCount()).to.be.equal(1)
      expect(await wallet.getRoleMemberCount(GUARDIAN_ROLE)).to.be.equal(1)
      expect(await wallet.hasRole(GUARDIAN_ROLE, guardian)).to.be.true
      expect(await wallet.getGuardian(0)).to.be.equal(guardian.address)
    })

    it('sets up admin roles properly', async () => {
      expect(await wallet.getRoleAdmin(OWNER_ROLE)).to.be.equal(OWNER_ROLE)
      expect(await wallet.getRoleAdmin(GUARDIAN_ROLE)).to.be.equal(OWNER_ROLE)
      expect(await wallet.getRoleMemberCount(ADMIN_ROLE)).to.be.equal(0)
    })

    it('cannot be initialized twice', async () => {
      await expect(wallet.instance.initialize(wallet.entryPoint.address, owner.address, [])).to.be.revertedWith('Initializable: contract is already initialized')
    })
  })

  describe('validateUserOp', () => {
    let op: UserOp

    beforeEach('build op', () => {
      op = buildOp()
    })

    context('when the sender is the entry point', () => {
      let from: Contract

      beforeEach('set sender', async () => {
        from = wallet.entryPoint
      })

      context('when a signature is given', () => {
        context('when the signature can be decoded', () => {
          let requestId: string

          context('when signed by the owner', () => {
            const type = Wallet.OWNER_SIGNATURE

            context('when the signed request ID matches the one given', () => {
              beforeEach('compute request ID', async () => {
                requestId = await wallet.getRequestId(op)
              })

              context('when the given nonce is correct', () => {
                context('when the op is signed by the owner', () => {
                  beforeEach('sign op', async () => {
                    op.signature = await wallet.signWithOwner(op, requestId)
                  })

                  const itIncreasesTheWalletNonce = (prefund: BigNumberish) => {
                    it('increases the wallet nonce', async () => {
                      const previousNonce = await wallet.nonce()

                      await wallet.validateUserOp(op, requestId, prefund, { from })

                      expect(await wallet.nonce()).to.be.equal(previousNonce.add(1))
                    })
                  }

                  const itIgnoresAnyOtherOpData = (prefund: BigNumberish) => {
                    it('ignores any other op data', async () => {
                      op.maxFeePerGas = 123123
                      op.maxPriorityFeePerGas = 72834579
                      op.initCode = '0x2222'
                      op.sender = other.address
                      op.callData = '0x1111'
                      op.callGas = 123
                      op.verificationGas = 4
                      op.preVerificationGas = 49172
                      op.paymaster = guardian.address
                      op.paymasterData = '0xabcd'

                      requestId = await wallet.getRequestId(op)
                      op.signature = await wallet.signWithOwner(op, requestId)

                      await expect(wallet.validateUserOp(op, requestId, prefund, { from })).not.to.be.reverted
                    })
                  }

                  context('when no prefund is required', () => {
                    const prefund = 0

                    itIncreasesTheWalletNonce(prefund)

                    itIgnoresAnyOtherOpData(prefund)

                    it('does not transfer any funds to the entry point', async () => {
                      const previousWalletBalance = await ethers.provider.getBalance(wallet.address)
                      const previousEntryPointBalance = await ethers.provider.getBalance(wallet.entryPoint.address)

                      await wallet.validateUserOp(op, requestId, prefund, { from })

                      const currentWalletBalance = await ethers.provider.getBalance(wallet.address)
                      expect(currentWalletBalance).to.be.equal(previousWalletBalance)

                      const currentEntryPointBalance = await ethers.provider.getBalance(wallet.entryPoint.address)
                      expect(currentEntryPointBalance).to.be.equal(previousEntryPointBalance)
                    })
                  })

                  context('when a prefund is required', () => {
                  const prefund = fp(1)

                  context('when the wallet has some funds', () => {
                    beforeEach('fund wallet', async () => {
                      await owner.sendTransaction({ to: wallet.address, value: prefund })
                    })

                    context('when the entry point does not reverts', () => {
                      beforeEach('mock entry point', async () => {
                        await wallet.entryPoint.mockReceiveRevert(false)
                      })

                      itIncreasesTheWalletNonce(prefund)

                      itIgnoresAnyOtherOpData(prefund)

                      it('transfers the requested prefund to the entry point', async () => {
                        const previousWalletBalance = await ethers.provider.getBalance(wallet.address)
                        const previousEntryPointBalance = await ethers.provider.getBalance(wallet.entryPoint.address)

                        await wallet.validateUserOp(op, requestId, prefund, { from })

                        const currentWalletBalance = await ethers.provider.getBalance(wallet.address)
                        expect(currentWalletBalance).to.be.equal(previousWalletBalance.sub(prefund))

                        const currentEntryPointBalance = await ethers.provider.getBalance(wallet.entryPoint.address)
                        expect(currentEntryPointBalance).to.be.equal(previousEntryPointBalance.add(prefund))
                      })
                    })

                    context('when the entry point reverts', () => {
                      beforeEach('mock entry point', async () => {
                        await wallet.entryPoint.mockReceiveRevert(true)
                      })

                      it('reverts', async () => {
                        await expect(wallet.validateUserOp(op, requestId, prefund, { from })).to.be.revertedWith('ENTRY_POINT_RECEIVE_FAILED')
                      })
                    })
                  })

                  context('when the wallet does not have funds', () => {
                    it('reverts', async () => {
                      await expect(wallet.validateUserOp(op, requestId, prefund, { from })).to.be.revertedWith('Address: insufficient balance')
                    })
                  })
                })
                })

                context('when the op is signed by someone else', () => {
                  beforeEach('sign op', async () => {
                    const signature = await guardian.signMessage(ethers.utils.arrayify(requestId))
                    op.signature = encodeSignatures(type, { signer: guardian.address, signature })
                  })

                  it('reverts', async () => {
                    await expect(wallet.validateUserOp(op, requestId, { from })).to.be.revertedWith('Wallet: Invalid owner sig')
                  })
                })
              })

              context('when the given nonce is not correct', () => {
                beforeEach('change nonce and sign op', async () => {
                  op.nonce = 10
                  requestId = await wallet.getRequestId(op)
                  op.signature = await wallet.signWithOwner(op, requestId)
                })

                it('reverts', async () => {
                  await expect(wallet.validateUserOp(op, requestId, { from })).to.be.revertedWith('Wallet: Invalid nonce')
                })
              })
            })

            context('when the signed request ID does not match the one given', () => {
              const requestId = ZERO_BYTES32

              beforeEach('sign op', async () => {
                const requestId = await wallet.getRequestId(op)
                op.signature = await wallet.signWithOwner(op, requestId)
              })

              it('reverts', async () => {
                await expect(wallet.validateUserOp(op, requestId, { from })).to.be.revertedWith('Wallet: Invalid owner sig')
              })
            })
          })

          context('when signed by the guardians', () => {
            const type = Wallet.GUARDIANS_SIGNATURE

            context('when some calldata is given', () => {
              context('when the guardian is transferring ownership', () => {
                beforeEach('set calldata', async  () => {
                  op.callData = await encodeWalletOwnerTransfer(guardian)
                })

                context('when the signed request ID matches the one given', () => {
                  beforeEach('compute request ID', async () => {
                    requestId = await wallet.getRequestId(op)
                  })

                  context('when the op is signed by a guardian', () => {
                    beforeEach('sign op', async () => {
                      op.signature = await wallet.signWithGuardians(op, requestId)
                    })

                    context('when the amount of signatures is above the min required', () => {
                      const itIncreasesTheWalletNonce = (prefund: BigNumberish) => {
                        it('increases the wallet nonce', async () => {
                          const previousNonce = await wallet.nonce()

                          await wallet.validateUserOp(op, requestId, prefund, { from })

                          expect(await wallet.nonce()).to.be.equal(previousNonce.add(1))
                        })
                      }

                      const itIgnoresAnyOtherOpData = (prefund: BigNumberish) => {
                        it('ignores any other op data', async () => {
                          op.maxFeePerGas = 123123
                          op.maxPriorityFeePerGas = 72834579
                          op.initCode = '0x2222'
                          op.sender = other.address
                          op.callGas = 123
                          op.verificationGas = 4
                          op.preVerificationGas = 49172
                          op.paymaster = guardian.address
                          op.paymasterData = '0xabcd'

                          requestId = await wallet.getRequestId(op)
                          op.signature = await wallet.signWithGuardians(op, requestId)

                          await expect(wallet.validateUserOp(op, requestId, prefund, { from })).not.to.be.reverted
                        })
                      }

                      context('when no prefund is required', () => {
                        const prefund = 0

                        itIncreasesTheWalletNonce(prefund)

                        itIgnoresAnyOtherOpData(prefund)

                        it('does not transfer any funds to the entry point', async () => {
                          const previousWalletBalance = await ethers.provider.getBalance(wallet.address)
                          const previousEntryPointBalance = await ethers.provider.getBalance(wallet.entryPoint.address)

                          await wallet.validateUserOp(op, requestId, prefund, { from })

                          const currentWalletBalance = await ethers.provider.getBalance(wallet.address)
                          expect(currentWalletBalance).to.be.equal(previousWalletBalance)

                          const currentEntryPointBalance = await ethers.provider.getBalance(wallet.entryPoint.address)
                          expect(currentEntryPointBalance).to.be.equal(previousEntryPointBalance)
                        })
                      })

                      context('when a prefund is required', () => {
                        const prefund = fp(1)

                        context('when the wallet has some funds', () => {
                          beforeEach('fund wallet', async () => {
                            await owner.sendTransaction({ to: wallet.address, value: prefund })
                          })

                          context('when the entry point does not reverts', () => {
                            beforeEach('mock entry point', async () => {
                              await wallet.entryPoint.mockReceiveRevert(false)
                            })

                            itIncreasesTheWalletNonce(prefund)

                            itIgnoresAnyOtherOpData(prefund)

                            it('transfers the requested prefund to the entry point', async () => {
                              const previousWalletBalance = await ethers.provider.getBalance(wallet.address)
                              const previousEntryPointBalance = await ethers.provider.getBalance(wallet.entryPoint.address)

                              await wallet.validateUserOp(op, requestId, prefund, { from })

                              const currentWalletBalance = await ethers.provider.getBalance(wallet.address)
                              expect(currentWalletBalance).to.be.equal(previousWalletBalance.sub(prefund))

                              const currentEntryPointBalance = await ethers.provider.getBalance(wallet.entryPoint.address)
                              expect(currentEntryPointBalance).to.be.equal(previousEntryPointBalance.add(prefund))
                            })
                          })

                          context('when the entry point reverts', () => {
                            beforeEach('mock entry point', async () => {
                              await wallet.entryPoint.mockReceiveRevert(true)
                            })

                            it('reverts', async () => {
                              await expect(wallet.validateUserOp(op, requestId, prefund, { from })).to.be.revertedWith('ENTRY_POINT_RECEIVE_FAILED')
                            })
                          })
                        })

                        context('when the wallet does not have funds', () => {
                          it('reverts', async () => {
                            await expect(wallet.validateUserOp(op, requestId, prefund, { from })).to.be.revertedWith('Address: insufficient balance')
                          })
                        })
                      })
                    })

                    context('when the amount of signatures is below the min required', () => {
                    beforeEach('add guardians', async () => {
                      const [guardian2, guardian3, guardian4] = await getSigners(3, 4)
                      await wallet.grantGuardian(guardian2, { from })
                      await wallet.grantGuardian(guardian3, { from })
                      await wallet.grantGuardian(guardian4, { from })
                    })

                    it('reverts', async () => {
                      await expect(wallet.validateUserOp(op, requestId, { from })).to.be.revertedWith('Wallet: Insufficient guardians')
                    })
                  })
                  })

                  context('when the op is signed by someone else', () => {
                    beforeEach('sign op', async () => {
                      const signature = await other.signMessage(ethers.utils.arrayify(requestId))
                      op.signature = encodeSignatures(type, { signer: other.address, signature })
                    })

                    it('reverts', async () => {
                      await expect(wallet.validateUserOp(op, requestId, { from })).to.be.revertedWith('Wallet: Not a guardian')
                    })
                  })
                })

                context('when the signed request ID does not match the one given', () => {
                  requestId = ZERO_BYTES32

                  beforeEach('sign op', async () => {
                    op.signature = await wallet.signWithGuardians(op, await wallet.getRequestId(op))
                  })

                  it('reverts', async () => {
                    await expect(wallet.validateUserOp(op, requestId, { from })).to.be.revertedWith('Wallet: Invalid guardian sig')
                  })
                })
              })

              context.skip('when the guardian is approving tokens', () => {
                let token: Contract

                // TODO: AUDIT! It requires having a prefund greater than zero which doesn't make sense for paymasters

                beforeEach('deploy token', async () => {
                  token = await deploy('TokenMock', ['USDC'])
                })

                context('when the guardian is approving tokens to the paymaster', () => {
                  beforeEach('set calldata', async  () => {
                    op.paymasterData = '0xabcd'
                    op.paymaster = wallet.address
                    op.callData = await encodeWalletExecute(token, await encodeTokenApproval(wallet, fp(10)))
                  })

                  context('when the signed request ID matches the one given', () => {
                    beforeEach('compute request ID', async () => {
                      requestId = await wallet.getRequestId(op)
                    })

                    context('when the op is signed by a guardian', () => {
                      beforeEach('sign op', async () => {
                        op.signature = await wallet.signWithGuardians(op, requestId)
                      })

                      context('when the amount of signatures is above the min required', () => {
                        it('increases the wallet nonce', async () => {
                          const previousNonce = await wallet.nonce()

                          await wallet.validateUserOp(op, requestId, { from })

                          expect(await wallet.nonce()).to.be.equal(previousNonce.add(1))
                        })

                        it('ignores any other op data', async () => {
                          op.maxFeePerGas = 123123
                          op.maxPriorityFeePerGas = 72834579
                          op.initCode = '0x2222'
                          op.sender = other.address
                          op.callGas = 123
                          op.verificationGas = 4
                          op.preVerificationGas = 49172
                          op.paymaster = guardian.address
                          op.paymasterData = '0xabcd'

                          requestId = await wallet.getRequestId(op)
                          op.signature = await wallet.signWithGuardians(op, requestId)

                          await expect(wallet.validateUserOp(op, requestId, { from })).not.to.be.reverted
                        })

                        it('does not transfer any funds to the entry point', async () => {
                          const previousWalletBalance = await ethers.provider.getBalance(wallet.address)
                          const previousEntryPointBalance = await ethers.provider.getBalance(wallet.entryPoint.address)

                          await wallet.validateUserOp(op, requestId, { from })

                          const currentWalletBalance = await ethers.provider.getBalance(wallet.address)
                          expect(currentWalletBalance).to.be.equal(previousWalletBalance)

                          const currentEntryPointBalance = await ethers.provider.getBalance(wallet.entryPoint.address)
                          expect(currentEntryPointBalance).to.be.equal(previousEntryPointBalance)
                        })
                      })

                      context('when the amount of signatures is below the min required', () => {
                        beforeEach('add guardians', async () => {
                          const [guardian2, guardian3, guardian4] = await getSigners(3, 4)
                          await wallet.grantGuardian(guardian2, { from })
                          await wallet.grantGuardian(guardian3, { from })
                          await wallet.grantGuardian(guardian4, { from })
                        })

                        it('reverts', async () => {
                          await expect(wallet.validateUserOp(op, requestId, { from })).to.be.revertedWith('Wallet: Insufficient guardians')
                        })
                      })
                    })

                    context('when the op is signed by someone else', () => {
                      beforeEach('sign op', async () => {
                        const signature = await other.signMessage(ethers.utils.arrayify(requestId))
                        op.signature = encodeSignatures(type, { signer: other.address, signature })
                      })

                      it('reverts', async () => {
                        await expect(wallet.validateUserOp(op, requestId, { from })).to.be.revertedWith('Wallet: Not a guardian')
                      })
                    })
                  })

                  context('when the signed request ID does not match the one given', () => {
                    requestId = ZERO_BYTES32

                    beforeEach('sign op', async () => {
                      op.signature = await wallet.signWithGuardians(op, await wallet.getRequestId(op))
                    })

                    it('reverts', async () => {
                      await expect(wallet.validateUserOp(op, requestId, { from })).to.be.revertedWith('Wallet: Invalid guardian sig')
                    })
                  })
                })

                context('when the guardian is approving tokens to someone else', () => {
                  beforeEach('set calldata', async  () => {
                    op.paymasterData = '0xabcd'
                    op.paymaster = wallet.address
                    op.callData = await encodeWalletExecute(token, await encodeTokenApproval(guardian, fp(10)))
                  })

                  beforeEach('sign op', async  () => {
                    requestId = await wallet.getRequestId(op)
                    op.signature = await wallet.signWithGuardians(op, requestId)
                  })

                  it('reverts', async () => {
                    await expect(wallet.validateUserOp(op, requestId, { from })).to.be.revertedWith('Invalid guardian action')
                  })
                })
              })

              context('when the guardian is trying to make another call', () => {
                beforeEach('set calldata', async  () => {
                  const mock = await deploy('Counter')
                  op.callData = await encodeWalletExecute(mock, await encodeCounterIncrement())
                })

                beforeEach('sign op', async  () => {
                  requestId = await wallet.getRequestId(op)
                  op.signature = await wallet.signWithGuardians(op, requestId)
                })

                it('reverts', async () => {
                  await expect(wallet.validateUserOp(op, requestId, { from })).to.be.revertedWith('Invalid guardian action')
                })
              })
            })

            context('when no calldata is given', () => {
              beforeEach('sign op', async () => {
                requestId = await wallet.getRequestId(op)
                op.signature = await wallet.signWithGuardians(op, requestId)
              })

              it('reverts', async () => {
                await expect(wallet.validateUserOp(op, requestId, { from })).to.be.revertedWith('Wallet: Invalid guardian action')
              })
            })
          })
        })

        context('when the signature cannot be decoded', () => {
          beforeEach('set bad signature', () => {
            op.signature = '0xabcdef'
          })

          it('reverts', async () => {
            await expect(wallet.validateUserOp(op, ZERO_BYTES32, 0, { from })).to.be.reverted
          })
        })
      })

      context('when no signature is given', () => {
        it('reverts', async () => {
          await expect(wallet.validateUserOp(op, ZERO_BYTES32, 0, { from })).to.be.reverted
        })
      })
    })

    context('when the sender is not the entry point', () => {
      let from: SignerWithAddress

      beforeEach('set sender', async () => {
        from = other
      })

      it('reverts', async () => {
        await expect(wallet.validateUserOp(op, ZERO_BYTES32, 0, { from })).to.be.revertedWith('Wallet: Not from EntryPoint')
      })
    })
  })

  describe('validatePaymasterUserOp', () => {
    let op: UserOp, paymaster: Wallet
    let paymasterOwner: SignerWithAddress, paymasterGuardian: SignerWithAddress

    beforeEach('deploy paymaster', async () => {
      [paymasterOwner, paymasterGuardian] = await getSigners(2, 5)
      paymaster = await Wallet.create({ owner: paymasterOwner, guardians: [paymasterGuardian] })
    })

    beforeEach('build op', () => {
      // These are required fields the op must have filled in order to allow the wallet decoding properly
      // It must have any calldata cause it will check the paymaster allowance is not changing
      op = buildOp({ sender: wallet.address, paymaster: paymaster.address, callData: '0xabcdef1111' })
    })

    context('when a signature is given', () => {
      context('when the signature can be decoded', () => {
        let token: Contract, feed: Contract
        const fee = bn(100000), exchangeRate = fp(2)

        beforeEach('prepare paymaster data', async () => {
          token = await deploy('TokenMock', ['USDC'])
          feed = await deploy('PriceFeedMock', [18, exchangeRate])
        })

        const signPaymasterData = async (signer = paymasterOwner) => {
          const data = encodePaymasterData(op, fee, token, feed)
          const signature = await signer.signMessage(ethers.utils.arrayify((data)))
          return encodePaymasterSignature(fee, token, feed, signature)
        }

        context('when the signer is the paymaster owner', () => {
          beforeEach('sign op', async () => {
            op.paymasterData = await signPaymasterData(paymasterOwner)
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
                const tokenApprovalData = await encodeTokenApproval(op.paymaster, expectedCost)
                await wallet.executeUserOp(token, tokenApprovalData, { from: wallet.entryPoint })
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
                    const signature = await paymasterOwner.signMessage(ethers.utils.arrayify((data)))
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
                const tokenApprovalData = await encodeTokenApproval(op.paymaster, expectedCost)
                await wallet.executeUserOp(token, tokenApprovalData, { from: wallet.entryPoint })
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
                    const signature = await paymasterOwner.signMessage(ethers.utils.arrayify((data)))
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

        context('when the signer is not the paymaster owner', () => {
          beforeEach('sign op', async () => {
            op.paymasterData = await signPaymasterData(paymasterGuardian)
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

  describe('executeUserOp', () => {
    context('when the sender is the entry point', () => {
      let from: Contract

      beforeEach('set sender', async () => {
        from = wallet.entryPoint
      })

      context('when the call does not revert', () => {
        let mock: Contract

        beforeEach('deploy mock', async () => {
          mock = await deploy('Counter')
        })

        context('when the call does not require ETH', () => {
          it('executes the call', async () => {
            const receipt = await wallet.executeUserOp(mock, await encodeCounterIncrement(), { from })
            await assertIndirectEvent(receipt, mock.interface, 'Incremented')
          })

          it('does not affect the wallet balance', async () => {
            const previousBalance = await ethers.provider.getBalance(wallet.address)

            await wallet.executeUserOp(mock, await encodeCounterIncrement(), { from })

            const currentBalance = await ethers.provider.getBalance(wallet.address)
            expect(currentBalance).to.be.equal(previousBalance)
          })
        })

        context('when the call requires ETH', () => {
          const value = fp(1)

          context('when the wallet has funds', () => {
            beforeEach('transfer funds', async () => {
              await owner.sendTransaction({ to: wallet.address, value })
            })

            it('executes the call', async () => {
              const receipt = await wallet.executeUserOp(mock, await encodeCounterIncrement(), { from })
              await assertIndirectEvent(receipt, mock.interface, 'Incremented')
            })

            it('transfers funds', async () => {
              const previousBalance = await ethers.provider.getBalance(mock.address)

              await wallet.executeUserOp(mock, await encodeCounterIncrement(), value, { from })

              const currentBalance = await ethers.provider.getBalance(mock.address)
              expect(currentBalance).to.be.equal(previousBalance.add(value))
            })
          })

          context('when the wallet does not have funds', () => {
            it('reverts', async () => {
              await expect(wallet.executeUserOp(mock, await encodeCounterIncrement(), value, { from })).to.be.reverted
            })
          })
        })
      })

      context('when the call reverts', () => {
        let mock: Contract

        beforeEach('deploy mock', async () => {
          mock = await deploy('Reverter')
        })

        it('reverts', async () => {
          await expect(wallet.executeUserOp(mock, await encodeReverterFail(), { from })).to.be.revertedWith('REVERTED')
        })
      })
    })

    context('when the sender is not the entry point', () => {
      let from: SignerWithAddress

      beforeEach('set sender', async () => {
        from = other
      })

      it('reverts', async () => {
        await expect(wallet.executeUserOp(ZERO_ADDRESS, '0x', { from })).to.be.revertedWith('Wallet: Not from EntryPoint')
      })
    })
  })

  describe('postOp', () => {
    let token: Contract, contextData: string
    const fee = bn(10), exchangeRate = fp(2), actualGasCost = fp(1)

    beforeEach('build context', async () => {
      token = await deploy('TokenMock', ['USDC'])
      const params = [other.address, token.address, exchangeRate, fee]
      contextData = ethers.utils.defaultAbiCoder.encode(['address', 'address', 'uint256', 'uint256'], params)
    })

    context('when the sender is the entry point', () => {
      let from: Contract

      beforeEach('set sender', async () => {
        from = wallet.entryPoint
      })

      context('when the payer has approved the wallet enough tokens', () => {
        beforeEach('approve tokens', async () => {
          await token.connect(other).approve(wallet.address, MAX_UINT256)
        })

        context('when the payer has approved the wallet enough tokens', () => {
          beforeEach('approve tokens', async () => {
            await token.mint(other.address, fp(100))
          })

          it('transfers the tokens', async () => {
            const previousSenderBalance = await token.balanceOf(other.address)
            const previousWalletBalance = await token.balanceOf(wallet.address)

            await wallet.postOp(contextData, actualGasCost, { from })

            const expectedCost = actualGasCost.mul(exchangeRate).div(fp(1)).add(fee)
            const currentSenderBalance = await token.balanceOf(other.address)
            expect(currentSenderBalance).to.be.equal(previousSenderBalance.sub(expectedCost))

            const currentWalletBalance = await token.balanceOf(wallet.address)
            expect(currentWalletBalance).to.be.equal(previousWalletBalance.add(expectedCost))
          })
        })

        context('when the payer does not have enough tokens', () => {
          it('reverts', async () => {
            await expect(wallet.postOp(contextData, actualGasCost, { from })).to.be.revertedWith('ERC20: transfer amount exceeds balance')
          })
        })
      })

      context('when the payer has not approved the wallet enough tokens', () => {
        it('reverts', async () => {
          await expect(wallet.postOp(contextData, actualGasCost, { from })).to.be.revertedWith('ERC20: insufficient allowance')
        })
      })
    })

    context('when the sender is not the entry point', () => {
      let from: SignerWithAddress

      beforeEach('set sender', async () => {
        from = other
      })

      it('reverts', async () => {
        await expect(wallet.postOp(contextData, actualGasCost, { from })).to.be.revertedWith('Wallet: Not from EntryPoint')
      })
    })
  })

  describe('receive', () => {
    const amount = fp(1)

    it('accepts ETH from anyone', async () => {
      await other.sendTransaction({ to: wallet.address, value: amount })
      await guardian.sendTransaction({ to: wallet.address, value: amount })

      expect(await ethers.provider.getBalance(wallet.address)).to.be.equal(amount.mul(2))
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
        const result = await wallet.isValidSignature(message, signature)
        expect(result).to.be.equal(wallet.instance.interface.getSighash('isValidSignature(bytes32,bytes)'))
      })
    })

    context('when the given message was not signed by the owner', () => {
      let signature: string

      beforeEach('sign message', async () => {
        signature = await guardian.signMessage('Test message!')
      })

      it('reverts', async () => {
        await expect(wallet.isValidSignature(message, signature)).to.be.revertedWith('Wallet: Invalid signature')
      })
    })
  })

  describe('transferOwner', () => {
    context('when the sender is the entry point', () => {
      let from: Contract

      beforeEach('set sender', async () => {
        from = wallet.entryPoint
      })

      context('when the new owner is not the address zero', () => {
        it('transfer ownership to the recipient', async () => {
          await wallet.transferOwner(other, { from })

          expect(await wallet.getOwnerCount()).to.be.equal(1)
          expect(await wallet.getRoleMemberCount(OWNER_ROLE)).to.be.equal(1)
          expect(await wallet.hasRole(OWNER_ROLE, owner)).to.be.false
          expect(await wallet.hasRole(OWNER_ROLE, other)).to.be.true
          expect(await wallet.getOwner(0)).to.be.equal(other.address)
        })
      })

      context('when the new owner is the address zero', () => {
        // TODO: fix

        it.skip('reverts', async () => {
          await expect(wallet.transferOwner(ZERO_ADDRESS, { from })).to.be.reverted
        })
      })
    })

    context('when the sender is not the entry point', () => {
      let from: SignerWithAddress

      beforeEach('set sender', async () => {
        from = other
      })

      it('reverts', async () => {
        await expect(wallet.transferOwner(other, { from })).to.be.revertedWith('Wallet: Not from EntryPoint')
      })
    })
  })

  describe('grantGuardian', () => {
    context('when the sender is the entry point', () => {
      let from: Contract

      beforeEach('set sender', async () => {
        from = wallet.entryPoint
      })

      context('when the recipient is not the owner', () => {
        context('when the recipient was not a guardian yet', () => {
          it('grants the guardian role to the recipient', async () => {
            await wallet.grantGuardian(other, { from })

            expect(await wallet.getGuardianCount()).to.be.equal(2)
            expect(await wallet.getRoleMemberCount(GUARDIAN_ROLE)).to.be.equal(2)
            expect(await wallet.hasRole(GUARDIAN_ROLE, guardian)).to.be.true
            expect(await wallet.hasRole(GUARDIAN_ROLE, other)).to.be.true
            expect(await wallet.getGuardian(0)).to.be.equal(guardian.address)
            expect(await wallet.getGuardian(1)).to.be.equal(other.address)
          })
        })

        context('when the recipient was already a guardian', () => {
          it('does not affect the guardian list', async () => {
            await wallet.grantGuardian(guardian, { from })

            expect(await wallet.getGuardianCount()).to.be.equal(1)
            expect(await wallet.getRoleMemberCount(GUARDIAN_ROLE)).to.be.equal(1)
            expect(await wallet.hasRole(GUARDIAN_ROLE, guardian)).to.be.true
            expect(await wallet.getGuardian(0)).to.be.equal(guardian.address)
          })
        })
      })

      context('when the recipient is the owner', () => {
        it('reverts', async () => {
          await expect(wallet.grantGuardian(owner, { from })).to.be.revertedWith('Wallet: Owner cannot be guardian')
        })
      })
    })

    context('when the sender is not the entry point', () => {
      let from: SignerWithAddress

      beforeEach('set sender', async () => {
        from = other
      })

      it('reverts', async () => {
        await expect(wallet.grantGuardian(other, { from })).to.be.revertedWith('Wallet: Not from EntryPoint')
      })
    })
  })

  describe('revokeGuardian', () => {
    context('when the sender is the entry point', () => {
      let from: Contract

      beforeEach('set sender', async () => {
        from = wallet.entryPoint
      })

      context('when the recipient was already a guardian', () => {
        it('revokes the guardian role to the recipient', async () => {
          await wallet.revokeGuardian(guardian, { from })

          expect(await wallet.getGuardianCount()).to.be.equal(0)
          expect(await wallet.getRoleMemberCount(GUARDIAN_ROLE)).to.be.equal(0)
          expect(await wallet.hasRole(GUARDIAN_ROLE, guardian)).to.be.false
        })
      })

      context('when the recipient was not a guardian', () => {
        it('does not affect the guardian list', async () => {
          await wallet.revokeGuardian(other, { from })

          expect(await wallet.getGuardianCount()).to.be.equal(1)
          expect(await wallet.getRoleMemberCount(GUARDIAN_ROLE)).to.be.equal(1)
          expect(await wallet.hasRole(GUARDIAN_ROLE, guardian)).to.be.true
          expect(await wallet.getGuardian(0)).to.be.equal(guardian.address)
        })
      })
    })

    context('when the sender is not the entry point', () => {
      let from: SignerWithAddress

      beforeEach('set sender', async () => {
        from = other
      })

      it('reverts', async () => {
        await expect(wallet.revokeGuardian(other, { from })).to.be.revertedWith('Wallet: Not from EntryPoint')
      })
    })
  })

  describe('upgradeTo', () => {
    let newImplementation: Contract

    context('when the sender is the entry point', () => {
      let from: Contract

      beforeEach('set sender', async () => {
        from = wallet.entryPoint
      })

      context('when the new implementation is UUPS-compliant', () => {
        beforeEach('deploy new UUPS-compliant implementation', async () => {
          newImplementation = await deploy('Wallet')
        })

        it('upgrades to the new implementation', async () => {
          await wallet.upgradeTo(newImplementation, { from })

          expect(await wallet.getCurrentImplementation()).to.be.equal(newImplementation.address)
        })
      })

      context('when the new implementation is not UUPS-compliant', () => {
        beforeEach('deploy non UUPS-compliant implementation', async () => {
          newImplementation = await deploy('TokenMock', ['TKN'])
        })

        it('reverts', async () => {
          await expect(wallet.upgradeTo(newImplementation, { from })).to.be.revertedWith('ERC1967Upgrade: new implementation is not UUPS')
        })
      })
    })

    context('when the sender is not the entry point', () => {
      let from: SignerWithAddress

      beforeEach('set sender', async () => {
        from = other
      })

      it('reverts', async () => {
        await expect(wallet.upgradeTo(newImplementation, { from })).to.be.revertedWith('Wallet: Not from EntryPoint')
      })
    })
  })
})
