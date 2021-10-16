const { expect } = require("chai");
const { ethers } = require("hardhat");
const { getUserOperation } = require("../utils/testHelpers");

describe("Wallet", () => {
  let wallet;

  beforeEach(async () => {
    const Wallet = await ethers.getContractFactory("Wallet");
    wallet = await Wallet.deploy();
  });

  describe("validateUserOp", () => {
    it("Placeholder test", async () => {
      const userOp = getUserOperation();
      expect(await wallet.validateUserOp(userOp, 0)).to.not.throw;
    });
  });
});
