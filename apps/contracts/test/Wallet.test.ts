import { expect } from 'chai'
import { ethers } from 'hardhat'
import { Contract } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'

import { fp } from './utils/helpers/numbers'
import { getSigners } from './utils/helpers/signers'
import { deploy, instanceAt } from './utils/helpers/contracts'
import { assertIndirectEvent } from './utils/helpers/asserts'
import { ZERO_ADDRESS, ZERO_BYTES32 } from './utils/helpers/constants'
import {
  encodeCounterIncrement,
  encodePaymasterData,
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
                    op.signature = await wallet.signRequestIdWithOwner(op)
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
                      op.signature = await wallet.signRequestIdWithOwner(op)

                      requestId = await wallet.getRequestId(op)
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
                    await expect(wallet.validateUserOp(op, requestId, { from })).to.be.revertedWith('ACL: Signer not an owner')
                  })
                })
              })

              context('when the given nonce is not correct', () => {
                beforeEach('change nonce and sign op', async () => {
                  op.nonce = 10
                  op.signature = await wallet.signRequestIdWithOwner(op)
                })

                it('reverts', async () => {
                  await expect(wallet.validateUserOp(op, requestId, { from })).to.be.revertedWith('Wallet: Invalid nonce')
                })
              })
            })

            context('when the signed request ID does not match the one given', () => {
              const requestId = ZERO_BYTES32

              beforeEach('sign op', async () => {
                op.signature = await wallet.signRequestIdWithOwner(op)
              })

              it('reverts', async () => {
                await expect(wallet.validateUserOp(op, requestId, { from })).to.be.revertedWith('ACL: Invalid owner sig')
              })
            })
          })

          context('when signed by the guardians', () => {
            const type = Wallet.GUARDIANS_SIGNATURE

            context('when the wallet allows some guardians', () => {
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
                        op.signature = await wallet.signRequestIdWithGuardians(op)
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
                            op.signature = await wallet.signRequestIdWithGuardians(op)

                            requestId = await wallet.getRequestId(op)
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
                        await expect(wallet.validateUserOp(op, requestId, { from })).to.be.revertedWith('ACL: Signer not a guardian')
                      })
                    })
                  })

                  context('when the signed request ID does not match the one given', () => {
                    requestId = ZERO_BYTES32

                    beforeEach('sign op', async () => {
                      op.signature = await wallet.signRequestIdWithGuardians(op)
                    })

                    it('reverts', async () => {
                      await expect(wallet.validateUserOp(op, requestId, { from })).to.be.revertedWith('ACL: Invalid guardian sig')
                    })
                  })
                })

                context('when the guardian is approving tokens', () => {
                  let token: Contract

                  beforeEach('deploy token', async () => {
                    token = await deploy('TokenMock', ['DAI', 18])
                  })

                  context('when the guardian is approving tokens to the paymaster', () => {
                    beforeEach('set calldata', async  () => {
                      op.paymaster = wallet.address
                      op.callData = await encodeWalletExecute(token, await encodeTokenApproval(wallet, fp(10)))
                    })

                    context('when the token being approved matches the token fee used by the paymaster', () => {
                      beforeEach('set calldata', async  () => {
                        op.paymasterData = encodePaymasterData({ token, feed: token, mode: 0, fee: 0 }, '0x')
                      })

                      context('when the signed request ID matches the one given', () => {
                        beforeEach('compute request ID', async () => {
                          requestId = await wallet.getRequestId(op)
                        })

                        context('when the op is signed by a guardian', () => {
                          beforeEach('sign op', async () => {
                            op.signature = await wallet.signRequestIdWithGuardians(op)
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
                              op.signature = await wallet.signRequestIdWithGuardians(op)

                              requestId = await wallet.getRequestId(op)
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
                            await expect(wallet.validateUserOp(op, requestId, { from })).to.be.revertedWith('ACL: Signer not a guardian')
                          })
                        })
                      })

                      context('when the signed request ID does not match the one given', () => {
                        requestId = ZERO_BYTES32

                        beforeEach('sign op', async () => {
                          op.signature = await wallet.signRequestIdWithGuardians(op)
                        })

                        it('reverts', async () => {
                          await expect(wallet.validateUserOp(op, requestId, { from })).to.be.revertedWith('ACL: Invalid guardian sig')
                        })
                      })
                    })

                    context('when the token being approved does not match the token fee used by the paymaster', () => {
                      beforeEach('set paymaster data', async  () => {
                        const anotherToken = await deploy('TokenMock', ['DAI', 18])
                        op.paymasterData = encodePaymasterData({ token: anotherToken, feed: token, mode: 0, fee: 0 }, '0x')
                      })

                      beforeEach('sign op', async  () => {
                        op.signature = await wallet.signRequestIdWithGuardians(op)
                      })

                      it('reverts', async () => {
                        await expect(wallet.validateUserOp(op, requestId, { from })).to.be.revertedWith('Invalid guardian action')
                      })
                    })
                  })

                  context('when the guardian is approving tokens to someone else', () => {
                    beforeEach('set calldata', async  () => {
                      op.callData = await encodeWalletExecute(token, await encodeTokenApproval(guardian, fp(10)))
                    })

                    beforeEach('sign op', async  () => {
                      op.signature = await wallet.signRequestIdWithGuardians(op)
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
                    op.signature = await wallet.signRequestIdWithGuardians(op)
                  })

                  it('reverts', async () => {
                    await expect(wallet.validateUserOp(op, requestId, { from })).to.be.revertedWith('Invalid guardian action')
                  })
                })
              })

              context('when no calldata is given', () => {
                beforeEach('sign op', async () => {
                  op.signature = await wallet.signRequestIdWithGuardians(op)
                })

                it('reverts', async () => {
                  await expect(wallet.validateUserOp(op, requestId, { from })).to.be.revertedWith('Wallet: Invalid guardian action')
                })
              })
            })

            context('when there are no guardians in the wallet', () => {
              beforeEach('revoke guardians and sign op', async () => {
                await wallet.revokeGuardian(guardian, { from })
                op.signature = await wallet.signRequestIdWithGuardians(op)
              })

              it('reverts', async () => {
                await expect(wallet.validateUserOp(op, requestId, { from })).to.be.revertedWith('Wallet: No guardians allowed')
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
        await expect(wallet.validateUserOp(op, ZERO_BYTES32, 0, { from })).to.be.revertedWith('ACL: sender not allowed')
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

        context('when the call is only to transfer ETH', () => {
          const value = fp(1)

          context('when the wallet has funds', () => {
            beforeEach('transfer funds', async () => {
              await owner.sendTransaction({ to: wallet.address, value })
            })

            it('transfers funds', async () => {
              const previousBalance = await ethers.provider.getBalance(guardian.address)

              await wallet.executeUserOp(guardian, '0x', value, { from })

              const currentBalance = await ethers.provider.getBalance(guardian.address)
              expect(currentBalance).to.be.equal(previousBalance.add(value))
            })
          })

          context('when the wallet does not have funds', () => {
            it('reverts', async () => {
              await expect(wallet.executeUserOp(guardian, '0x', value, { from })).to.be.reverted
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
        await expect(wallet.executeUserOp(ZERO_ADDRESS, '0x', { from })).to.be.revertedWith('ACL: sender not allowed')
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
          newImplementation = await deploy('Wallet', [wallet.entryPoint.address])
        })

        it('upgrades to the new implementation', async () => {
          await wallet.upgradeTo(newImplementation, { from })

          expect(await wallet.getCurrentImplementation()).to.be.equal(newImplementation.address)
        })

        it('works fine with storage layout changes', async () => {
          const previousEntryPoint = await wallet.instance.entryPoint()

          const v2 = await deploy('WalletV2Mock', [wallet.entryPoint.address])
          await wallet.upgradeTo(v2, { from })
          const walletV2 = await instanceAt('WalletV2Mock', wallet.address)
          expect(await wallet.getCurrentImplementation()).to.be.equal(v2.address)

          await walletV2.setX(10)
          expect(await walletV2.x()).to.be.equal(10)

          const currentEntryPoint = await walletV2.entryPoint()
          expect(currentEntryPoint).to.be.equal(previousEntryPoint)
        })
      })

      context('when the new implementation is not UUPS-compliant', () => {
        beforeEach('deploy non UUPS-compliant implementation', async () => {
          newImplementation = await deploy('TokenMock', ['TKN', 18])
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
        await expect(wallet.upgradeTo(newImplementation, { from })).to.be.revertedWith('ACL: sender not allowed')
      })
    })
  })
})
