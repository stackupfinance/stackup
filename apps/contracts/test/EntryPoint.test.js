const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  getUserOperation,
  getWalletAddress,
  isWalletDeployed,
} = require("../utils/testHelpers");

describe("EntryPoint", () => {
  let entryPoint;
  let initCode;

  beforeEach(async () => {
    const [EntryPoint, Wallet] = await Promise.all([
      ethers.getContractFactory("EntryPoint"),
      ethers.getContractFactory("Wallet"),
    ]);

    entryPoint = await EntryPoint.deploy();
    initCode = Wallet.getDeployTransaction().data;
  });

  describe("handleOps", () => {
    it("Uses CREATE2 to deploy wallet if it does not yet exist", async () => {
      const userOp = getUserOperation({ initCode });
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
      const userOp = getUserOperation();

      await expect(
        entryPoint.handleOps([userOp], ethers.constants.AddressZero)
      ).to.be.revertedWith("ERC4337: Null wallet + initCode");
    });
  });
});
