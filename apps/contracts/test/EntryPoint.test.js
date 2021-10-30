const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  DEFAULT_REQUIRED_PRE_FUND,
  LOCK_EXPIRY_PERIOD,
  encodeFailEntryPointCall,
  encodePassEntryPointCall,
  getAddressBalances,
  getUserOperation,
  getWalletAddress,
  getLastBlockTimestamp,
  incrementBlockTimestamp,
  isWalletDeployed,
  sendEth,
  signUserOperation,
  transactionFee,
  withPaymaster,
} = require("../utils/testHelpers");

describe("EntryPoint", () => {
  let owner;
  let paymaster;
  let create2Factory;
  let entryPoint;
  let initCode;
  let sender;
  let test;

  beforeEach(async () => {
    [owner, paymaster] = await ethers.getSigners();
    const [SingletonFactory, EntryPoint, Wallet, Test] = await Promise.all([
      ethers.getContractFactory("SingletonFactory"),
      ethers.getContractFactory("EntryPoint"),
      ethers.getContractFactory("Wallet"),
      ethers.getContractFactory("Test"),
    ]);

    create2Factory = await SingletonFactory.deploy();
    [entryPoint, test] = await Promise.all([
      EntryPoint.deploy(create2Factory.address),
      Test.deploy(),
    ]);
    initCode = Wallet.getDeployTransaction(
      entryPoint.address,
      owner.address
    ).data;
    sender = getWalletAddress(create2Factory.address, initCode);
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

      await expect(entryPoint.handleOps([userOp], ethers.constants.AddressZero))
        .to.not.be.reverted;
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

    it("Reverts if paymaster does not have enough Eth staked", async () => {
      const userOp = await signUserOperation(
        owner,
        await withPaymaster(
          paymaster,
          getUserOperation(sender, {
            initCode,
          })
        )
      );

      await expect(
        entryPoint.handleOps([userOp], ethers.constants.AddressZero)
      ).to.be.revertedWith("EntryPoint: Invalid stake");
    });

    it("Does not revert if paymaster has enough Eth staked", async () => {
      await entryPoint
        .connect(paymaster)
        .addStake({ value: DEFAULT_REQUIRED_PRE_FUND });
      await entryPoint.connect(paymaster).lockStake();
      const userOp = await signUserOperation(
        owner,
        await withPaymaster(
          paymaster,
          getUserOperation(sender, {
            initCode,
          })
        )
      );

      await expect(entryPoint.handleOps([userOp], ethers.constants.AddressZero))
        .to.not.be.reverted;
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
