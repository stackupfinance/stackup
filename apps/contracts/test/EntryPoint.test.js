const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  NULL_CODE,
  getWalletAddress,
  isWalletDeployed,
} = require("../utils/testHelpers");

describe("EntryPoint", () => {
  let entryPoint;
  let userOp = {
    nonce: 0,
  };

  beforeEach(async () => {
    const EntryPoint = await ethers.getContractFactory("EntryPoint");
    entryPoint = await EntryPoint.deploy();

    const Wallet = await ethers.getContractFactory("Wallet");
    userOp.initCode = await Wallet.getDeployTransaction().data;
  });

  describe("handleOps", () => {
    it("Uses CREATE2 to deploy wallet if it does not yet exist", async () => {
      const address = getWalletAddress(
        entryPoint.address,
        userOp.nonce,
        userOp.initCode
      );

      expect(await isWalletDeployed(address)).to.be.false;
      await entryPoint.handleOps([userOp], ethers.constants.AddressZero);
      expect(await isWalletDeployed(address)).to.be.true;
    });

    it("Reverts if the wallet does not exist and the initcode is empty", async () => {
      userOp.initCode = NULL_CODE;

      await expect(
        entryPoint.handleOps([userOp], ethers.constants.AddressZero)
      ).to.be.revertedWith("ERC4337: Null wallet + initCode");
    });
  });
});
