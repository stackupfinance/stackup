import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import { fp } from "./utils/helpers/numbers";
import { getSigner } from "./utils/helpers/signers";
import { advanceTime, currentTimestamp } from "./utils/helpers/time";

import Staking from "./utils/models/staking/Staking";
import { assertEvent, assertIndirectEvent } from "./utils/helpers/asserts";
import { POST_OP_MODE_OK } from "./utils/helpers/constants";

describe("Staking", () => {
  let staking: Staking;
  let paymaster: SignerWithAddress;

  const UNLOCK_DELAY = 172800; // 2 days

  beforeEach("load paymaster", async () => {
    paymaster = await getSigner();
  });

  beforeEach("deploy staking", async () => {
    staking = await Staking.create(UNLOCK_DELAY);
  });

  describe("receive", () => {
    const amount = fp(1);

    it("accepts ETH from anyone", async () => {
      await paymaster.sendTransaction({ to: staking.address, value: amount });

      expect(await ethers.provider.getBalance(staking.address)).to.be.equal(
        amount
      );
    });
  });

  describe("deposit", () => {
    const amount = fp(1);

    const itDepositsCorrectly = () => {
      it("deposits to the given address", async () => {
        const previousBalance = await ethers.provider.getBalance(
          paymaster.address
        );
        const previousStake = await staking.balanceOf(paymaster);

        await staking.deposit(paymaster, amount, { from: paymaster });

        const currentBalance = await ethers.provider.getBalance(
          paymaster.address
        );
        expect(currentBalance).to.be.lt(previousBalance.sub(amount));

        const currentStake = await staking.balanceOf(paymaster);
        expect(currentStake).to.be.equal(previousStake.add(amount));

        expect(await staking.hasDeposited(paymaster, amount)).to.be.true;
      });

      it("does not affect the unlocking information", async () => {
        const previousData = await staking.getDeposit(paymaster);

        await staking.deposit(paymaster, amount);

        const currentData = await staking.getDeposit(paymaster);
        expect(previousData.unstakeDelaySec).to.be.equal(
          currentData.unstakeDelaySec
        );
        expect(previousData.withdrawTime).to.be.equal(currentData.withdrawTime);
      });

      it("emits a Deposited event", async () => {
        const previousStake = await staking.balanceOf(paymaster);

        const receipt = await staking.deposit(paymaster, amount, {
          from: paymaster,
        });

        await assertEvent(receipt, "Deposited", {
          account: paymaster.address,
          deposited: previousStake.add(amount),
        });
      });
    };

    const itDoesNotStake = () => {
      it("does not consider the deposited balance staked", async () => {
        await staking.deposit(paymaster, amount);

        expect(await staking.isStaked(paymaster)).to.be.false;
      });
    };

    const itCanWithdraw = () => {
      it("allows the account to withdraw the deposit immediately", async () => {
        await staking.deposit(paymaster, amount);

        expect(await staking.canWithdraw(paymaster)).to.be.true;
      });
    };

    context("when the paymaster did not deposit", async () => {
      beforeEach("ensure no deposit", async () => {
        expect(await staking.hasDeposited(paymaster, 1)).to.be.false;
      });

      itDepositsCorrectly();
      itDoesNotStake();
      itCanWithdraw();
    });

    context("when the paymaster has already deposit", async () => {
      beforeEach("deposit", async () => {
        await staking.deposit(paymaster, amount);
      });

      context("when the paymaster did not stake yet", async () => {
        beforeEach("ensure no stake", async () => {
          expect(await staking.isStaked(paymaster)).to.be.false;
        });

        itDepositsCorrectly();
        itDoesNotStake();
        itCanWithdraw();
      });

      context("when the paymaster has already staked", async () => {
        beforeEach("stake", async () => {
          await staking.stake(UNLOCK_DELAY, 0);
        });

        context("when the paymaster did not unstaked yet", async () => {
          beforeEach("ensure no unstake", async () => {
            expect(await staking.isUnstaking(paymaster)).to.be.false;
          });

          itDepositsCorrectly();
        });

        context("when the paymaster is unstaking", async () => {
          beforeEach("unstake", async () => {
            await staking.unstake();
          });

          itDepositsCorrectly();
        });
      });
    });
  });

  describe("stake", () => {
    const amount = fp(1);

    const itStakesCorrectly = () => {
      context(
        "when the given delay is lower than the specified by the contract",
        () => {
          const delay = UNLOCK_DELAY - 1;

          it("reverts", async () => {
            await expect(
              staking.stake(delay, amount, { from: paymaster })
            ).to.be.revertedWith("Staking: Low unstake delay");
          });
        }
      );

      context(
        "when the given delay is higher than or equal to the specified by the contract",
        () => {
          const delay = UNLOCK_DELAY;

          it("deposits to the given address", async () => {
            const previousBalance = await ethers.provider.getBalance(
              paymaster.address
            );
            const previousStake = await staking.balanceOf(paymaster);

            await staking.stake(delay, amount, { from: paymaster });

            const currentBalance = await ethers.provider.getBalance(
              paymaster.address
            );
            expect(currentBalance).to.be.lt(previousBalance.sub(amount));

            const currentStake = await staking.balanceOf(paymaster);
            expect(currentStake).to.be.equal(previousStake.add(amount));

            expect(await staking.hasDeposited(paymaster, amount)).to.be.true;
          });

          it("marks the account as staked", async () => {
            await staking.stake(delay, amount, { from: paymaster });

            expect(await staking.isStaked(paymaster)).to.be.true;
          });

          it("cannot withdraw the deposit immediately", async () => {
            await staking.stake(delay, amount, { from: paymaster });

            expect(await staking.canWithdraw(paymaster)).to.be.false;
          });

          it("tracks the requested delay period", async () => {
            await staking.stake(delay, amount, { from: paymaster });

            const currentData = await staking.getDeposit(paymaster);
            expect(currentData.unstakeDelaySec).to.be.equal(delay);
          });

          it("resets the withdraw time to zero", async () => {
            await staking.stake(delay, amount, { from: paymaster });

            const currentData = await staking.getDeposit(paymaster);
            expect(currentData.withdrawTime).to.be.equal(0);
          });

          it("emits a StakeLocked event", async () => {
            const previousStake = await staking.balanceOf(paymaster);

            const receipt = await staking.stake(delay, amount, {
              from: paymaster,
            });

            await assertEvent(receipt, "StakeLocked", {
              account: paymaster.address,
              deposited: previousStake.add(amount),
              unstakeDelaySec: delay,
            });
          });
        }
      );
    };

    context("when the paymaster did not deposit", async () => {
      beforeEach("ensure no deposit", async () => {
        expect(await staking.hasDeposited(paymaster, 1)).to.be.false;
      });

      itStakesCorrectly();
    });

    context("when the paymaster has already deposit", async () => {
      beforeEach("deposit", async () => {
        await staking.deposit(paymaster, amount);
      });

      context("when the paymaster did not stake yet", async () => {
        beforeEach("ensure no stake", async () => {
          expect(await staking.isStaked(paymaster)).to.be.false;
        });

        itStakesCorrectly();
      });

      context("when the paymaster has already staked", async () => {
        beforeEach("stake", async () => {
          await staking.stake(UNLOCK_DELAY, 0);
        });

        context("when the paymaster did not unstaked yet", async () => {
          beforeEach("ensure no unstake", async () => {
            expect(await staking.isUnstaking(paymaster)).to.be.false;
          });

          itStakesCorrectly();
        });

        context("when the paymaster is unstaking", async () => {
          beforeEach("unstake", async () => {
            await staking.unstake();
          });

          itStakesCorrectly();
        });
      });
    });
  });

  describe("unstake", () => {
    context("when the paymaster did not deposit", async () => {
      beforeEach("ensure no deposit", async () => {
        expect(await staking.hasDeposited(paymaster, 1)).to.be.false;
      });

      it("reverts", async () => {
        await expect(staking.unstake({ from: paymaster })).to.be.revertedWith(
          "Staking: Deposit not staked yet"
        );
      });
    });

    context("when the paymaster has already deposit", async () => {
      beforeEach("deposit", async () => {
        await staking.deposit(paymaster, fp(1));
      });

      context("when the paymaster did not stake yet", async () => {
        beforeEach("ensure no stake", async () => {
          expect(await staking.isStaked(paymaster)).to.be.false;
        });

        it("reverts", async () => {
          await expect(staking.unstake({ from: paymaster })).to.be.revertedWith(
            "Staking: Deposit not staked yet"
          );
        });
      });

      context("when the paymaster has already staked", async () => {
        beforeEach("stake", async () => {
          await staking.stake(UNLOCK_DELAY, 0);
        });

        context("when the paymaster did not unstaked yet", async () => {
          beforeEach("ensure no unstake", async () => {
            expect(await staking.isUnstaking(paymaster)).to.be.false;
          });

          it("marks the account as unstaking", async () => {
            await staking.unstake({ from: paymaster });

            expect(await staking.isUnstaking(paymaster)).to.be.true;
          });

          it("does not consider the account as staked anymore", async () => {
            await staking.unstake({ from: paymaster });

            expect(await staking.isStaked(paymaster)).to.be.false;
          });

          it("does not consider the account can withdraw immediately", async () => {
            await staking.unstake({ from: paymaster });

            expect(await staking.canWithdraw(paymaster)).to.be.false;
          });

          it("does not affect the deposited amount", async () => {
            const previousData = await staking.getDeposit(paymaster);

            await staking.unstake({ from: paymaster });

            const currentData = await staking.getDeposit(paymaster);
            expect(previousData.amount).to.be.equal(currentData.amount);
          });

          it("does not affect the unstake delay period", async () => {
            const previousStake = await staking.balanceOf(paymaster);

            await staking.unstake({ from: paymaster });

            const currentStake = await staking.balanceOf(paymaster);
            expect(currentStake).to.be.equal(previousStake);
          });

          it("sets a withdraw time", async () => {
            const previousData = await staking.getDeposit(paymaster);

            await staking.unstake({ from: paymaster });

            const timestamp = await currentTimestamp();
            const currentData = await staking.getDeposit(paymaster);
            expect(currentData.withdrawTime).to.be.equal(
              timestamp.add(previousData.unstakeDelaySec)
            );
          });

          it("emits a StakeUnlocked event", async () => {
            const previousData = await staking.getDeposit(paymaster);

            const receipt = await staking.unstake({ from: paymaster });
            const timestamp = await currentTimestamp();

            await assertEvent(receipt, "StakeUnlocked", {
              account: paymaster.address,
              withdrawTime: timestamp.add(previousData.unstakeDelaySec),
            });
          });
        });

        context("when the paymaster is unstaking", async () => {
          beforeEach("unstake", async () => {
            await staking.unstake();
          });

          it("reverts", async () => {
            await expect(
              staking.unstake({ from: paymaster })
            ).to.be.revertedWith("Staking: Unstaking in progress");
          });
        });
      });
    });
  });

  describe("withdraw", () => {
    const amount = fp(1);

    const itWithdrawsProperly = () => {
      it("transfers the deposited balance to the recipient", async () => {
        const previousBalance = await ethers.provider.getBalance(
          paymaster.address
        );
        const previousDeposit = await staking.balanceOf(paymaster);

        await staking.withdraw(paymaster, { from: paymaster });

        const currentBalance = await ethers.provider.getBalance(
          paymaster.address
        );
        expect(currentBalance).to.be.lt(previousBalance.add(amount));

        const currentDeposit = await staking.balanceOf(paymaster);
        expect(currentDeposit).to.be.equal(previousDeposit.sub(amount));

        expect(await staking.hasDeposited(paymaster, amount)).to.be.false;
      });

      it("unmarks the account as unstaking", async () => {
        await staking.withdraw(paymaster, { from: paymaster });

        expect(await staking.isUnstaking(paymaster)).to.be.false;
      });

      it("allows the account to continue withdrawing", async () => {
        await staking.withdraw(paymaster, { from: paymaster });

        expect(await staking.canWithdraw(paymaster)).to.be.true;
      });

      it("does not consider the account as staked", async () => {
        await staking.withdraw(paymaster, { from: paymaster });

        expect(await staking.isStaked(paymaster)).to.be.false;
      });

      it("unsets the unstake information", async () => {
        await staking.withdraw(paymaster, { from: paymaster });

        const currentData = await staking.getDeposit(paymaster);
        expect(currentData.withdrawTime).to.be.equal(0);
        expect(currentData.unstakeDelaySec).to.be.equal(0);
      });

      it("emits a Withdrawn event", async () => {
        const previousStake = await staking.balanceOf(paymaster);

        const receipt = await staking.withdraw(paymaster, { from: paymaster });

        await assertEvent(receipt, "Withdrawn", {
          account: paymaster.address,
          recipient: paymaster.address,
          deposited: previousStake.sub(amount),
          amount,
        });
      });
    };

    context("when the paymaster did not deposit", async () => {
      beforeEach("ensure no deposit", async () => {
        expect(await staking.hasDeposited(paymaster, 1)).to.be.false;
      });

      it("reverts", async () => {
        await expect(
          staking.withdraw(paymaster, { from: paymaster })
        ).to.be.revertedWith("Staking: Withdraw amount zero");
      });
    });

    context("when the paymaster has already deposit", async () => {
      beforeEach("deposit", async () => {
        await staking.deposit(paymaster, amount);
      });

      context("when the paymaster did not stake yet", async () => {
        beforeEach("ensure no stake", async () => {
          expect(await staking.isStaked(paymaster)).to.be.false;
        });

        itWithdrawsProperly();
      });

      context("when the paymaster has already staked", async () => {
        beforeEach("stake", async () => {
          await staking.stake(UNLOCK_DELAY, 0);
        });

        context("when the paymaster did not unstaked yet", async () => {
          beforeEach("ensure no unstake", async () => {
            expect(await staking.isUnstaking(paymaster)).to.be.false;
          });

          it("reverts", async () => {
            await expect(
              staking.withdraw(paymaster, { from: paymaster })
            ).to.be.revertedWith("Staking: Cannot withdraw");
          });
        });

        context("when the paymaster is unstaking", async () => {
          beforeEach("unstake", async () => {
            await staking.unstake();
          });

          context("when the unstake delay time has not passed", () => {
            it("reverts", async () => {
              await expect(
                staking.withdraw(paymaster, { from: paymaster })
              ).to.be.revertedWith("Staking: Cannot withdraw");
            });
          });

          context("when the unstake delay time has already passed", () => {
            beforeEach("advance time", async () => {
              await advanceTime(UNLOCK_DELAY);
            });

            itWithdrawsProperly();
          });
        });
      });
    });
  });
});
