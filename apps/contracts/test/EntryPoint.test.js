const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  getUserOperation,
  getWalletAddress,
  isWalletDeployed,
} = require("../utils/testHelpers");

describe("EntryPoint", () => {
  let create2Factory;
  let entryPoint;
  let sender;
  let initCode;

  beforeEach(async () => {
    const [SingletonFactory, EntryPoint, Wallet] = await Promise.all([
      ethers.getContractFactory("SingletonFactory"),
      ethers.getContractFactory("EntryPoint"),
      ethers.getContractFactory("Wallet"),
    ]);

    create2Factory = await SingletonFactory.deploy();
    entryPoint = await EntryPoint.deploy(create2Factory.address);
    sender = getWalletAddress(create2Factory.address, initCode);
    initCode = Wallet.getDeployTransaction().data;
  });

  describe("handleOps", () => {
    it("Uses CREATE2 to deploy wallet if it does not yet exist", async () => {
      const userOp = getUserOperation(sender, { initCode });

      expect(await isWalletDeployed(sender)).to.be.false;
      await entryPoint.handleOps([userOp], ethers.constants.AddressZero);
      expect(await isWalletDeployed(sender)).to.be.true;
    });

    it("Reverts if the wallet does not exist and the initcode is empty", async () => {
      const userOp = getUserOperation(sender);

      await expect(
        entryPoint.handleOps([userOp], ethers.constants.AddressZero)
      ).to.be.revertedWith("ERC4337: No wallet and initCode");
    });
  });
});
