const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  NULL_DATA,
  encodeERC20MaxApprove,
  encodeERC20ZeroApprove,
  encodeFailContractCall,
  encodePassContractCall,
  encodePassEntryPointCall,
  getAddressBalances,
  getUserOperation,
  sendEth,
  signUserOperation,
  transactionFee,
  withPaymaster,
} = require("../utils/contractHelpers");

describe("Wallet", () => {
  let mockEntryPoint;
  let paymasterUser;
  let regularUser;
  let paymasterUserWallet;
  let regularUserWallet;
  let test;

  beforeEach(async () => {
    [mockEntryPoint, paymasterUser, regularUser] = await ethers.getSigners();

    const [Wallet, Test] = await Promise.all([
      ethers.getContractFactory("Wallet"),
      ethers.getContractFactory("Test"),
    ]);

    [paymasterUserWallet, regularUserWallet, test] = await Promise.all([
      Wallet.connect(paymasterUser)
        .deploy(mockEntryPoint.address, paymasterUser.address)
        .then((w) => w.connect(mockEntryPoint)),
      Wallet.connect(regularUser)
        .deploy(mockEntryPoint.address, regularUser.address)
        .then((w) => w.connect(mockEntryPoint)),
      Test.deploy(),
    ]);
  });

  describe("validateUserOp", () => {
    it("Required to be called from the Entry Point", async () => {
      const userOp = await signUserOperation(
        paymasterUser,
        getUserOperation(paymasterUserWallet.address)
      );

      await expect(paymasterUserWallet.validateUserOp(userOp, 0)).to.not.be
        .reverted;
      await expect(
        paymasterUserWallet.connect(paymasterUser).validateUserOp(userOp, 0)
      ).to.be.revertedWith("Wallet: Not from EntryPoint");
    });

    it("Required to be signed by paymasterUserWallet paymasterUser", async () => {
      const validUserOp = await signUserOperation(
        paymasterUser,
        getUserOperation(paymasterUserWallet.address)
      );
      const invalidUserOp = await signUserOperation(
        regularUser,
        getUserOperation(paymasterUserWallet.address)
      );

      await expect(paymasterUserWallet.validateUserOp(validUserOp, 0)).to.not.be
        .reverted;
      await expect(
        paymasterUserWallet.validateUserOp(invalidUserOp, 0)
      ).to.be.revertedWith("Wallet: Invalid signature");
    });

    it("Increments valid nonce", async () => {
      const validUserOp = await signUserOperation(
        paymasterUser,
        getUserOperation(paymasterUserWallet.address)
      );

      await expect(paymasterUserWallet.validateUserOp(validUserOp, 0)).to.not.be
        .reverted;
      expect(await paymasterUserWallet.nonce()).to.equal(1);
    });

    it("Reverts on an invalid nonce", async () => {
      const invalidUserOp = await signUserOperation(
        paymasterUser,
        getUserOperation(paymasterUserWallet.address, {
          nonce: 1,
        })
      );

      await expect(
        paymasterUserWallet.validateUserOp(invalidUserOp, 0)
      ).to.be.revertedWith("Wallet: Invalid nonce");
    });

    it("Pays fee to the EntryPoint if requiredPrefund is non-zero", async () => {
      const requiredPrefund = await sendEth(
        paymasterUser,
        paymasterUserWallet.address,
        "0.1"
      ).then((res) => res.value);
      const [entryPointInitBalance, walletInitBalance] =
        await getAddressBalances([
          mockEntryPoint.address,
          paymasterUserWallet.address,
        ]);
      expect(walletInitBalance).to.equal(requiredPrefund);

      const tx = await paymasterUserWallet
        .validateUserOp(
          await signUserOperation(
            paymasterUser,
            getUserOperation(paymasterUserWallet.address)
          ),
          requiredPrefund
        )
        .then((res) => res.wait());

      const [entryPointFinalBalance, walletFinalBalance] =
        await getAddressBalances([
          mockEntryPoint.address,
          paymasterUserWallet.address,
        ]);
      expect(walletFinalBalance).to.equal(0);
      expect(
        entryPointInitBalance.sub(transactionFee(tx)).add(requiredPrefund)
      ).to.equal(entryPointFinalBalance);
    });

    it("Does not pay fee to the EntryPoint if requiredPrefund is zero", async () => {
      const balance = await sendEth(
        paymasterUser,
        paymasterUserWallet.address,
        "0.1"
      ).then((res) => res.value);

      await paymasterUserWallet.validateUserOp(
        await signUserOperation(
          paymasterUser,
          getUserOperation(paymasterUserWallet.address)
        ),
        0
      );
      const [walletBalance] = await getAddressBalances([
        paymasterUserWallet.address,
      ]);
      expect(walletBalance).to.equal(balance);
    });
  });

  describe("executeUserOp", () => {
    it("Required to be called from the Entry Point", async () => {
      const value = ethers.utils.parseEther("0.1");

      await expect(
        paymasterUserWallet
          .connect(paymasterUser)
          .executeUserOp(regularUser.address, value, NULL_DATA)
      ).to.be.revertedWith("Wallet: Not from EntryPoint");
    });

    it("Sends the correct amount of Eth", async () => {
      const value = ethers.utils.parseEther("0.1");
      await sendEth(paymasterUser, paymasterUserWallet.address, value);
      const [initBalance] = await getAddressBalances([regularUser.address]);

      await expect(
        paymasterUserWallet.executeUserOp(regularUser.address, value, NULL_DATA)
      ).to.not.be.reverted;
      const [finalBalance] = await getAddressBalances([regularUser.address]);

      expect(finalBalance.sub(initBalance)).to.equal(value);
    });

    it("Reverts when not enough Eth", async () => {
      const value = ethers.utils.parseEther("0.1");

      await expect(
        paymasterUserWallet.executeUserOp(regularUser.address, value, NULL_DATA)
      ).to.be.revertedWith("");
    });

    it("Can successfully make arbitrary contract calls", async () => {
      const data = encodePassContractCall();

      await expect(paymasterUserWallet.executeUserOp(test.address, 0, data)).to
        .not.be.reverted;
    });

    it("Can revert gracefully from failed arbitrary contract calls", async () => {
      const data = encodeFailContractCall();

      await expect(
        paymasterUserWallet.executeUserOp(test.address, 0, data)
      ).to.be.revertedWith("Test: reverted");
    });
  });

  describe("validatePaymasterUserOp", () => {
    it("Reverts when paymasterData is not externally signed by paymasterUser", async () => {
      const userOp = await signUserOperation(
        regularUser,
        await withPaymaster(
          regularUser,
          paymasterUserWallet.address,
          getUserOperation(regularUserWallet.address)
        )
      );

      await expect(
        paymasterUserWallet.validatePaymasterUserOp(userOp, 0)
      ).to.be.revertedWith("Paymaster: Invalid signature");
    });

    it("Does not revert if token approved", async () => {
      await mockEntryPoint.sendTransaction({
        to: regularUserWallet.address,
        data: encodeERC20MaxApprove(paymasterUserWallet.address),
      });
      const userOp = await signUserOperation(
        regularUser,
        await withPaymaster(
          paymasterUser,
          paymasterUserWallet.address,
          getUserOperation(regularUserWallet.address, {
            callData: encodePassEntryPointCall(test.address),
          })
        )
      );

      await expect(paymasterUserWallet.validatePaymasterUserOp(userOp, 0)).to
        .not.be.reverted;
    });

    it("Does not revert if token approved but op sets sufficient token allowance", async () => {
      await mockEntryPoint.sendTransaction({
        to: regularUserWallet.address,
        data: encodeERC20MaxApprove(paymasterUserWallet.address),
      });
      const userOp = await signUserOperation(
        regularUser,
        await withPaymaster(
          paymasterUser,
          paymasterUserWallet.address,
          getUserOperation(regularUserWallet.address, {
            callData: encodeERC20MaxApprove(paymasterUserWallet.address),
          })
        )
      );

      await expect(paymasterUserWallet.validatePaymasterUserOp(userOp, 0)).to
        .not.be.reverted;
    });

    it("Reverts if token approved but op sets insufficient token allowance", async () => {
      await mockEntryPoint.sendTransaction({
        to: regularUserWallet.address,
        data: encodeERC20MaxApprove(paymasterUserWallet.address),
      });
      const userOp = await signUserOperation(
        regularUser,
        await withPaymaster(
          paymasterUser,
          paymasterUserWallet.address,
          getUserOperation(regularUserWallet.address, {
            callData: encodeERC20ZeroApprove(paymasterUserWallet.address),
          })
        )
      );

      await expect(
        paymasterUserWallet.validatePaymasterUserOp(userOp, 0)
      ).to.be.revertedWith("Paymaster: Not approved");
    });

    it("Does not revert if token not approved but op sets sufficient token allowance", async () => {
      const userOp = await signUserOperation(
        regularUser,
        await withPaymaster(
          paymasterUser,
          paymasterUserWallet.address,
          getUserOperation(regularUserWallet.address, {
            callData: encodeERC20MaxApprove(paymasterUserWallet.address),
          })
        )
      );

      await expect(paymasterUserWallet.validatePaymasterUserOp(userOp, 0)).to
        .not.be.reverted;
    });

    it("Revert if token not approved but op sets insufficient token allowance", async () => {
      const userOp = await signUserOperation(
        regularUser,
        await withPaymaster(
          paymasterUser,
          paymasterUserWallet.address,
          getUserOperation(regularUserWallet.address, {
            callData: encodeERC20ZeroApprove(paymasterUserWallet.address),
          })
        )
      );

      await expect(
        paymasterUserWallet.validatePaymasterUserOp(userOp, 0)
      ).to.be.revertedWith("Paymaster: Not approved");
    });
  });
});
