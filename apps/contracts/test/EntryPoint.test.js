const { expect } = require("chai");
const { ethers } = require("hardhat");
const { SINGLETON_FACTORY_ADDRESS } = require("../utils/deployHelpers");
const {
  DEFAULT_REQUIRED_PRE_FUND,
  LOCK_EXPIRY_PERIOD,
  USDC_TOKEN,
  encodeAddStake,
  encodeLockStake,
  encodeERC20MaxApprove,
  encodeERC20ZeroApprove,
  encodeFailEntryPointCall,
  encodePassEntryPointCall,
  getAddressBalances,
  getTokenBalance,
  getUserOperation,
  getContractAddress,
  getLastBlockTimestamp,
  incrementBlockTimestamp,
  isWalletDeployed,
  sendEth,
  signUserOperation,
  swapEthForToken,
  transactionFee,
  withPaymaster,
} = require("../utils/contractHelpers");

describe("EntryPoint", () => {
  let owner;
  let paymaster;
  let entryPoint;
  let initCode;
  let paymasterInitCode;
  let sender;
  let paymasterWallet;
  let test;

  beforeEach(async () => {
    [owner, paymaster] = await ethers.getSigners();
    const [EntryPoint, Wallet, Test] = await Promise.all([
      ethers.getContractFactory("EntryPoint"),
      ethers.getContractFactory("Wallet"),
      ethers.getContractFactory("Test"),
    ]);

    [entryPoint, test] = await Promise.all([
      EntryPoint.deploy(SINGLETON_FACTORY_ADDRESS),
      Test.deploy(),
    ]);
    initCode = Wallet.getDeployTransaction(
      entryPoint.address,
      owner.address
    ).data;
    paymasterInitCode = Wallet.getDeployTransaction(
      entryPoint.address,
      paymaster.address
    ).data;
    sender = getContractAddress(SINGLETON_FACTORY_ADDRESS, initCode);
    paymasterWallet = getContractAddress(
      SINGLETON_FACTORY_ADDRESS,
      paymasterInitCode
    );
  });

  describe("handleOps", () => {
    it("Uses CREATE2 to deploy wallet if it does not yet exist", async () => {
      await sendEth(owner, sender, DEFAULT_REQUIRED_PRE_FUND);
      const userOp = await signUserOperation(
        owner,
        getUserOperation(sender, { initCode })
      );

      expect(await isWalletDeployed(sender)).to.be.false;
      await entryPoint.handleOps([userOp], ethers.constants.AddressZero);
      expect(await isWalletDeployed(sender)).to.be.true;
    });

    it("Reverts if the wallet does not exist and the initcode is empty", async () => {
      const userOp = await signUserOperation(owner, getUserOperation(sender));

      await expect(
        entryPoint.handleOps([userOp], ethers.constants.AddressZero)
      ).to.be.revertedWith("EntryPoint: No wallet & initCode");
    });

    it("Reverts if the wallet does not pay the correct prefund", async () => {
      await sendEth(owner, sender, "0.0015");
      const userOp = await signUserOperation(
        owner,
        getUserOperation(sender, { initCode })
      );

      await expect(
        entryPoint.handleOps([userOp], ethers.constants.AddressZero)
      ).to.be.revertedWith("EntryPoint: incorrect prefund");
    });

    it("Does not revert if callData is good", async () => {
      await sendEth(owner, sender, DEFAULT_REQUIRED_PRE_FUND);
      const userOp = await signUserOperation(
        owner,
        getUserOperation(sender, {
          initCode,
          callData: encodePassEntryPointCall(test.address),
        })
      );

      const [preRedeemerBalance, preSenderBalance] = await getAddressBalances([
        ethers.constants.AddressZero,
        sender,
      ]);
      await expect(entryPoint.handleOps([userOp], ethers.constants.AddressZero))
        .to.not.be.reverted;

      const [postRedeemerBalance, postSenderBalance] = await getAddressBalances(
        [ethers.constants.AddressZero, sender]
      );
      expect(postRedeemerBalance.gt(preRedeemerBalance)).to.be.true;
      expect(postSenderBalance.lt(preSenderBalance)).to.be.true;
      expect(postRedeemerBalance.sub(preRedeemerBalance)).to.equal(
        preSenderBalance.sub(postSenderBalance)
      );
    });

    it("Reverts if callData is bad", async () => {
      await sendEth(owner, sender, DEFAULT_REQUIRED_PRE_FUND);
      const userOp = await signUserOperation(
        owner,
        getUserOperation(sender, {
          initCode,
          callData: encodeFailEntryPointCall(test.address),
        })
      );

      await expect(
        entryPoint.handleOps([userOp], ethers.constants.AddressZero)
      ).to.be.revertedWith("Test: reverted");
    });

    it("Does not revert with EIP-1559 style transactions", async () => {
      await sendEth(owner, sender, DEFAULT_REQUIRED_PRE_FUND);
      const userOp = await signUserOperation(
        owner,
        getUserOperation(sender, {
          initCode,
          // use recommended default of 2 GWei for maxPriorityFee
          maxPriorityFeePerGas: ethers.utils.parseEther("2", "gwei"),
        })
      );

      await expect(entryPoint.handleOps([userOp], ethers.constants.AddressZero))
        .to.not.be.reverted;
    });

    it("Reverts if paymaster stake is not locked", async () => {
      await entryPoint
        .connect(paymaster)
        .addStake({ value: DEFAULT_REQUIRED_PRE_FUND });
      const userOp = await signUserOperation(
        owner,
        await withPaymaster(
          paymaster,
          paymaster.address,
          getUserOperation(sender, {
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
      const userOp = await signUserOperation(
        owner,
        await withPaymaster(
          paymaster,
          paymaster.address,
          getUserOperation(sender, {
            initCode,
          })
        )
      );

      await expect(
        entryPoint.handleOps([userOp], ethers.constants.AddressZero)
      ).to.be.revertedWith("EntryPoint: Insufficient stake");
    });

    it("Reverts if paymaster fails to validate user operation", async () => {
      await sendEth(paymaster, paymasterWallet, "10");
      const userOps = await Promise.all([
        signUserOperation(
          paymaster,
          getUserOperation(paymasterWallet, {
            initCode: paymasterInitCode,
            callData: encodeAddStake(
              entryPoint.address,
              DEFAULT_REQUIRED_PRE_FUND
            ),
          })
        ),
        signUserOperation(
          paymaster,
          getUserOperation(paymasterWallet, {
            callData: encodeLockStake(entryPoint.address),
          })
        ),
      ]);
      await entryPoint
        .connect(paymaster)
        .handleOps(userOps, ethers.constants.AddressZero);

      const userOp = await signUserOperation(
        owner,
        await withPaymaster(
          paymaster,
          paymasterWallet,
          getUserOperation(sender, {
            initCode,
            callData: encodeERC20ZeroApprove(paymasterWallet),
          })
        )
      );
      await expect(
        entryPoint.handleOps([userOp], ethers.constants.AddressZero)
      ).to.be.revertedWith("Paymaster: Not approved");
    });

    it("Does not revert if paymaster has enough Eth staked, successfully validates user operation, and gets paid", async () => {
      await sendEth(paymaster, paymasterWallet, "10");
      await swapEthForToken(
        owner,
        sender,
        USDC_TOKEN,
        ethers.utils.parseEther("10")
      );

      const paymasterSetupOps = await Promise.all([
        signUserOperation(
          paymaster,
          getUserOperation(paymasterWallet, {
            initCode: paymasterInitCode,
            callData: encodeAddStake(
              entryPoint.address,
              DEFAULT_REQUIRED_PRE_FUND
            ),
          })
        ),
        signUserOperation(
          paymaster,
          getUserOperation(paymasterWallet, {
            callData: encodeLockStake(entryPoint.address),
          })
        ),
      ]);
      await entryPoint
        .connect(paymaster)
        .handleOps(paymasterSetupOps, ethers.constants.AddressZero);

      const userOp = await signUserOperation(
        owner,
        await withPaymaster(
          paymaster,
          paymasterWallet,
          getUserOperation(sender, {
            initCode,
            callData: encodeERC20MaxApprove(paymasterWallet),
          })
        )
      );
      const [preStake, preTokenBalance] = await Promise.all([
        entryPoint.getStake(paymasterWallet),
        getTokenBalance(paymasterWallet, USDC_TOKEN),
      ]);

      await expect(entryPoint.handleOps([userOp], ethers.constants.AddressZero))
        .to.not.be.reverted;

      const [postStake, postTokenBalance] = await Promise.all([
        entryPoint.getStake(paymasterWallet),
        getTokenBalance(paymasterWallet, USDC_TOKEN),
      ]);
      expect(postStake[0].lt(preStake[0])).to.be.true;
      expect(postTokenBalance.gt(preTokenBalance)).to.be.true;
    });
  });

  describe("addStake", () => {
    it("Should receive Eth stake from paymaster", async () => {
      expect(...(await getAddressBalances([entryPoint.address]))).to.equal(0);
      expect(await entryPoint.getStake(owner.address)).to.deep.equal([
        ethers.constants.Zero,
        ethers.constants.Zero,
        false,
      ]);

      await entryPoint.addStake({ value: DEFAULT_REQUIRED_PRE_FUND });

      expect(...(await getAddressBalances([entryPoint.address]))).to.equal(
        DEFAULT_REQUIRED_PRE_FUND
      );
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
          (await getLastBlockTimestamp()) + LOCK_EXPIRY_PERIOD
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
          (await getLastBlockTimestamp()) + LOCK_EXPIRY_PERIOD
        ),
        true,
      ]);

      await incrementBlockTimestamp(LOCK_EXPIRY_PERIOD);
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
      await incrementBlockTimestamp(LOCK_EXPIRY_PERIOD);
      await entryPoint.unlockStake();

      const [initBalance] = await getAddressBalances([owner.address]);
      const tx = await entryPoint
        .withdrawStake(owner.address)
        .then((tx) => tx.wait());
      const [finalBalance] = await getAddressBalances([owner.address]);
      expect(
        initBalance.sub(transactionFee(tx)).add(DEFAULT_REQUIRED_PRE_FUND)
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
