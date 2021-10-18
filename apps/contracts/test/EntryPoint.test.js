const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  getUserOperation,
  getWalletAddress,
  isWalletDeployed,
} = require("../utils/testHelpers");

describe("EntryPoint", () => {
  let owner;
  let create2Factory;
  let entryPoint;
  let initCode;
  let sender;

  beforeEach(async () => {
    [owner] = await ethers.getSigners();
    const [SingletonFactory, EntryPoint, Wallet] = await Promise.all([
      ethers.getContractFactory("SingletonFactory"),
      ethers.getContractFactory("EntryPoint"),
      ethers.getContractFactory("Wallet"),
    ]);

    create2Factory = await SingletonFactory.deploy();
    entryPoint = await EntryPoint.deploy(create2Factory.address);
    initCode = Wallet.getDeployTransaction(
      entryPoint.address,
      owner.address
    ).data;
    sender = getWalletAddress(create2Factory.address, initCode);
  });

  describe("handleOps", () => {
    it("Uses CREATE2 to deploy wallet if it does not yet exist", async () => {
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
  });
});
