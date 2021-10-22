const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  NULL_DATA,
  encodeFailContractCall,
  encodePassContractCall,
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
  let test;

  beforeEach(async () => {
    [mockEntryPoint, owner, nonOwner] = await ethers.getSigners();

    const [Wallet, Test] = await Promise.all([
      ethers.getContractFactory("Wallet"),
      ethers.getContractFactory("Test"),
    ]);
    [wallet, test] = await Promise.all([
      Wallet.deploy(mockEntryPoint.address, owner.address),
      Test.deploy(),
    ]);
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

  describe("executeUserOp", () => {
    it("Required to be called from the Entry Point", async () => {
      const value = ethers.utils.parseEther("0.1");

      await expect(
        wallet.connect(owner).executeUserOp(nonOwner.address, value, NULL_DATA)
      ).to.be.revertedWith("Wallet: Not from EntryPoint");
    });

    it("Sends the correct amount of Eth", async () => {
      const value = ethers.utils.parseEther("0.1");
      await sendEth(owner, wallet.address, value);
      const [initBalance] = await getWalletBalances([nonOwner.address]);

      await expect(wallet.executeUserOp(nonOwner.address, value, NULL_DATA)).to
        .not.be.reverted;
      const [finalBalance] = await getWalletBalances([nonOwner.address]);

      expect(finalBalance.sub(initBalance)).to.equal(value);
    });

    it("Reverts when not enough Eth", async () => {
      const value = ethers.utils.parseEther("0.1");

      await expect(
        wallet.executeUserOp(nonOwner.address, value, NULL_DATA)
      ).to.be.revertedWith("");
    });

    it("Can successfully make arbitrary contract calls", async () => {
      const data = encodePassContractCall();

      await expect(wallet.executeUserOp(test.address, 0, data)).to.not.be
        .reverted;
    });

    it("Can revert gracefully from failed arbitrary contract calls", async () => {
      const data = encodeFailContractCall();

      await expect(
        wallet.executeUserOp(test.address, 0, data)
      ).to.be.revertedWith("Test: reverted");
    });
  });
});
