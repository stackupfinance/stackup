import {expect} from "chai";
import {ethers} from "hardhat";
import {Contract} from 'ethers';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'

import {bn, fp} from './utils/helpers/numbers'

import {
  DEFAULT_REQUIRED_PRE_FUND,
  getAddressBalances,
  getLastBlockTimestamp,
  incrementBlockTimestamp,
  PAYMASTER_FEE,
  PAYMASTER_LOCK_EXPIRY_PERIOD,
  PAYMASTER_OPTS,
  PAYMASTER_OPTS_NO_FEE,
  sendEth,
  swapEthForToken,
  transactionFee,
  USDC_TOKEN,
} from './utils/contractHelpers'
import User from './utils/models/user/User'
import EntryPoint from './utils/models/entry-point/EntryPoint'

import {ADMIN_ROLE, GUARDIAN_ROLE, OWNER_ROLE, ZERO_ADDRESS} from './utils/helpers/constants'
import {deploy, instanceAt} from './utils/helpers/contracts'
import {assertIndirectEvent, assertNoIndirectEvent, assertWithError} from './utils/helpers/asserts'
import {encodeCounterIncrement, encodeReverterFail, encodeWalletExecute} from './utils/helpers/encoding'

import {UserOp} from './utils/models/user/types'

const { wallet, contracts } = require("../lib");

describe.only('EntryPoint', () => {
  let user: User
  let entryPoint: EntryPoint

  const WALLET_CREATION_GAS = bn(690e3)
  const WALLET_VERIFICATION_GAS = bn(38500)
  const COUNTER_CALL_WITH_VALUE_GAS = bn(35000)
  const COUNTER_CALL_WITHOUT_VALUE_GAS = bn(28500)

  beforeEach('deploy entry point', async () => {
    user = await User.create()
    entryPoint = await EntryPoint.create()
  })

  describe('handleOps', () => {
    let op: UserOp

    const itHandleOpsProperly = (itHandlesWalletCreationProperly: Function) => {
      context('when the user specifies a verification gas value', () => {
        beforeEach('set verification gas', async () => {
          op.verificationGas = WALLET_VERIFICATION_GAS
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
                op.callGas = COUNTER_CALL_WITHOUT_VALUE_GAS
              })

              context('when using the correct nonce', () => {
                beforeEach('assert nonce', async () => {
                  expect(op.nonce).to.be.equal(user.nextNonce - 1)
                })

                context('when the op was signed correctly', () => {
                  beforeEach('sign op', async () => {
                    op.signature = await user.signOp(op, entryPoint)
                  })

                  itHandlesWalletCreationProperly()

                  it('executes the given call', async () => {
                    const tx = await entryPoint.handleOps(op)

                    await assertIndirectEvent(tx, mock.interface, 'Incremented')
                  })

                  it('can handles ETH value', async () => {
                    const value = fp(0.001)
                    await user.transfer(op.sender, value)
                    op.callGas = COUNTER_CALL_WITH_VALUE_GAS
                    op.callData = await encodeWalletExecute(mock, await encodeCounterIncrement(), value)
                    op.signature = await user.signOp(op, entryPoint)

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
                            op.preVerificationGas = WALLET_CREATION_GAS
                            op.signature = await user.signOp(op, entryPoint)
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
                            op.signature = await user.signOp(op, entryPoint)
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
                            op.preVerificationGas = WALLET_CREATION_GAS
                            op.signature = await user.signOp(op, entryPoint)
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
                            op.signature = await user.signOp(op, entryPoint)
                            await user.transfer(op.sender, fp(1))
                          })

                          it('reverts', async () => {
                            await expect(entryPoint.handleOps(op)).to.be.revertedWith('Arithmetic operation underflowed')
                          })
                        })
                      })
                    })

                    context('with a paymaster', () => {
                      let paymaster

                      beforeEach('create paymaster', async () => {

                      })
                    })
                  })
                })

                context('when the op was signed incorrectly', () => {
                  beforeEach('sign op', async () => {
                    op.signature = await user.signOp(op, entryPoint)
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
                  op.signature = await user.signOp(op, entryPoint)
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
                op.signature = await user.signOp(op, entryPoint)
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
              op.signature = await user.signOp(op, entryPoint)
            })

            it.skip('forces to pay gas anyway', async () => {
              await entryPoint.handleOps(op)
            })
          })
        })

        context('when there is no specified call to execute', () => {
          // TODO: Execute fails (calling non-contract), user should pay gas anyway

          beforeEach('sign op', async () => {
            op.signature = await user.signOp(op, entryPoint)
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
      beforeEach('build empty op', () => {
        op = user.buildOp()
      })

      context('when the op includes some init code', () => {
        beforeEach('set init code', async () => {
          op.initCode = await user.getWalletDeploymentCode(entryPoint)
          op.sender = await entryPoint.getSenderAddress(op)
        })

        itHandleOpsProperly(() => {
          it('creates a wallet', async () => {
            await entryPoint.handleOps(op)

            const wallet = await instanceAt('Wallet', op.sender)
            expect(await wallet.entryPoint()).to.equal(entryPoint.address)
            expect(await wallet.hasRole(OWNER_ROLE, user.signer.address)).to.be.true
            expect(await wallet.hasRole(OWNER_ROLE, user.signer.address)).to.be.true

            for (const guardian of user.guardians) {
              expect(await wallet.hasRole(GUARDIAN_ROLE, guardian.address)).to.be.true
            }
          })

          // TODO: AUDIT! This is probably not properly setup
          it('set ups access control roles', async () => {
            await entryPoint.handleOps(op)

            const wallet = await instanceAt('Wallet', op.sender)
            expect(await wallet.hasRole(OWNER_ROLE, user.signer.address)).to.be.true
            expect(await wallet.hasRole(OWNER_ROLE, user.signer.address)).to.be.true

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
      let createWalletOp: UserOp

      beforeEach('create wallet', async () => {
        createWalletOp = user.buildOp({
          initCode: await user.getWalletDeploymentCode(entryPoint),
          verificationGas: WALLET_VERIFICATION_GAS,
          preVerificationGas: WALLET_CREATION_GAS,
          callData: await encodeWalletExecute(await deploy('Counter'), await encodeCounterIncrement()),
          callGas: COUNTER_CALL_WITHOUT_VALUE_GAS,
        })

        createWalletOp.sender = await entryPoint.getSenderAddress(createWalletOp)
        createWalletOp.signature = await user.signOp(createWalletOp, entryPoint)
        await entryPoint.handleOps(createWalletOp)

        op = user.buildOp()
        op.sender = createWalletOp.sender
      })

      context('when the op includes some init code', () => {
        // TODO: Audit, this should revert

        beforeEach('set init code', async () => {
          op.initCode = await user.getWalletDeploymentCode(entryPoint)
          op.verificationGas = WALLET_VERIFICATION_GAS
          op.callData = await encodeWalletExecute(await deploy('Counter'), await encodeCounterIncrement())
          op.callGas = COUNTER_CALL_WITHOUT_VALUE_GAS
          op.signature = await user.signOp(op, entryPoint)
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
})

describe("EntryPoint", () => {
  let owner: SignerWithAddress;
  let paymaster: SignerWithAddress;

  let entryPoint: Contract;
  let walletImplementation: Contract;
  let test: Contract;

  let initCode: string;
  let paymasterInitCode: string;

  let sender: string;
  let paymasterWallet: string;

  beforeEach(async () => {
    [owner, paymaster] = await ethers.getSigners();
    const [EntryPoint, Wallet, Test] = await Promise.all([
      ethers.getContractFactory("EntryPoint"),
      ethers.getContractFactory("Wallet"),
      ethers.getContractFactory("Test"),
    ]);

    [entryPoint, walletImplementation, test] = await Promise.all([
      EntryPoint.deploy(contracts.SingletonFactory.address),
      Wallet.deploy(),
      Test.deploy(),
    ]);
    contracts.Wallet.address = walletImplementation.address;
    contracts.EntryPoint.address = entryPoint.address;

    const ownerInit = [
      contracts.Wallet.address,
      contracts.EntryPoint.address,
      owner.address,
      [],
    ];
    const paymasterInit = [
      contracts.Wallet.address,
      contracts.EntryPoint.address,
      paymaster.address,
      [],
    ];

    initCode = wallet.proxy.getInitCode(...ownerInit);
    paymasterInitCode = wallet.proxy.getInitCode(...paymasterInit);

    sender = wallet.proxy.getAddress(...ownerInit);
    paymasterWallet = wallet.proxy.getAddress(...paymasterInit);
  });

  describe("handleOps", () => {
    it("Reverts if paymaster stake is not locked", async () => {
      await entryPoint
        .connect(paymaster)
        .addStake({ value: DEFAULT_REQUIRED_PRE_FUND });
      const userOp = await wallet.userOperations.sign(
        owner,
        await wallet.userOperations.signPaymasterData(
          paymaster,
          paymaster.address,
          ...PAYMASTER_OPTS,
          wallet.userOperations.get(sender, {
            initCode,
          })
        )
      );

      await expect(
        entryPoint.handleOps([userOp], ethers.constants.AddressZero)
      ).to.be.revertedWith("EntryPoint: Stake not locked");
    });

    it("Reverts if paymaster does not have enough Eth staked", async () => {
      await entryPoint
        .connect(paymaster)
        .addStake({ value: DEFAULT_REQUIRED_PRE_FUND.div(2) });
      await entryPoint.connect(paymaster).lockStake();
      const userOp = await wallet.userOperations.sign(
        owner,
        await wallet.userOperations.signPaymasterData(
          paymaster,
          paymaster.address,
          ...PAYMASTER_OPTS,
          wallet.userOperations.get(sender, {
            initCode,
          })
        )
      );

      await expect(
        entryPoint.handleOps([userOp], ethers.constants.AddressZero)
      ).to.be.revertedWith("EntryPoint: Insufficient stake");
    });

    it("Reverts if paymaster fails to validate user operation", async () => {
      await sendEth(paymaster, paymasterWallet, fp(10));
      const userOps = await Promise.all([
        wallet.userOperations.sign(
          paymaster,
          wallet.userOperations.get(paymasterWallet, {
            initCode: paymasterInitCode,
            callData: wallet.encodeFunctionData.addEntryPointStake(
              DEFAULT_REQUIRED_PRE_FUND
            ),
          })
        ),
        wallet.userOperations.sign(
          paymaster,
          wallet.userOperations.get(paymasterWallet, {
            callData: wallet.encodeFunctionData.lockEntryPointStake(),
            nonce: 1,
          })
        ),
      ]);
      await entryPoint
        .connect(paymaster)
        .handleOps(userOps, ethers.constants.AddressZero);

      const userOp = await wallet.userOperations.sign(
        owner,
        await wallet.userOperations.signPaymasterData(
          paymaster,
          paymasterWallet,
          ...PAYMASTER_OPTS,
          wallet.userOperations.get(sender, {
            initCode,
            callData: wallet.encodeFunctionData.ERC20Approve(
              USDC_TOKEN,
              paymasterWallet,
              ethers.constants.Zero
            ),
          })
        )
      );
      await expect(
        entryPoint.handleOps([userOp], ethers.constants.AddressZero)
      ).to.be.revertedWith("Paymaster: Not approved");
    });

    describe("Successful transaction with paymaster", () => {
      beforeEach(async () => {
        await Promise.all([
          sendEth(paymaster, paymasterWallet, fp(10)),
          swapEthForToken(
            owner,
            sender,
            USDC_TOKEN,
            ethers.utils.parseEther("10")
          ),
        ]);

        const paymasterSetupOps = await Promise.all([
          wallet.userOperations.sign(
            paymaster,
            wallet.userOperations.get(paymasterWallet, {
              initCode: paymasterInitCode,
              callData: wallet.encodeFunctionData.addEntryPointStake(
                ethers.utils.parseEther("1")
              ),
            })
          ),
          wallet.userOperations.sign(
            paymaster,
            wallet.userOperations.get(paymasterWallet, {
              callData: wallet.encodeFunctionData.lockEntryPointStake(),
              nonce: 1,
            })
          ),
        ]);
        await entryPoint
          .connect(paymaster)
          .handleOps(paymasterSetupOps, ethers.constants.AddressZero);
      });

      it("Does not revert if paymaster has enough Eth staked, validates user operation is OK, and gets paid", async () => {
        const userOps = await Promise.all([
          wallet.userOperations.sign(
            owner,
            await wallet.userOperations.signPaymasterData(
              paymaster,
              paymasterWallet,
              ...PAYMASTER_OPTS,
              wallet.userOperations.get(sender, {
                initCode,
                callData: wallet.encodeFunctionData.ERC20Approve(
                  USDC_TOKEN,
                  paymasterWallet,
                  ethers.constants.MaxUint256
                ),
              })
            )
          ),
          wallet.userOperations.sign(
            owner,
            await wallet.userOperations.signPaymasterData(
              paymaster,
              paymasterWallet,
              ...PAYMASTER_OPTS_NO_FEE,
              wallet.userOperations.get(sender, {
                callData: wallet.encodeFunctionData.ERC20Transfer(
                  USDC_TOKEN,
                  owner.address,
                  ethers.utils.parseUnits("1", "mwei")
                ),
                nonce: 1,
              })
            )
          ),
        ]);
        const [preStake, preTokenBalance] = await Promise.all([
          entryPoint.getStake(paymasterWallet),
          contracts.Erc20.getInstance(USDC_TOKEN, ethers.provider).balanceOf(
            paymasterWallet
          ),
        ]);

        await expect(
          entryPoint.handleOps(userOps, ethers.constants.AddressZero)
        ).to.not.be.reverted;

        const [postStake, postTokenBalance] = await Promise.all([
          entryPoint.getStake(paymasterWallet),
          contracts.Erc20.getInstance(USDC_TOKEN, ethers.provider).balanceOf(
            paymasterWallet
          ),
        ]);
        expect(postStake[0].lt(preStake[0])).to.be.true;
        expect(postTokenBalance.gt(preTokenBalance.add(PAYMASTER_FEE))).to.be
          .true;
      });
    });
  });

  describe("addStake", () => {
    it("Should receive Eth stake from paymaster", async () => {
      expect(
        (await getAddressBalances([contracts.EntryPoint.address]))[0]
      ).to.equal(0);
      expect(await entryPoint.getStake(owner.address)).to.deep.equal([
        ethers.constants.Zero,
        ethers.constants.Zero,
        false,
      ]);

      await entryPoint.addStake({ value: DEFAULT_REQUIRED_PRE_FUND });

      expect(
        (await getAddressBalances([contracts.EntryPoint.address]))[0]
      ).to.equal(DEFAULT_REQUIRED_PRE_FUND);
      expect(await entryPoint.getStake(owner.address)).to.deep.equal([
        DEFAULT_REQUIRED_PRE_FUND,
        ethers.constants.Zero,
        false,
      ]);
    });
  });

  describe("lockStake", () => {
    it("Should lock staked Eth from paymaster", async () => {
      await entryPoint.addStake({ value: DEFAULT_REQUIRED_PRE_FUND });
      expect(await entryPoint.getStake(owner.address)).to.deep.equal([
        DEFAULT_REQUIRED_PRE_FUND,
        ethers.constants.Zero,
        false,
      ]);

      await entryPoint.lockStake();
      expect(await entryPoint.getStake(owner.address)).to.deep.equal([
        DEFAULT_REQUIRED_PRE_FUND,
        ethers.BigNumber.from(
          (await getLastBlockTimestamp()) + PAYMASTER_LOCK_EXPIRY_PERIOD
        ),
        true,
      ]);
    });
  });

  describe("unlockStake", () => {
    it("Should unlock stake if past lock expiry time", async () => {
      await entryPoint.addStake({ value: DEFAULT_REQUIRED_PRE_FUND });
      await entryPoint.lockStake();
      expect(await entryPoint.getStake(owner.address)).to.deep.equal([
        DEFAULT_REQUIRED_PRE_FUND,
        ethers.BigNumber.from(
          (await getLastBlockTimestamp()) + PAYMASTER_LOCK_EXPIRY_PERIOD
        ),
        true,
      ]);

      await incrementBlockTimestamp(PAYMASTER_LOCK_EXPIRY_PERIOD);
      await entryPoint.unlockStake();
      expect(await entryPoint.getStake(owner.address)).to.deep.equal([
        DEFAULT_REQUIRED_PRE_FUND,
        ethers.constants.Zero,
        false,
      ]);
    });

    it("Should revert if not past lock expiry time", async () => {
      await entryPoint.addStake({ value: DEFAULT_REQUIRED_PRE_FUND });
      await entryPoint.lockStake();
      const expectedStake = await entryPoint.getStake(owner.address);

      await expect(entryPoint.unlockStake()).to.be.revertedWith(
        "EntryPoint: Lock not expired"
      );
      expect(await entryPoint.getStake(owner.address)).to.deep.equal(
        expectedStake
      );
    });
  });

  describe("withdrawStake", () => {
    it("Should withdraw unlocked stake to the given address", async () => {
      await entryPoint.addStake({ value: DEFAULT_REQUIRED_PRE_FUND });
      await entryPoint.lockStake();
      await incrementBlockTimestamp(PAYMASTER_LOCK_EXPIRY_PERIOD);
      await entryPoint.unlockStake();

      const [initBalance] = await getAddressBalances([owner.address]);
      const tx = await entryPoint.withdrawStake(owner.address)
      const receipt = await tx.wait()
      const [finalBalance] = await getAddressBalances([owner.address]);
      expect(
        initBalance.sub(transactionFee(receipt)).add(DEFAULT_REQUIRED_PRE_FUND)
      ).to.equal(finalBalance);
      expect(await entryPoint.getStake(owner.address)).to.deep.equal([
        ethers.constants.Zero,
        ethers.constants.Zero,
        false,
      ]);
    });

    it("Should revert if stake has not been unlocked", async () => {
      await entryPoint.addStake({ value: DEFAULT_REQUIRED_PRE_FUND });
      await entryPoint.lockStake();
      const expectedStake = await entryPoint.getStake(owner.address);

      await expect(entryPoint.withdrawStake(owner.address)).to.be.revertedWith(
        "EntryPoint: Stake is locked"
      );
      expect(await entryPoint.getStake(owner.address)).to.deep.equal(
        expectedStake
      );
    });
  });
});
