const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  DEFAULT_REQUIRED_PRE_FUND,
  encodeFailEntryPointCall,
  encodePassEntryPointCall,
  getUserOperation,
  getWalletAddress,
  isWalletDeployed,
  sendEth,
} = require("../utils/testHelpers");

describe("EntryPoint", () => {
  let owner;
  let create2Factory;
  let entryPoint;
  let initCode;
  let sender;
  let test;

  beforeEach(async () => {
    [owner] = await ethers.getSigners();
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
      const userOp = await getUserOperation(owner, sender, { initCode });

      expect(await isWalletDeployed(sender)).to.be.false;
      await entryPoint.handleOps([userOp], ethers.constants.AddressZero);
      expect(await isWalletDeployed(sender)).to.be.true;
    });

    it("Reverts if the wallet does not exist and the initcode is empty", async () => {
      const userOp = await getUserOperation(owner, sender);

      await expect(
        entryPoint.handleOps([userOp], ethers.constants.AddressZero)
      ).to.be.revertedWith("EntryPoint: No wallet & initCode");
    });

    it("Reverts if the wallet does not pay the correct prefund", async () => {
      await sendEth(owner, sender, "0.0015");
      const userOp = await getUserOperation(owner, sender, { initCode });

      await expect(
        entryPoint.handleOps([userOp], ethers.constants.AddressZero)
      ).to.be.revertedWith("EntryPoint: incorrect prefund");
    });

    it("Does not revert if callData is good", async () => {
      await sendEth(owner, sender, DEFAULT_REQUIRED_PRE_FUND);
      const userOp = await getUserOperation(owner, sender, {
        initCode,
        callData: encodePassEntryPointCall(test.address),
      });

      await expect(entryPoint.handleOps([userOp], ethers.constants.AddressZero))
        .to.not.be.reverted;
    });

    it("Reverts if callData is bad", async () => {
      await sendEth(owner, sender, DEFAULT_REQUIRED_PRE_FUND);
      const userOp = await getUserOperation(owner, sender, {
        initCode,
        callData: encodeFailEntryPointCall(test.address),
      });

      await expect(
        entryPoint.handleOps([userOp], ethers.constants.AddressZero)
      ).to.be.revertedWith("Test: reverted");
    });

    it("Does not revert with EIP-1559 style transactions", async () => {
      await sendEth(owner, sender, DEFAULT_REQUIRED_PRE_FUND);
      const userOp = await getUserOperation(owner, sender, {
        initCode,
        // use recommended default of 2 GWei for maxPriorityFee
        maxPriorityFeePerGas: ethers.utils.parseEther("2", "gwei"),
      });

      await expect(entryPoint.handleOps([userOp], ethers.constants.AddressZero))
        .to.not.be.reverted;
    });
  });
});
