import { expect } from 'chai'
import { ethers } from 'hardhat'
import { Contract } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'

import User from './utils/models/user/User'
import Paymaster from './utils/models/paymaster/Paymaster'
import EntryPoint from './utils/models/entry-point/EntryPoint'

import { UserOp } from './utils/models/user/types'
import { bn, fp } from './utils/helpers/numbers'
import { getSigner } from './utils/helpers/signers'
import { deploy, instanceAt } from './utils/helpers/contracts'
import { advanceTime, currentTimestamp } from './utils/helpers/time'
import { assertIndirectEvent, assertNoIndirectEvent, assertWithError } from './utils/helpers/asserts'
import { ADMIN_ROLE, GUARDIAN_ROLE, MAX_UINT256, OWNER_ROLE, ZERO_ADDRESS } from './utils/helpers/constants'
import { encodeCounterIncrement, encodeReverterFail, encodeTokenApproval, encodeWalletExecute } from './utils/helpers/encoding'

describe('EntryPoint', () => {
  let entryPoint: EntryPoint

  beforeEach('deploy entry point', async () => {
    entryPoint = await EntryPoint.create()
  })

  describe('handleOps', () => {
    let op: UserOp, user: User

    const itHandleOpsProperly = (itHandlesWalletCreationProperly: Function) => {
      context('when the user specifies a verification gas value', () => {
        beforeEach('set verification gas', async () => {
          op.verificationGas = User.WALLET_VERIFICATION_GAS
        })

        context('when there is a specified call to execute', () => {
          let mock: Contract

          context('when the specified call does not revert', () => {
            beforeEach('set call data', async () => {
              mock = await deploy('Counter')
              op.callData = await encodeWalletExecute(mock, await encodeCounterIncrement())
            })

            context('when the user specifies a call gas value', () => {
              beforeEach('set call gas', async () => {
                op.callGas = User.COUNTER_CALL_WITHOUT_VALUE_GAS
              })

              context('when using the correct nonce', () => {
                beforeEach('assert nonce', async () => {
                  expect(op.nonce).to.be.equal(user.nextNonce - 1)
                })

                context('when the op was signed correctly', () => {
                  beforeEach('sign op', async () => {
                    op.signature = await user.signOp(op)
                  })

                  itHandlesWalletCreationProperly()

                  it('executes the given call', async () => {
                    const tx = await entryPoint.handleOps(op)

                    await assertIndirectEvent(tx, mock.interface, 'Incremented')
                  })

                  it('can handles ETH value', async () => {
                    const value = fp(0.001)
                    await user.transfer(op.sender, value)
                    op.callGas = User.COUNTER_CALL_WITH_VALUE_GAS
                    op.callData = await encodeWalletExecute(mock, await encodeCounterIncrement(), value)
                    op.signature = await user.signOp(op)

                    const previousCounterBalance = await ethers.provider.getBalance(mock.address)

                    await entryPoint.handleOps(op)

                    const currentCounterBalance = await ethers.provider.getBalance(mock.address)
                    expect(currentCounterBalance).to.be.equal(previousCounterBalance.add(value))
                  })

                  describe('refunds', () => {
                    const redeemer = ZERO_ADDRESS

                    context('without paymaster', () => {
                      context('when the user does not specify any gas fee', () => {
                        it('does not pay to the redeemer', async () => {
                          const previousBalance = await ethers.provider.getBalance(redeemer)

                          await entryPoint.handleOps(op, redeemer)

                          const currentBalance = await ethers.provider.getBalance(redeemer)
                          expect(currentBalance).to.be.equal(previousBalance)
                        })

                        it('does not decreases the wallet balance', async () => {
                          const previousBalance = await ethers.provider.getBalance(op.sender)

                          await entryPoint.handleOps(op, redeemer)

                          const currentBalance = await ethers.provider.getBalance(op.sender)
                          expect(currentBalance).to.be.equal(previousBalance)
                        })
                      })

                      context('when the user does not want to use a priority fee', () => {
                        // TODO: Review this implementation, the user must specify the same fee and priority fee values.

                        beforeEach('set fees', async () => {
                          op.maxFeePerGas = 1
                          op.maxPriorityFeePerGas = op.maxFeePerGas
                        })

                        context('when the user cover the costs', () => {
                          beforeEach('set high pre-verification gas and re-sign', async () => {
                            op.preVerificationGas = User.WALLET_CREATION_GAS
                            op.signature = await user.signOp(op)
                          })

                          context('when the wallet has funds', () => {
                            beforeEach('fund wallet', async () => {
                              await user.transfer(op.sender, fp(1))
                            })

                            it('pays the redeemer', async () => {
                              const expectedRefund = await entryPoint.estimatePrefund(op)
                              const previousRedeemerBalance = await ethers.provider.getBalance(redeemer)

                              await entryPoint.handleOps(op, redeemer)

                              const currentRedeemerBalance = await ethers.provider.getBalance(redeemer)
                              assertWithError(currentRedeemerBalance, previousRedeemerBalance.add(expectedRefund), 0.1)
                            })

                            it('refunds the unused gas to the wallet', async () => {
                              const previousWalletBalance = await ethers.provider.getBalance(op.sender)
                              const previousRedeemerBalance = await ethers.provider.getBalance(redeemer)

                              await entryPoint.handleOps(op, redeemer)

                              const currentRedeemerBalance = await ethers.provider.getBalance(redeemer)
                              const prefundPaid = currentRedeemerBalance.sub(previousRedeemerBalance)
                              const currentWalletBalance = await ethers.provider.getBalance(op.sender)
                              expect(currentWalletBalance.add(prefundPaid)).to.be.equal(previousWalletBalance)
                            })
                          })

                          context('when the wallet does not have funds', () => {
                            it('reverts', async () => {
                              await expect(entryPoint.handleOps(op)).to.be.revertedWith('EntryPoint: incorrect prefund')
                            })
                          })
                        })

                        context('when the user does not cover the costs', () => {
                          // TODO: AUDIT!

                          beforeEach('set low pre-verification gas and re-sign', async () => {
                            op.preVerificationGas = 100
                            op.signature = await user.signOp(op)
                            await user.transfer(op.sender, fp(1))
                          })

                          it('reverts', async () => {
                            await expect(entryPoint.handleOps(op)).to.be.revertedWith('Arithmetic operation underflowed')
                          })
                        })
                      })

                      context('when the user wants to use a priority fee', () => {
                        beforeEach('set fees', async () => {
                          op.maxFeePerGas = 1
                          op.maxPriorityFeePerGas = 2
                        })

                        context('when the user cover the costs', () => {
                          beforeEach('set high pre-verification gas and re-sign', async () => {
                            op.preVerificationGas = User.WALLET_CREATION_GAS
                            op.signature = await user.signOp(op)
                          })

                          context('when the wallet has funds', () => {
                            beforeEach('fund wallet', async () => {
                              await user.transfer(op.sender, fp(1))
                            })

                            it('pays the redeemer', async () => {
                              const expectedRefund = await entryPoint.estimatePrefund(op)
                              const previousRedeemerBalance = await ethers.provider.getBalance(redeemer)

                              await entryPoint.handleOps(op, redeemer)

                              const currentRedeemerBalance = await ethers.provider.getBalance(redeemer)
                              assertWithError(currentRedeemerBalance, previousRedeemerBalance.add(expectedRefund), 0.1)
                            })

                            it('refunds the unused gas to the wallet', async () => {
                              const previousWalletBalance = await ethers.provider.getBalance(op.sender)
                              const previousRedeemerBalance = await ethers.provider.getBalance(redeemer)

                              await entryPoint.handleOps(op, redeemer)

                              const currentRedeemerBalance = await ethers.provider.getBalance(redeemer)
                              const prefundPaid = currentRedeemerBalance.sub(previousRedeemerBalance)
                              const currentWalletBalance = await ethers.provider.getBalance(op.sender)
                              expect(currentWalletBalance.add(prefundPaid)).to.be.equal(previousWalletBalance)
                            })
                          })

                          context('when the wallet does not have funds', () => {
                            it('reverts', async () => {
                              await expect(entryPoint.handleOps(op)).to.be.revertedWith('EntryPoint: incorrect prefund')
                            })
                          })
                        })

                        context('when the user does not cover the costs', () => {
                          // TODO: AUDIT!

                          beforeEach('set low pre-verification gas and re-sign', async () => {
                            op.preVerificationGas = 100
                            op.signature = await user.signOp(op)
                            await user.transfer(op.sender, fp(1))
                          })

                          it('reverts', async () => {
                            await expect(entryPoint.handleOps(op)).to.be.revertedWith('Arithmetic operation underflowed')
                          })
                        })
                      })
                    })

                    context('with a paymaster', () => {
                      const fee = bn(100000)
                      let paymaster: Paymaster, token: Contract, feed: Contract

                      beforeEach('create paymaster', async () => {
                        token = await deploy('TokenMock', ['USDC'])
                        feed = await deploy('PriceFeedMock', [18, fp(2)])
                        paymaster = await Paymaster.createWithWallet(entryPoint)
                        op.paymaster = paymaster.address
                        await user.transfer(paymaster, fp(10))
                      })

                      context('when the paymaster does have some stake', () => {
                        beforeEach('stake a minimum', async () => {
                          await paymaster.stake(bn(1))
                        })

                        context('when the paymaster is locked', () => {
                          beforeEach('lock', async () => {
                            await paymaster.lock()
                          })

                          context('when the paymaster stake is enough', () => {
                            beforeEach('stake a big amount', async () => {
                              await paymaster.stake(fp(1))
                            })

                            context('when the wallet allows tokens to the paymaster', () => {
                              beforeEach('allow tokens to paymaster', async () => {
                                op.callGas = bn(60000)
                                op.callData = await encodeWalletExecute(token, await encodeTokenApproval(paymaster, MAX_UINT256))
                              })

                              context('when the user does not specify any gas fee', () => {
                                // TODO: Weird behavior

                                beforeEach('verify and sign op', async () => {
                                  op.paymasterData = await paymaster.signPaymasterData(op, fee, token, feed)
                                  op.signature = await user.signOp(op)
                                })

                                it('reverts', async () => {
                                  await expect(entryPoint.handleOps(op)).to.be.revertedWith('ERC20: transfer amount exceeds balance')
                                })
                              })

                              context('when the user does not want to use a priority fee', () => {
                                // TODO: Review this implementation, the user must specify the same fee and priority fee values.

                                beforeEach('set fees', async () => {
                                  op.maxFeePerGas = 1
                                  op.maxPriorityFeePerGas = op.maxFeePerGas
                                })

                                context('when the paymaster data is verified', () => {
                                  beforeEach('verify and sign op', async () => {
                                    op.paymasterData = await paymaster.signPaymasterData(op, fee, token, feed)
                                    op.signature = await user.signOp(op)
                                  })

                                  context('when the wallet has enough tokens', () => {
                                    beforeEach('send tokens to the wallet', async () => {
                                      await token.mint(op.sender, fp(10000))
                                    })

                                    itHandlesWalletCreationProperly()

                                    it('executes the given call', async () => {
                                      await entryPoint.handleOps(op)

                                      expect(await token.allowance(op.sender, paymaster.address)).to.be.equal(MAX_UINT256)
                                    })
                                  })

                                  context('when the wallet does not have enough tokens', () => {
                                    // TODO: Audit this does not follow the strategy used when checking allowances

                                    beforeEach('verify and sign op', async () => {
                                      op.paymasterData = await paymaster.signPaymasterData(op, fee, token, feed)
                                      op.signature = await user.signOp(op)
                                    })

                                    it('reverts', async () => {
                                      await expect(entryPoint.handleOps(op)).to.be.revertedWith('ERC20: transfer amount exceeds balance')
                                    })
                                  })
                                })

                                context('when the paymaster did not verify the op', () => {
                                  // TODO: no revert reason, must have failed due to bad decoding

                                  beforeEach('sign op', async () => {
                                    op.paymasterData = '0xab'
                                    op.signature = await user.signOp(op)
                                  })

                                  it('reverts', async () => {
                                    await expect(entryPoint.handleOps(op)).to.be.revertedWith('Transaction reverted')
                                  })
                                })
                              })

                              context('when the user wants to use a priority fee', () => {
                                beforeEach('set fees', async () => {
                                  op.maxFeePerGas = 1
                                  op.maxPriorityFeePerGas = 2
                                })

                                context('when the paymaster data is verified', () => {
                                  beforeEach('verify and sign op', async () => {
                                    op.paymasterData = await paymaster.signPaymasterData(op, fee, token, feed)
                                    op.signature = await user.signOp(op)
                                  })

                                  context('when the wallet has enough tokens', () => {
                                    beforeEach('send tokens to the wallet', async () => {
                                      await token.mint(op.sender, fp(10000))
                                    })

                                    itHandlesWalletCreationProperly()

                                    it('executes the given call', async () => {
                                      await entryPoint.handleOps(op)

                                      expect(await token.allowance(op.sender, paymaster.address)).to.be.equal(MAX_UINT256)
                                    })
                                  })

                                  context('when the wallet does not have enough tokens', () => {
                                    // TODO: Audit this does not follow the strategy used when checking allowances

                                    beforeEach('verify and sign op', async () => {
                                      op.paymasterData = await paymaster.signPaymasterData(op, fee, token, feed)
                                      op.signature = await user.signOp(op)
                                    })

                                    it('reverts', async () => {
                                      await expect(entryPoint.handleOps(op)).to.be.revertedWith('ERC20: transfer amount exceeds balance')
                                    })
                                  })
                                })

                                context('when the paymaster did not verify the op', () => {
                                  // TODO: no revert reason, must have failed due to bad decoding

                                  beforeEach('sign op', async () => {
                                    op.paymasterData = '0xab'
                                    op.signature = await user.signOp(op)
                                  })

                                  it('reverts', async () => {
                                    await expect(entryPoint.handleOps(op)).to.be.revertedWith('Transaction reverted')
                                  })
                                })
                              })
                            })

                            context('when the wallet does not allow the tokens to the paymaster', () => {
                              beforeEach('verify and sign op', async () => {
                                op.paymasterData = await paymaster.signPaymasterData(op, fee, token, feed)
                                op.signature = await user.signOp(op)
                              })

                              it('reverts', async () => {
                                await expect(entryPoint.handleOps(op)).to.be.revertedWith('Paymaster: Not approved')
                              })
                            })
                          })

                          context('when the paymaster stake is not enough', () => {
                            beforeEach('verify and sign op', async () => {
                              op.maxFeePerGas = 1
                              op.paymasterData = await paymaster.signPaymasterData(op, fee, token, feed)
                              op.signature = await user.signOp(op)
                            })

                            it('reverts', async () => {
                              await expect(entryPoint.handleOps(op)).to.be.revertedWith('EntryPoint: Insufficient stake')
                            })
                          })
                        })

                        context('when the paymaster is not locked', () => {
                          beforeEach('verify and sign op', async () => {
                            op.paymasterData = await paymaster.signPaymasterData(op, fee, token, feed)
                            op.signature = await user.signOp(op)
                          })

                          it('reverts', async () => {
                            await expect(entryPoint.handleOps(op)).to.be.revertedWith('EntryPoint: Stake not locked')
                          })
                        })
                      })

                      context('when the paymaster does not have any stake', () => {
                        beforeEach('verify and sign op', async () => {
                          op.paymasterData = await paymaster.signPaymasterData(op, fee, token, feed)
                          op.signature = await user.signOp(op)
                        })

                        it('reverts', async () => {
                          await expect(entryPoint.handleOps(op)).to.be.revertedWith('EntryPoint: Stake not locked')
                        })
                      })
                    })
                  })
                })

                context('when the op was signed incorrectly', () => {
                  beforeEach('sign op', async () => {
                    op.signature = await user.signOp(op)
                    op.callGas = bn(1) // adulterate message after signing
                  })

                  it('reverts', async () => {
                    await expect(entryPoint.handleOps(op)).to.be.revertedWith('Wallet: Invalid owner sig')
                  })
                })
              })

              context('when using a wrong nonce', () => {
                beforeEach('set wrong nonce and re-sign', async () => {
                  op.nonce = 1000
                  // re-calculate wallet address since nonce is used for the salt when creating the wallet
                  if (op.initCode !== '0x') op.sender = await entryPoint.getSenderAddress(op)
                  op.signature = await user.signOp(op)
                })

                it('reverts', async () => {
                  await expect(entryPoint.handleOps(op)).to.be.revertedWith('Wallet: Invalid nonce')
                })
              })
            })

            context('when the user does not specify a call gas value', () => {
              // TODO: Execute fails (revert), user should pay gas anyway

              beforeEach('set call gas and re-sign', async () => {
                op.callGas = 0
                op.signature = await user.signOp(op)
              })

              it.skip('forces to pay gas anyway', async () => {
                await entryPoint.handleOps(op)
              })
            })
          })

          context('when the specified call reverts', () => {
            // TODO: Execute fails (OOG), user should pay gas anyway

            beforeEach('set call data and re-sign', async () => {
              mock = await deploy('Reverter')
              op.callData = await encodeWalletExecute(mock, await encodeReverterFail())
              op.signature = await user.signOp(op)
            })

            it.skip('forces to pay gas anyway', async () => {
              await entryPoint.handleOps(op)
            })
          })
        })

        context('when there is no specified call to execute', () => {
          // TODO: Execute fails (calling non-contract), user should pay gas anyway

          beforeEach('sign op', async () => {
            op.signature = await user.signOp(op)
          })

          it.skip('forces to pay gas anyway', async () => {
            await entryPoint.handleOps(op)
          })
        })
      })

      context('when the user does not specify a verification gas value', () => {
        it('reverts', async () => {
          await expect(entryPoint.handleOps(op)).to.be.revertedWith('contract call run out of gas')
        })
      })
    }

    context('when the wallet was not created', () => {
      beforeEach('build empty op', async () => {
        user = await User.create(entryPoint)
        op = user.buildOp()
      })

      context('when the op includes some init code', () => {
        beforeEach('set init code', async () => {
          op.initCode = await user.getWalletDeploymentCode()
          op.sender = await entryPoint.getSenderAddress(op)
        })

        itHandleOpsProperly(() => {
          it('creates a wallet', async () => {
            await entryPoint.handleOps(op)

            const wallet = await instanceAt('Wallet', op.sender)
            expect(await wallet.entryPoint()).to.equal(entryPoint.address)
          })

          // TODO: AUDIT! This is probably not properly setup
          it('set ups access control roles', async () => {
            await entryPoint.handleOps(op)

            const wallet = await instanceAt('Wallet', op.sender)
            expect(await wallet.getRoleMemberCount(OWNER_ROLE)).to.be.equal(1)
            expect(await wallet.hasRole(OWNER_ROLE, user.signer.address)).to.be.true

            expect(await wallet.getRoleMemberCount(GUARDIAN_ROLE)).to.be.equal(user.guardians.length)
            for (const guardian of user.guardians) {
              expect(await wallet.hasRole(GUARDIAN_ROLE, guardian.address)).to.be.true
            }

            expect(await wallet.getRoleAdmin(OWNER_ROLE)).to.be.equal(ADMIN_ROLE)
            expect(await wallet.getRoleAdmin(GUARDIAN_ROLE)).to.be.equal(OWNER_ROLE)
          })

          it('uses the nonce of the op as the salt', async () => {
            const tx = await entryPoint.handleOps(op)

            await assertIndirectEvent(tx, entryPoint.factory.interface, 'Deployed', {
              createdContract: op.sender,
              salt: ethers.utils.hexZeroPad(ethers.utils.hexlify(op.nonce), 32)
            })
          })
        })
      })

      context('when the op does not include an init code', () => {
        it('reverts', async () => {
          await expect(entryPoint.handleOps(op)).to.be.revertedWith('EntryPoint: No wallet & initCode')
        })
      })
    })

    context('when the wallet was created', () => {
      beforeEach('create wallet', async () => {
        user = await User.createWithWallet(entryPoint)
        op = user.buildOp()
      })

      context('when the op includes some init code', () => {
        // TODO: Audit, this should revert

        beforeEach('set init code', async () => {
          op.initCode = await user.getWalletDeploymentCode()
        })

        it.skip('reverts', async () => {
          await expect(entryPoint.handleOps(op)).to.be.revertedWith('EntryPoint: No wallet & initCode')
        })
      })

      context('when the op does not include an init code', () => {
        itHandleOpsProperly(() => {
          it('does not deploy any wallet', async () => {
            const tx = await entryPoint.handleOps(op)

            await assertNoIndirectEvent(tx, entryPoint.factory.interface, 'Deployed')
          })
        })
      })
    })
  })

  describe('staking', () => {
    // TODO: add more scenarios

    const amount = fp(1)
    let paymaster: SignerWithAddress

    beforeEach('load paymaster', async () => {
      paymaster = await getSigner()
    })

    describe('addStake', () => {
      it('transfers ETH from the paymaster', async () => {
        const previousBalance = await ethers.provider.getBalance(paymaster.address)
        const { value: previousStake } = await entryPoint.getStake(paymaster)

        await entryPoint.stake(amount, { from: paymaster })

        const currentBalance = await ethers.provider.getBalance(paymaster.address)
        expect(currentBalance).to.be.lt(previousBalance.sub(amount))

        const { value: currentStake, lockExpiryTime, isLocked } = await entryPoint.getStake(paymaster)
        expect(currentStake).to.be.equal(previousStake.add(amount))
        expect(lockExpiryTime).to.be.equal(0)
        expect(isLocked).to.be.false
      })
    })

    describe('lockStake', () => {
      it('locks the staked ETH of the paymaster', async () => {
        const { value: previousStake } = await entryPoint.getStake(paymaster)

        await entryPoint.stakeAndLock(amount, { from: paymaster })

        const { value: currentStake, lockExpiryTime, isLocked } = await entryPoint.getStake(paymaster)
        expect(currentStake).to.be.equal(previousStake.add(amount))
        expect(lockExpiryTime).to.be.equal(Paymaster.LOCK_EXPIRY_PERIOD + (await currentTimestamp()))
        expect(isLocked).to.be.true
      })
    })

    describe('unlockStake', () => {
      beforeEach('stake and lock', async () => {
        await entryPoint.stakeAndLock(amount, { from: paymaster })
      })

      context('when the lock expiry time has passed', () => {
        beforeEach('advance time', async () => {
          await advanceTime(Paymaster.LOCK_EXPIRY_PERIOD)
        })

        it('unlocks the stake of the paymaster', async () => {
          const { value: previousStake } = await entryPoint.getStake(paymaster)

          await entryPoint.unlockStake();

          const { value: currentStake, lockExpiryTime, isLocked } = await entryPoint.getStake(paymaster)
          expect(currentStake).to.be.equal(previousStake)
          expect(lockExpiryTime).to.be.equal(0)
          expect(isLocked).to.be.false
        })
      })

      context('when the lock expiry time has not passed', () => {
        it('reverts', async () => {
          await expect(entryPoint.unlockStake()).to.be.revertedWith('EntryPoint: Lock not expired')
        })
      })
    })

    describe('unstake', () => {
      const recipient = ZERO_ADDRESS

      context('when the stake is not locked', () => {
        beforeEach('stake', async () => {
          await entryPoint.stake(amount, { from: paymaster })
        })

        it('withdraws unlocked stake to the given address', async () => {
          const previousBalance = await ethers.provider.getBalance(recipient)

          await entryPoint.unstake(ZERO_ADDRESS)

          const currentBalance = await ethers.provider.getBalance(recipient)
          expect(currentBalance).to.be.equal(previousBalance.add(amount))

          const { value: currentStake, lockExpiryTime, isLocked } = await entryPoint.getStake(paymaster)
          expect(currentStake).to.be.equal(0)
          expect(lockExpiryTime).to.be.equal(0)
          expect(isLocked).to.be.false
        })
      })

      context('when the stake is locked', () => {
        beforeEach('stake and lock', async () => {
          await entryPoint.stakeAndLock(amount, { from: paymaster })
        })

        it('reverts', async () => {
          await expect(entryPoint.unstake(recipient)).to.be.revertedWith('EntryPoint: Stake is locked')
        })
      })
    })
  })
})
