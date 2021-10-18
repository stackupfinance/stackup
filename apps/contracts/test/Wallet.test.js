const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  getUserOperation,
  getWalletBalances,
  sendEth,
  transactionFee,
} = require("../utils/testHelpers");

describe("Wallet", () => {
  let mockEntryPoint;
  let owner;
  let nonOwner;
  let wallet;

  beforeEach(async () => {
    [mockEntryPoint, owner, nonOwner] = await ethers.getSigners();

    const Wallet = await ethers.getContractFactory("Wallet");
    wallet = await Wallet.deploy(mockEntryPoint.address, owner.address);
  });

  describe("validateUserOp", () => {
    it("Required to be called from the Entry Point", async () => {
      const userOp = await getUserOperation(owner, wallet.address);

      await expect(wallet.validateUserOp(userOp, 0)).to.not.be.reverted;
      await expect(
        wallet.connect(owner).validateUserOp(userOp, 0)
      ).to.be.revertedWith("Wallet: Not from EntryPoint");
    });

    it("Required to be signed by wallet owner", async () => {
      const validUserOp = await getUserOperation(owner, wallet.address);
      const invalidUserOp = await getUserOperation(nonOwner, wallet.address);

      await expect(wallet.validateUserOp(validUserOp, 0)).to.not.be.reverted;
      await expect(wallet.validateUserOp(invalidUserOp, 0)).to.be.revertedWith(
        "Wallet: Invalid signature"
      );
    });

    it("Increments valid nonce", async () => {
      const validUserOp = await getUserOperation(owner, wallet.address);

      await expect(wallet.validateUserOp(validUserOp, 0)).to.not.be.reverted;
      expect(await wallet.nonce()).to.equal(1);
    });

    it("Reverts on an invalid nonce", async () => {
      const invalidUserOp = await getUserOperation(owner, wallet.address, {
        nonce: 1,
      });

      await expect(wallet.validateUserOp(invalidUserOp, 0)).to.be.revertedWith(
        "Wallet: Invalid nonce"
      );
    });

    it("Pays fee to the EntryPoint if requiredPrefund is non-zero", async () => {
      const requiredPrefund = await sendEth(owner, wallet.address, "0.1").then(
        (res) => res.value
      );
      const [entryPointInitBalance, walletInitBalance] =
        await getWalletBalances([mockEntryPoint.address, wallet.address]);
      expect(walletInitBalance).to.equal(requiredPrefund);

      const tx = await wallet
        .validateUserOp(
          await getUserOperation(owner, wallet.address),
          requiredPrefund
        )
        .then((res) => res.wait());

      const [entryPointFinalBalance, walletFinalBalance] =
        await getWalletBalances([mockEntryPoint.address, wallet.address]);
      expect(walletFinalBalance).to.equal(0);
      expect(
        entryPointInitBalance.sub(transactionFee(tx)).add(requiredPrefund)
      ).to.equal(entryPointFinalBalance);
    });

    it("Does not pay fee to the EntryPoint if requiredPrefund is zero", async () => {
      const balance = await sendEth(owner, wallet.address, "0.1").then(
        (res) => res.value
      );

      await wallet.validateUserOp(
        await getUserOperation(owner, wallet.address),
        0
      );
      const [walletBalance] = await getWalletBalances([wallet.address]);
      expect(walletBalance).to.equal(balance);
    });
  });
});
