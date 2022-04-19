import { expect } from 'chai'
import { ethers } from 'hardhat'
import { Contract } from 'ethers'

import { bn, fp } from './utils/helpers/numbers'
import { getSigner } from './utils/helpers/signers'
import { deploy, instanceAt } from './utils/helpers/contracts'
import { assertIndirectEvent, assertNoIndirectEvent, assertWithError } from './utils/helpers/asserts'
import { POST_OP_MODE_FAIL, POST_OP_MODE_OK, POST_OP_MODE_OP_FAIL, ZERO_ADDRESS } from './utils/helpers/constants'
import { encodeCounterIncrement, encodeReverterFail, encodeWalletExecute, encodeWalletMockDeployment } from './utils/helpers/encoding'

import EntryPoint from './utils/models/entry-point/EntryPoint'
import { UserOp, buildOp } from './utils/types'

describe('EntryPoint', () => {
  let entryPoint: EntryPoint

  const UNLOCK_DELAY = 172800 // 2 days

  beforeEach('deploy entry point', async () => {
    entryPoint = await EntryPoint.create(UNLOCK_DELAY)
  })

  describe('handleOps', () => {
    let op: UserOp
    const redeemer = ZERO_ADDRESS

    beforeEach('build empty op', async () => {
      op = buildOp()
    })

    const itHandleOpsProperly = (itHandlesWalletCreationProperly: Function) => {
      const itHandleOpsProperlyNeverthelessPaymaster = (itHandlesRefundsProperly: Function, itHandlesRevertedOpsProperly: Function) => {
        context('when there is some call data', () => {
          let mock: Contract

          context('when the specified call does not revert', () => {
            beforeEach('set call data', async () => {
              mock = await deploy('Counter')
              op.callData = await encodeWalletExecute(mock, await encodeCounterIncrement())
            })

            context('when the user specifies a call gas value', () => {
              beforeEach('set call gas', async () => {
                op.callGas = bn(50e3)
              })

              itHandlesRefundsProperly()

              itHandlesWalletCreationProperly()

              it('executes the given call', async () => {
                const tx = await entryPoint.handleOps(op)

                await assertIndirectEvent(tx, mock.interface, 'Incremented')
              })

              it('can handles ETH value', async () => {
                const value = fp(0.001)
                await (await getSigner()).sendTransaction({ to: op.sender, value })
                op.callData = await encodeWalletExecute(mock, await encodeCounterIncrement(), value)

                const previousCounterBalance = await ethers.provider.getBalance(mock.address)

                await entryPoint.handleOps(op)

                const currentCounterBalance = await ethers.provider.getBalance(mock.address)
                expect(currentCounterBalance).to.be.equal(previousCounterBalance.add(value))
              })
            })

            context('when the user does not specify a call gas value', () => {
              beforeEach('set call gas', async () => {
                op.callGas = 0
              })

              itHandlesRevertedOpsProperly()
            })
          })

          context('when the specified call reverts', () => {
            beforeEach('set call data', async () => {
              mock = await deploy('Reverter')
              op.callData = await encodeWalletExecute(mock, await encodeReverterFail())
            })

            itHandlesRevertedOpsProperly()
          })
        })

        context('when there is no call data', () => {
          itHandlesRevertedOpsProperly()
        })
      }

      context('without a paymaster', () => {
        beforeEach('fund wallet', async () => {
          await (await getSigner()).sendTransaction({ to: op.sender, value: fp(1) })
        })

        context('when the user specifies a verification gas value', () => {
          beforeEach('set verification gas', async () => {
            op.verificationGas = op.initCode == '0x' ? bn(30e3) : bn(650e3)
          })

          context('when the wallet verification succeeds', () => {
            const mockRevertVerification = false

            context('when the user does not specify any gas fee', () => {
              itHandleOpsProperlyNeverthelessPaymaster(() => {
                it('does not pay to the redeemer', async () => {
                  const previousBalance = await ethers.provider.getBalance(redeemer)

                  await entryPoint.handleOps(op, redeemer)

                  const currentBalance = await ethers.provider.getBalance(redeemer)
                  expect(currentBalance).to.be.equal(previousBalance)
                })

                it.skip('simulates the validations correctly', async () => {
                  //TODO: Fix, these are failing in a weird way :/

                  const { preOpGas, prefund } = await entryPoint.simulateValidation(op)

                  expect(prefund).to.be.equal(0)
                  expect(preOpGas.lt(op.verificationGas)).to.be.true
                });

                it('does not decreases the wallet balance', async () => {
                  const previousBalance = await ethers.provider.getBalance(op.sender)

                  await entryPoint.handleOps(op, redeemer)

                  const currentBalance = await ethers.provider.getBalance(op.sender)
                  expect(currentBalance).to.be.equal(previousBalance)
                })
              }, () => {
                it('does not to pay gas anyway', async () => {
                  const previousRedeemerBalance = await ethers.provider.getBalance(redeemer)
                  const previousPayerBalance = await ethers.provider.getBalance(op.sender)

                  await entryPoint.handleOps(op)

                  const currentRedeemerBalance = await ethers.provider.getBalance(redeemer)
                  expect(currentRedeemerBalance).to.be.eq(previousRedeemerBalance)

                  const currentPayerBalance = await ethers.provider.getBalance(op.sender)
                  expect(currentPayerBalance).to.be.eq(previousPayerBalance)
                })
              })
            })

            context('when the user does not want to use a priority fee', () => {
              // TODO: Review this implementation, the user must specify the same fee and priority fee values.

              beforeEach('set fees', async () => {
                op.maxFeePerGas = 1e9
                op.maxPriorityFeePerGas = op.maxFeePerGas
              })

              context('when the wallet pays the required refund', () => {
                beforeEach('mock wallet payment', async () => {
                  if (op.initCode != '0x') {
                    op.initCode = await encodeWalletMockDeployment(mockRevertVerification, true)
                    op.sender = await entryPoint.getSenderAddress(op)
                  } else {
                    const wallet = await instanceAt('WalletMock', op.sender)
                    await wallet.mockRefundPayment(true)
                    await wallet.mockVerificationRevert(mockRevertVerification)
                  }
                })

                itHandleOpsProperlyNeverthelessPaymaster(() => {
                  it('pays the redeemer', async () => {
                    const expectedRefund = await entryPoint.estimatePrefund(op)
                    const previousRedeemerBalance = await ethers.provider.getBalance(redeemer)

                    await entryPoint.handleOps(op, redeemer)

                    const currentRedeemerBalance = await ethers.provider.getBalance(redeemer)
                    assertWithError(currentRedeemerBalance, previousRedeemerBalance.add(expectedRefund), 0.1)
                  })

                  it.skip('simulates the validations correctly', async () => {
                    //TODO: Fix, these are failing in a weird way :/

                    const expectedRefund = await entryPoint.estimatePrefund(op)

                    const { preOpGas, prefund } = await entryPoint.simulateValidation(op)

                    expect(prefund).to.be.equal(expectedRefund)
                    expect(preOpGas.lt(op.verificationGas)).to.be.true
                  });

                  it('refunds the unused gas to the wallet', async () => {
                    const previousWalletBalance = await ethers.provider.getBalance(op.sender)
                    const previousRedeemerBalance = await ethers.provider.getBalance(redeemer)

                    await entryPoint.handleOps(op, redeemer)

                    const currentRedeemerBalance = await ethers.provider.getBalance(redeemer)
                    const prefundPaid = currentRedeemerBalance.sub(previousRedeemerBalance)
                    const currentWalletBalance = await ethers.provider.getBalance(op.sender)
                    expect(currentWalletBalance.add(prefundPaid)).to.be.equal(previousWalletBalance)
                  })
                }, () => {
                  it('forces to pay gas anyway', async () => {
                    const previousRedeemerBalance = await ethers.provider.getBalance(redeemer)
                    const previousPayerBalance = await ethers.provider.getBalance(op.sender)

                    await entryPoint.handleOps(op)

                    const currentRedeemerBalance = await ethers.provider.getBalance(redeemer)
                    expect(currentRedeemerBalance).to.be.gt(previousRedeemerBalance)

                    const currentPayerBalance = await ethers.provider.getBalance(op.sender)
                    expect(currentPayerBalance).to.be.lt(previousPayerBalance)
                  })
                })
              })

              context('when the wallet does not pay the required refund', () => {
                beforeEach('mock wallet payment', async () => {
                  if (op.initCode != '0x') {
                    op.initCode = await encodeWalletMockDeployment(mockRevertVerification, false)
                    op.sender = await entryPoint.getSenderAddress(op)
                  } else {
                    const wallet = await instanceAt('WalletMock', op.sender)
                    await wallet.mockRefundPayment(false)
                    await wallet.mockVerificationRevert(mockRevertVerification)
                  }
                })

                it('reverts', async () => {
                  await expect(entryPoint.handleOps(op)).to.be.revertedWith('EntryPoint: Incorrect prefund')
                })
              })
            })

            context('when the user wants to use a priority fee', () => {
              // TODO: Review this implementation, the user must specify the same fee and priority fee values.

              beforeEach('set fees', async () => {
                op.maxFeePerGas = 1e9
                op.maxPriorityFeePerGas = 2e9
              })

              context('when the wallet pays the required refund', () => {
                beforeEach('mock wallet payment', async () => {
                  if (op.initCode != '0x') {
                    op.initCode = await encodeWalletMockDeployment(mockRevertVerification, true)
                    op.sender = await entryPoint.getSenderAddress(op)
                  } else {
                    const wallet = await instanceAt('WalletMock', op.sender)
                    await wallet.mockRefundPayment(true)
                    await wallet.mockVerificationRevert(mockRevertVerification)
                  }
                })

                itHandleOpsProperlyNeverthelessPaymaster(() => {
                  it('pays the redeemer', async () => {
                    const expectedRefund = await entryPoint.estimatePrefund(op)
                    const previousRedeemerBalance = await ethers.provider.getBalance(redeemer)

                    await entryPoint.handleOps(op, redeemer)

                    const currentRedeemerBalance = await ethers.provider.getBalance(redeemer)
                    assertWithError(currentRedeemerBalance, previousRedeemerBalance.add(expectedRefund), 0.1)
                  })

                  it.skip('simulates the validations correctly', async () => {
                    //TODO: Fix, these are failing in a weird way :/

                    const expectedRefund = await entryPoint.estimatePrefund(op)

                    const { preOpGas, prefund } = await entryPoint.simulateValidation(op)

                    expect(prefund).to.be.equal(expectedRefund)
                    expect(preOpGas.lt(op.verificationGas)).to.be.true
                  });

                  it('refunds the unused gas to the wallet', async () => {
                    const previousWalletBalance = await ethers.provider.getBalance(op.sender)
                    const previousRedeemerBalance = await ethers.provider.getBalance(redeemer)

                    await entryPoint.handleOps(op, redeemer)

                    const currentRedeemerBalance = await ethers.provider.getBalance(redeemer)
                    const prefundPaid = currentRedeemerBalance.sub(previousRedeemerBalance)
                    const currentWalletBalance = await ethers.provider.getBalance(op.sender)
                    expect(currentWalletBalance.add(prefundPaid)).to.be.equal(previousWalletBalance)
                  })
                }, () => {
                  it('forces to pay gas anyway', async () => {
                    const previousRedeemerBalance = await ethers.provider.getBalance(redeemer)
                    const previousPayerBalance = await ethers.provider.getBalance(op.sender)

                    await entryPoint.handleOps(op)

                    const currentRedeemerBalance = await ethers.provider.getBalance(redeemer)
                    expect(currentRedeemerBalance).to.be.gt(previousRedeemerBalance)

                    const currentPayerBalance = await ethers.provider.getBalance(op.sender)
                    expect(currentPayerBalance).to.be.lt(previousPayerBalance)
                  })
                })
              })

              context('when the wallet does not pay the required refund', () => {
                beforeEach('mock wallet payment', async () => {
                  if (op.initCode != '0x') {
                    op.initCode = await encodeWalletMockDeployment(mockRevertVerification, false)
                    op.sender = await entryPoint.getSenderAddress(op)
                  } else {
                    const wallet = await instanceAt('WalletMock', op.sender)
                    await wallet.mockRefundPayment(false)
                    await wallet.mockVerificationRevert(mockRevertVerification)
                  }
                })

                it('reverts', async () => {
                  await expect(entryPoint.handleOps(op)).to.be.revertedWith('EntryPoint: Incorrect prefund')
                })
              })
            })
          })

          context('when the wallet verification fails', () => {
            beforeEach('mock wallet verification', async () => {
              if (op.initCode != '0x') {
                op.initCode = await encodeWalletMockDeployment(true)
                op.sender = await entryPoint.getSenderAddress(op)
              } else {
                const wallet = await instanceAt('WalletMock', op.sender)
                await wallet.mockVerificationRevert(true)
              }
            })

            it('reverts', async () => {
              await expect(entryPoint.handleOps(op)).to.be.revertedWith('WALLET_VERIFICATION_FAILED')
            })
          })
        })

        context('when the user does not specify a verification gas value', () => {
          it('reverts', async () => {
            await expect(entryPoint.handleOps(op)).to.be.revertedWith('contract call run out of gas')
          })
        })
      })

      context('with a paymaster', () => {
        let paymaster: Contract

        beforeEach('create paymaster', async () => {
          paymaster = await deploy('PaymasterMock', [entryPoint.address, UNLOCK_DELAY])
          op.paymaster = paymaster.address
          op.preVerificationGas = bn(2e6)
          await (await getSigner()).sendTransaction({ to: op.paymaster, value: fp(10) })
        })

        context('when the user does not specify any gas fee', () => {
          context('when the user specifies a verification gas value', () => {
            beforeEach('set verification gas', async () => {
              op.verificationGas = op.initCode == '0x' ? bn(60e3) : bn(650e3)
            })

            context('when the wallet verification succeeds', () => {
              beforeEach('mock wallet verification', async () => {
                if (op.initCode != '0x') {
                  op.initCode = await encodeWalletMockDeployment(false)
                  op.sender = await entryPoint.getSenderAddress(op)
                } else {
                  const wallet = await instanceAt('WalletMock', op.sender)
                  await wallet.mockVerificationRevert(false)
                }
              })

              context('when the paymaster does have some deposits', () => {
                beforeEach('deposit', async () => {
                  await paymaster.deposit({ value: 1 })
                })

                context('when the paymaster is staked', () => {
                  beforeEach('stake', async () => {
                    await paymaster.stake()
                  })

                  context('when the paymaster verification succeeds', () => {
                    beforeEach('mock paymaster verification', async () => {
                      await paymaster.mockVerificationRevert(false)
                    })

                    context('when the verification gas is enough', () => {
                      context('when the paymaster post op succeeds', () => {
                        beforeEach('mock paymaster post op', async () => {
                          await paymaster.mockPostOpRevert(false)
                        })

                        itHandleOpsProperlyNeverthelessPaymaster(() => {
                          it('does not pay to the redeemer', async () => {
                            const previousBalance = await ethers.provider.getBalance(redeemer)

                            await entryPoint.handleOps(op, redeemer)

                            const currentBalance = await ethers.provider.getBalance(redeemer)
                            expect(currentBalance).to.be.equal(previousBalance)
                          })

                          it('does not decrease the paymaster stake', async () => {
                            const previousStakedBalance = await entryPoint.balanceOf(paymaster)

                            await entryPoint.handleOps(op, redeemer)

                            const currentStakedBalance = await entryPoint.balanceOf(paymaster)
                            expect(currentStakedBalance).to.be.equal(previousStakedBalance)
                          })

                          it('does not decreases the wallet balance', async () => {
                            const previousBalance = await ethers.provider.getBalance(op.sender)

                            await entryPoint.handleOps(op, redeemer)

                            const currentBalance = await ethers.provider.getBalance(op.sender)
                            expect(currentBalance).to.be.equal(previousBalance)
                          })

                          it('calls the paymaster with the succeed mode', async () => {
                            const tx = await entryPoint.handleOps(op)

                            await assertIndirectEvent(tx, paymaster.interface, 'PostOp', { mode: POST_OP_MODE_OK })
                          })
                        }, () => {
                          it('does not force to pay gas anyway', async () => {
                            const previousRedeemerBalance = await ethers.provider.getBalance(redeemer)
                            const previousPayerBalance = await ethers.provider.getBalance(op.sender)

                            await entryPoint.handleOps(op)

                            const currentRedeemerBalance = await ethers.provider.getBalance(redeemer)
                            expect(currentRedeemerBalance).to.be.eq(previousRedeemerBalance)

                            const currentPayerBalance = await ethers.provider.getBalance(op.sender)
                            expect(currentPayerBalance).to.be.eq(previousPayerBalance)
                          })

                          it('calls the paymaster with the reverted mode', async () => {
                            const tx = await entryPoint.handleOps(op)

                            await assertIndirectEvent(tx, paymaster.interface, 'PostOp', { mode: POST_OP_MODE_FAIL })
                          })
                        })
                      })

                      context('when the paymaster post op fails', () => {
                        beforeEach('mock paymaster post op', async () => {
                          await paymaster.mockPostOpRevert(true)
                        })

                        it('does not force to pay gas anyway', async () => {
                          const previousRedeemerBalance = await ethers.provider.getBalance(redeemer)
                          const previousPayerBalance = await ethers.provider.getBalance(op.sender)

                          await entryPoint.handleOps(op)

                          const currentRedeemerBalance = await ethers.provider.getBalance(redeemer)
                          expect(currentRedeemerBalance).to.be.eq(previousRedeemerBalance)

                          const currentPayerBalance = await ethers.provider.getBalance(op.sender)
                          expect(currentPayerBalance).to.be.eq(previousPayerBalance)
                        })

                        it('calls the paymaster with the post op reverted mode', async () => {
                          const tx = await entryPoint.handleOps(op)

                          await assertIndirectEvent(tx, paymaster.interface, 'PostOp', { mode: POST_OP_MODE_OP_FAIL })
                        })

                        it.skip('simulates the validations correctly', async () => {
                          //TODO: Fix, these are failing in a weird way :/

                          const { preOpGas, prefund } = await entryPoint.simulateValidation(op)

                          expect(prefund).to.be.eq(0)
                          expect(preOpGas.lt(op.verificationGas)).to.be.true
                        })
                      })
                    })

                    context('when the verification gas is not enough', () => {
                      beforeEach('set verification gas', async () => {
                        op.verificationGas = op.initCode == '0x' ? bn(30e3) : bn(580e3)
                      })

                      it('reverts', async () => {
                        await expect(entryPoint.handleOps(op)).to.be.revertedWith('EntryPoint: Verif gas not enough')
                      })
                    })
                  })

                  context('when the paymaster verification fails', () => {
                    beforeEach('mock paymaster verification', async () => {
                      await paymaster.mockVerificationRevert(true)
                    })

                    it('reverts', async () => {
                      await expect(entryPoint.handleOps(op)).to.be.revertedWith('PAYMASTER_VERIFICATION_FAILED')
                    })
                  })
                })

                context('when the paymaster is not staked', () => {
                  it('reverts', async () => {
                    await expect(entryPoint.handleOps(op)).to.be.revertedWith('EntryPoint: Deposit not staked')
                  })
                })
              })

              context('when the paymaster does not have any deposits', () => {
                it('reverts', async () => {
                  await expect(entryPoint.handleOps(op)).to.be.revertedWith('EntryPoint: Deposit not staked')
                })
              })
            })

            context('when the wallet verification fails', () => {
              beforeEach('mock wallet verification', async () => {
                if (op.initCode != '0x') {
                  op.initCode = await encodeWalletMockDeployment(true)
                  op.sender = await entryPoint.getSenderAddress(op)
                } else {
                  const wallet = await instanceAt('WalletMock', op.sender)
                  await wallet.mockVerificationRevert(true)
                }
              })

              it('reverts', async () => {
                await expect(entryPoint.handleOps(op)).to.be.revertedWith('WALLET_VERIFICATION_FAILED')
              })
            })
          })

          context('when the user does not specify a verification gas value', () => {
            it('reverts', async () => {
              await expect(entryPoint.handleOps(op)).to.be.revertedWith('contract call run out of gas')
            })
          })
        })

        context('when the user does not want to use a priority fee', () => {
          // TODO: Review this implementation, the user must specify the same fee and priority fee values.

          beforeEach('set fees', async () => {
            op.maxFeePerGas = 1e9
            op.maxPriorityFeePerGas = op.maxFeePerGas
          })

          context('when the user specifies a verification gas value', () => {
            beforeEach('set verification gas', async () => {
              op.verificationGas = op.initCode == '0x' ? bn(60e3) : bn(650e3)
            })

            context('when the wallet verification succeeds', () => {
              beforeEach('mock wallet verification', async () => {
                if (op.initCode != '0x') {
                  op.initCode = await encodeWalletMockDeployment(false)
                  op.sender = await entryPoint.getSenderAddress(op)
                } else {
                  const wallet = await instanceAt('WalletMock', op.sender)
                  await wallet.mockVerificationRevert(false)
                }
              })

              context('when the paymaster does have some deposits', () => {
                beforeEach('deposit a minimum', async () => {
                  await paymaster.deposit({value: 1})
                })

                context('when the paymaster is staked', () => {
                  beforeEach('stake', async () => {
                    await paymaster.stake()
                  })

                  context('when the paymaster stake is enough', () => {
                    beforeEach('stake big amount', async () => {
                      await paymaster.stake({value: fp(1)})
                    })

                    context('when the paymaster verification succeeds', () => {
                      beforeEach('mock paymaster verification', async () => {
                        await paymaster.mockVerificationRevert(false)
                      })

                      context('when the verification gas is enough', () => {
                        context('when the paymaster post op succeeds', () => {
                          beforeEach('mock paymaster post op', async () => {
                            await paymaster.mockPostOpRevert(false)
                          })

                          itHandleOpsProperlyNeverthelessPaymaster(() => {
                            it('pays the redeemer', async () => {
                              const expectedRefund = await entryPoint.estimatePrefund(op)
                              const previousRedeemerBalance = await ethers.provider.getBalance(redeemer)

                              await entryPoint.handleOps(op, redeemer)

                              const currentRedeemerBalance = await ethers.provider.getBalance(redeemer)
                              assertWithError(currentRedeemerBalance, previousRedeemerBalance.add(expectedRefund), 0.1)
                            })

                            it('decreases the paymaster stake', async () => {
                              const expectedRefund = await entryPoint.estimatePrefund(op)
                              const previousStakedBalance = await entryPoint.balanceOf(paymaster)

                              await entryPoint.handleOps(op, redeemer)

                              const currentStakedBalance = await entryPoint.balanceOf(paymaster)
                              assertWithError(currentStakedBalance, previousStakedBalance.sub(expectedRefund), 0.1)
                            })

                            it('does not refund the unused gas to the wallet', async () => {
                              const previousWalletBalance = await ethers.provider.getBalance(op.sender)

                              await entryPoint.handleOps(op, redeemer)

                              const currentWalletBalance = await ethers.provider.getBalance(op.sender)
                              expect(currentWalletBalance).to.be.equal(previousWalletBalance)
                            })

                            it('calls the paymaster with the succeed mode', async () => {
                              const tx = await entryPoint.handleOps(op)

                              await assertIndirectEvent(tx, paymaster.interface, 'PostOp', { mode: POST_OP_MODE_OK })
                            })
                          }, () => {
                            it('forces to pay gas anyway', async () => {
                              const previousRedeemerBalance = await ethers.provider.getBalance(redeemer)
                              const previousPayerBalance = await entryPoint.balanceOf(op.paymaster)

                              await entryPoint.handleOps(op)

                              const currentRedeemerBalance = await ethers.provider.getBalance(redeemer)
                              expect(currentRedeemerBalance).to.be.gt(previousRedeemerBalance)

                              const currentPayerBalance = await entryPoint.balanceOf(op.paymaster)
                              expect(currentPayerBalance).to.be.lt(previousPayerBalance)
                            })

                            it('calls the paymaster with the reverted op mode', async () => {
                              const tx = await entryPoint.handleOps(op)

                              await assertIndirectEvent(tx, paymaster.interface, 'PostOp', { mode: POST_OP_MODE_FAIL })
                            })
                          })
                        })

                        context('when the paymaster post op fails', () => {
                          beforeEach('mock paymaster post op', async () => {
                            await paymaster.mockPostOpRevert(true)
                          })

                          it('forces to pay gas anyway', async () => {
                            const previousRedeemerBalance = await ethers.provider.getBalance(redeemer)
                            const previousPayerBalance = await entryPoint.balanceOf(op.paymaster)

                            await entryPoint.handleOps(op)

                            const currentRedeemerBalance = await ethers.provider.getBalance(redeemer)
                            expect(currentRedeemerBalance).to.be.gt(previousRedeemerBalance)

                            const currentPayerBalance = await entryPoint.balanceOf(op.paymaster)
                            expect(currentPayerBalance).to.be.lt(previousPayerBalance)
                          })

                          it('calls the paymaster with the post op reverted mode', async () => {
                            const tx = await entryPoint.handleOps(op)

                            await assertIndirectEvent(tx, paymaster.interface, 'PostOp', { mode: POST_OP_MODE_OP_FAIL })
                          })

                          it.skip('simulates the validations correctly', async () => {
                            //TODO: Fix, these are failing in a weird way :/

                            const expectedRefund = await entryPoint.estimatePrefund(op)

                            const { preOpGas, prefund } = await entryPoint.simulateValidation(op)

                            expect(prefund).to.be.equal(expectedRefund)
                            expect(preOpGas.lt(op.verificationGas)).to.be.true
                          })
                        })
                      })

                      context('when the verification gas is not enough', () => {
                        beforeEach('set verification gas', async () => {
                          op.verificationGas = op.initCode == '0x' ? bn(30e3) : bn(580e3)
                        })

                        it('reverts', async () => {
                          await expect(entryPoint.handleOps(op)).to.be.revertedWith('EntryPoint: Verif gas not enough')
                        })
                      })
                    })

                    context('when the paymaster verification fails', () => {
                      beforeEach('mock paymaster verification', async () => {
                        await paymaster.mockVerificationRevert(true)
                      })

                      it('reverts', async () => {
                        await expect(entryPoint.handleOps(op)).to.be.revertedWith('PAYMASTER_VERIFICATION_FAILED')
                      })
                    })
                  })

                  context('when the paymaster stake is not enough', () => {
                    beforeEach('deposit small amount', async () => {
                      await paymaster.deposit({ value: 1 })
                    })

                    it('reverts', async () => {
                      await expect(entryPoint.handleOps(op)).to.be.revertedWith('Staking: Insufficient stake')
                    })
                  })
                })

                context('when the paymaster is not staked', () => {
                  it('reverts', async () => {
                    await expect(entryPoint.handleOps(op)).to.be.revertedWith('EntryPoint: Deposit not staked')
                  })
                })
              })

              context('when the paymaster does not have any deposits', () => {
                it('reverts', async () => {
                  await expect(entryPoint.handleOps(op)).to.be.revertedWith('EntryPoint: Deposit not staked')
                })
              })
            })

            context('when the wallet verification fails', () => {
              beforeEach('mock wallet verification', async () => {
                if (op.initCode != '0x') {
                  op.initCode = await encodeWalletMockDeployment(true)
                  op.sender = await entryPoint.getSenderAddress(op)
                } else {
                  const wallet = await instanceAt('WalletMock', op.sender)
                  await wallet.mockVerificationRevert(true)
                }
              })

              it('reverts', async () => {
                await expect(entryPoint.handleOps(op)).to.be.revertedWith('WALLET_VERIFICATION_FAILED')
              })
            })
          })

          context('when the user does not specify a verification gas value', () => {
            it('reverts', async () => {
              await expect(entryPoint.handleOps(op)).to.be.revertedWith('contract call run out of gas')
            })
          })
        })

        context('when the user wants to use a priority fee', () => {
          // TODO: Review this implementation, the user must specify the same fee and priority fee values.

          beforeEach('set fees', async () => {
            op.maxFeePerGas = 1e9
            op.maxPriorityFeePerGas = 2e9
          })

          context('when the user specifies a verification gas value', () => {
            beforeEach('set verification gas', async () => {
              op.verificationGas = op.initCode == '0x' ? bn(60e3) : bn(650e3)
            })

            context('when the wallet verification succeeds', () => {
              beforeEach('mock wallet verification', async () => {
                if (op.initCode != '0x') {
                  op.initCode = await encodeWalletMockDeployment(false)
                  op.sender = await entryPoint.getSenderAddress(op)
                } else {
                  const wallet = await instanceAt('WalletMock', op.sender)
                  await wallet.mockVerificationRevert(false)
                }
              })

              context('when the paymaster does have some deposits', () => {
                beforeEach('deposit a minimum', async () => {
                  await paymaster.deposit({ value: 1 })
                })

                context('when the paymaster is staked', () => {
                  beforeEach('stake', async () => {
                    await paymaster.stake()
                  })

                  context('when the paymaster deposit is enough', () => {
                    beforeEach('deposit big amount', async () => {
                      await paymaster.deposit({ value: fp(1) })
                    })

                    context('when the paymaster verification succeeds', () => {
                      beforeEach('mock paymaster verification', async () => {
                        await paymaster.mockVerificationRevert(false)
                      })

                      context('when the verification gas is not enough', () => {

                        context('when the paymaster post op succeeds', () => {
                          beforeEach('mock paymaster post op', async () => {
                            await paymaster.mockPostOpRevert(false)
                          })

                          itHandleOpsProperlyNeverthelessPaymaster(() => {
                            it('pays the redeemer', async () => {
                              const expectedRefund = await entryPoint.estimatePrefund(op)
                              const previousRedeemerBalance = await ethers.provider.getBalance(redeemer)

                              await entryPoint.handleOps(op, redeemer)

                              const currentRedeemerBalance = await ethers.provider.getBalance(redeemer)
                              assertWithError(currentRedeemerBalance, previousRedeemerBalance.add(expectedRefund), 0.1)
                            })

                            it('decreases the paymaster stake', async () => {
                              const expectedRefund = await entryPoint.estimatePrefund(op)
                              const previousStakedBalance = await entryPoint.balanceOf(paymaster)

                              await entryPoint.handleOps(op, redeemer)

                              const currentStakedBalance = await entryPoint.balanceOf(paymaster)
                              assertWithError(currentStakedBalance, previousStakedBalance.sub(expectedRefund), 0.1)
                            })

                            it('does not refund the unused gas to the wallet', async () => {
                              const previousWalletBalance = await ethers.provider.getBalance(op.sender)

                              await entryPoint.handleOps(op, redeemer)

                              const currentWalletBalance = await ethers.provider.getBalance(op.sender)
                              expect(currentWalletBalance).to.be.equal(previousWalletBalance)
                            })

                            it('calls the paymaster with the succeed mode', async () => {
                              const tx = await entryPoint.handleOps(op)

                              await assertIndirectEvent(tx, paymaster.interface, 'PostOp', { mode: POST_OP_MODE_OK })
                            })
                          }, () => {
                            it('forces to pay gas anyway', async () => {
                              const previousRedeemerBalance = await ethers.provider.getBalance(redeemer)
                              const previousPayerBalance = await entryPoint.balanceOf(op.paymaster)

                              await entryPoint.handleOps(op)

                              const currentRedeemerBalance = await ethers.provider.getBalance(redeemer)
                              expect(currentRedeemerBalance).to.be.gt(previousRedeemerBalance)

                              const currentPayerBalance = await entryPoint.balanceOf(op.paymaster)
                              expect(currentPayerBalance).to.be.lt(previousPayerBalance)
                            })

                            it('calls the paymaster with the reverted op mode', async () => {
                              const tx = await entryPoint.handleOps(op)

                              await assertIndirectEvent(tx, paymaster.interface, 'PostOp', { mode: POST_OP_MODE_FAIL })
                            })
                          })
                        })

                        context('when the paymaster post op fails', () => {
                          beforeEach('mock paymaster post op', async () => {
                            await paymaster.mockPostOpRevert(true)
                          })

                          it('forces to pay gas anyway', async () => {
                            const previousRedeemerBalance = await ethers.provider.getBalance(redeemer)
                            const previousPayerBalance = await entryPoint.balanceOf(op.paymaster)

                            await entryPoint.handleOps(op)

                            const currentRedeemerBalance = await ethers.provider.getBalance(redeemer)
                            expect(currentRedeemerBalance).to.be.gt(previousRedeemerBalance)

                            const currentPayerBalance = await entryPoint.balanceOf(op.paymaster)
                            expect(currentPayerBalance).to.be.lt(previousPayerBalance)
                          })

                          it('calls the paymaster with the post op reverted mode', async () => {
                            const tx = await entryPoint.handleOps(op)

                            await assertIndirectEvent(tx, paymaster.interface, 'PostOp', { mode: POST_OP_MODE_OP_FAIL })
                          })

                          it.skip('simulates the validations correctly', async () => {
                            //TODO: Fix, these are failing in a weird way :/

                            const expectedRefund = await entryPoint.estimatePrefund(op)

                            const { preOpGas, prefund } = await entryPoint.simulateValidation(op)

                            expect(prefund).to.be.equal(expectedRefund)
                            expect(preOpGas.lt(op.verificationGas)).to.be.true
                          })
                        })
                      })

                      context('when the verification gas is not enough', () => {
                        beforeEach('set verification gas', async () => {
                          op.verificationGas = op.initCode == '0x' ? bn(30e3) : bn(580e3)
                        })

                        it('reverts', async () => {
                          await expect(entryPoint.handleOps(op)).to.be.revertedWith('EntryPoint: Verif gas not enough')
                        })
                      })
                    })

                    context('when the paymaster verification fails', () => {
                      beforeEach('mock paymaster verification', async () => {
                        await paymaster.mockVerificationRevert(true)
                      })

                      it('reverts', async () => {
                        await expect(entryPoint.handleOps(op)).to.be.revertedWith('PAYMASTER_VERIFICATION_FAILED')
                      })
                    })
                  })

                  context('when the paymaster deposit is not enough', () => {
                    beforeEach('deposit small amount', async () => {
                      await paymaster.deposit({ value: 1 })
                    })

                    it('reverts', async () => {
                      await expect(entryPoint.handleOps(op)).to.be.revertedWith('Staking: Insufficient stake')
                    })
                  })
                })

                context('when the paymaster is not staked', () => {
                  it('reverts', async () => {
                    await expect(entryPoint.handleOps(op)).to.be.revertedWith('EntryPoint: Deposit not staked')
                  })
                })
              })

              context('when the paymaster does not have any deposits', () => {
                it('reverts', async () => {
                  await expect(entryPoint.handleOps(op)).to.be.revertedWith('EntryPoint: Deposit not staked')
                })
              })
            })

            context('when the wallet verification fails', () => {
              beforeEach('mock wallet verification', async () => {
                if (op.initCode != '0x') {
                  op.initCode = await encodeWalletMockDeployment(true)
                  op.sender = await entryPoint.getSenderAddress(op)
                } else {
                  const wallet = await instanceAt('WalletMock', op.sender)
                  await wallet.mockVerificationRevert(true)
                }
              })

              it('reverts', async () => {
                await expect(entryPoint.handleOps(op)).to.be.revertedWith('WALLET_VERIFICATION_FAILED')
              })
            })
          })

          context('when the user does not specify a verification gas value', () => {
            it('reverts', async () => {
              await expect(entryPoint.handleOps(op)).to.be.revertedWith('contract call run out of gas')
            })
          })
        })
      })
    }

    context('when the wallet was not created', () => {
      context('when the op includes some init code', () => {
        beforeEach('set init code', async () => {
          op.initCode = await encodeWalletMockDeployment()
          op.sender = await entryPoint.getSenderAddress(op)
        })

        itHandleOpsProperly(() => {
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
          await expect(entryPoint.handleOps(op)).to.be.revertedWith('EntryPoint: Wrong init code')
        })
      })
    })

    context('when the wallet was created', () => {
      beforeEach('create wallet', async () => {
        const wallet = await deploy('WalletMock', [false, true])
        op.sender = wallet.address
      })

      context('when the op includes some init code', () => {
        beforeEach('set init code', async () => {
          op.initCode = '0xaabb'
        })

        it('reverts', async () => {
          await expect(entryPoint.handleOps(op)).to.be.revertedWith('EntryPoint: Wrong init code')
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
})
