const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  DEFAULT_REQUIRED_PRE_FUND,
  MOCK_POST_OP_TOKEN_FEE,
  NULL_DATA,
  PAYMASTER_FEE,
  USDC_TOKEN,
  encodeERC20MaxApprove,
  encodeERC20ZeroApprove,
  encodeFailContractCall,
  encodePassContractCall,
  encodePassEntryPointCall,
  getAddressBalances,
  getTokenBalance,
  getUserOperation,
  mockPostOpArgs,
  sendEth,
  signUserOperation,
  swapEthForToken,
  transactionFee,
  withPaymaster,
} = require("../utils/contractHelpers");
const { wallet, constants } = require("../lib");

describe("Wallet", () => {
  let mockEntryPoint;
  let paymasterUser;
  let regularUser;
  let regularGuardian;
  let anotherRegularGuardian;
  let newOwner;

  let walletImplementation;
  let test;

  let paymasterUserWalletProxy;
  let regularUserWalletProxy;
  let regularGuardianProxy;

  let paymasterUserWallet;
  let regularUserWallet;
  let regularGuardianWallet;

  beforeEach(async () => {
    [
      mockEntryPoint,
      paymasterUser,
      regularUser,
      regularGuardian,
      anotherRegularGuardian,
      newOwner,
    ] = await ethers.getSigners();
    const [WalletProxy, Wallet, Test] = await Promise.all([
      ethers.getContractFactory("WalletProxy"),
      ethers.getContractFactory("Wallet"),
      ethers.getContractFactory("Test"),
    ]);

    [walletImplementation, test] = await Promise.all([
      Wallet.deploy(),
      Test.deploy(),
    ]);

    [paymasterUserWalletProxy, regularUserWalletProxy, regularGuardianProxy] =
      await Promise.all([
        WalletProxy.deploy(
          walletImplementation.address,
          wallet.encodeFunctionData.initialize(
            mockEntryPoint.address,
            paymasterUser.address,
            [regularGuardian.address]
          )
        ),
        WalletProxy.deploy(
          walletImplementation.address,
          wallet.encodeFunctionData.initialize(
            mockEntryPoint.address,
            regularUser.address,
            [regularGuardian.address]
          )
        ),
        WalletProxy.deploy(
          walletImplementation.address,
          wallet.encodeFunctionData.initialize(
            mockEntryPoint.address,
            regularGuardian.address,
            []
          )
        ),
      ]);

    paymasterUserWallet = walletImplementation.attach(
      paymasterUserWalletProxy.address
    );
    regularUserWallet = walletImplementation.attach(
      regularUserWalletProxy.address
    );
    regularGuardianWallet = walletImplementation.attach(
      regularGuardianProxy.address
    );
  });

  describe("upgradeTo", () => {
    let newWalletImplementation;

    beforeEach(async () => {
      newWalletImplementation = await ethers
        .getContractFactory("Wallet")
        .then((w) => w.deploy());
    });

    it("Required to be called from the Entry Point", async () => {
      await expect(regularUserWallet.upgradeTo(newWalletImplementation.address))
        .to.not.be.reverted;
      await expect(
        regularUserWallet
          .connect(regularUser)
          .upgradeTo(newWalletImplementation.address)
      ).to.be.revertedWith("Wallet: Not from EntryPoint");
    });

    it("Upgrades to the correct implementation", async () => {
      const firstImplementation =
        await regularUserWallet.getCurrentImplementation();
      expect(firstImplementation).to.equal(walletImplementation.address);

      await regularUserWallet.upgradeTo(newWalletImplementation.address);
      const secondImplementation =
        await regularUserWallet.getCurrentImplementation();
      expect(secondImplementation).to.equal(newWalletImplementation.address);
    });

    it("Reverts if upgrading to a non UUPS compliant implementation", async () => {
      await expect(
        regularUserWallet.upgradeTo(test.address)
      ).to.be.revertedWith("ERC1967Upgrade: upgrade breaks further upgrades");
      expect(await regularUserWallet.getCurrentImplementation()).to.equal(
        walletImplementation.address
      );
    });
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

    it("Required to be signed by the wallet's owner", async () => {
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

    it("Required to be a call to recoverAccount if not signed by wallet's owner", async () => {
      const validUserOp = await signUserOperation(
        newOwner,
        getUserOperation(regularUserWallet.address, {
          callData: wallet.encodeFunctionData.recoverAccount(
            newOwner.address,
            []
          ),
        })
      );

      await expect(regularUserWallet.validateUserOp(validUserOp, 0)).to.not.be
        .reverted;
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

    it("Returns an ABI encoded sender, token, exchange rate, and fee", async () => {
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

      const context = await paymasterUserWallet.validatePaymasterUserOp(
        userOp,
        DEFAULT_REQUIRED_PRE_FUND
      );
      const results = ethers.utils.defaultAbiCoder.decode(
        ["address", "address", "uint256", "uint256"],
        context
      );
      expect(results[0]).to.equal(regularUserWallet.address);
      expect(results[1]).to.equal(USDC_TOKEN);
      expect(results[2].toNumber()).to.greaterThan(0);
      expect(results[3]).to.equal(PAYMASTER_FEE);
    });
  });

  describe("postOp", () => {
    it("Required to be called from the Entry Point", async () => {
      await expect(
        paymasterUserWallet
          .connect(paymasterUser)
          .postOp(...mockPostOpArgs(regularUserWallet.address))
      ).to.be.revertedWith("Wallet: Not from EntryPoint");
    });

    it("Transfers the correct amount of tokens to the paymaster", async () => {
      await swapEthForToken(
        regularUser,
        regularUserWallet.address,
        USDC_TOKEN,
        ethers.utils.parseEther("10")
      );
      await mockEntryPoint.sendTransaction({
        to: regularUserWallet.address,
        data: encodeERC20MaxApprove(paymasterUserWallet.address),
      });

      await paymasterUserWallet.postOp(
        ...mockPostOpArgs(regularUserWallet.address)
      );
      expect(
        await getTokenBalance(paymasterUserWallet.address, USDC_TOKEN)
      ).to.equal(MOCK_POST_OP_TOKEN_FEE);
    });
  });

  describe("getGuardianCount + getGuardian", () => {
    it("Enables querying which accounts have guardian roles", async () => {
      expect(
        await wallet.access.getGuardians(regularUserWallet.connect(regularUser))
      ).to.deep.equal([regularGuardian.address]);
    });
  });

  describe("grantGuardian", () => {
    it("Required to be called from the Entry Point", async () => {
      await expect(
        regularUserWallet
          .connect(regularUser)
          .grantGuardian(anotherRegularGuardian.address)
      ).to.be.revertedWith("Wallet: Not from EntryPoint");
    });

    it("Reverts if adding owner", async () => {
      await expect(
        regularUserWallet.grantGuardian(regularUser.address)
      ).to.be.revertedWith("Wallet: Owner cannot be guardian");
    });

    it("Adds account to the list of guardians", async () => {
      await regularUserWallet.grantGuardian(anotherRegularGuardian.address);

      expect(await wallet.access.getGuardians(regularUserWallet)).to.deep.equal(
        [regularGuardian.address, anotherRegularGuardian.address]
      );
    });

    it("List of guardians unchanged if account was already added", async () => {
      await regularUserWallet.grantGuardian(regularGuardian.address);

      expect(await wallet.access.getGuardians(regularUserWallet)).to.deep.equal(
        [regularGuardian.address]
      );
    });
  });

  describe("revokeGuardian", () => {
    it("Required to be called from the Entry Point", async () => {
      await expect(
        regularUserWallet
          .connect(regularUser)
          .revokeGuardian(regularGuardian.address)
      ).to.be.revertedWith("Wallet: Not from EntryPoint");
    });

    it("Removes account from the list of guardians", async () => {
      await regularUserWallet.revokeGuardian(regularGuardian.address);

      expect(await wallet.access.getGuardians(regularUserWallet)).to.deep.equal(
        []
      );
    });

    it("List of guardians unchanged if account is not already a guardian", async () => {
      await regularUserWallet.revokeGuardian(anotherRegularGuardian.address);

      expect(await wallet.access.getGuardians(regularUserWallet)).to.deep.equal(
        [regularGuardian.address]
      );
    });
  });

  describe("isValidSignature", () => {
    it("Reverts if signature is invalid", async () => {
      const guardianRecovery = wallet.message.guardianRecovery({
        guardian: regularGuardianWallet.address,
        wallet: regularUserWallet.address,
        newOwner: newOwner.address,
      });
      const hash = ethers.utils.hashMessage(guardianRecovery);
      const signature = newOwner.signMessage(guardianRecovery);

      await expect(
        regularGuardianWallet.isValidSignature(hash, signature)
      ).to.be.revertedWith("Wallet: Invalid signature");
    });

    it("Returns correct value if signature is valid", async () => {
      const guardianRecovery = wallet.message.guardianRecovery({
        guardian: regularGuardianWallet.address,
        wallet: regularUserWallet.address,
        newOwner: newOwner.address,
      });
      const hash = ethers.utils.hashMessage(guardianRecovery);
      const signature = regularGuardian.signMessage(guardianRecovery);

      expect(
        await regularGuardianWallet.isValidSignature(hash, signature)
      ).to.equal(constants.ERC1271.magicValue);
    });
  });

  describe("recoverAccount", () => {
    it("Required to be called from the Entry Point", async () => {
      await expect(
        regularUserWallet
          .connect(regularUser)
          .recoverAccount(newOwner.address, [])
      ).to.be.revertedWith("Wallet: Not from EntryPoint");
    });

    it("Reverts on invalid guardianRecovery", async () => {
      const guardianRecovery = await wallet.access.signGuardianRecovery(
        newOwner,
        {
          guardian: regularGuardian.address,
          wallet: regularUserWallet.address,
          newOwner: newOwner.address,
        }
      );

      await expect(
        regularUserWallet.recoverAccount(newOwner.address, [guardianRecovery])
      ).to.be.revertedWith("Wallet: Invalid guardianRecovery");
    });

    it("Reverts if guardian does not have the correct role", async () => {
      const guardianRecovery = await wallet.access.signGuardianRecovery(
        anotherRegularGuardian,
        {
          guardian: anotherRegularGuardian.address,
          wallet: regularUserWallet.address,
          newOwner: newOwner.address,
        }
      );

      await expect(
        regularUserWallet.recoverAccount(newOwner.address, [guardianRecovery])
      ).to.be.revertedWith("Wallet: Not a guardian");
    });

    it("Reverts if not the correct wallet", async () => {
      const guardianRecovery = await wallet.access.signGuardianRecovery(
        regularGuardian,
        {
          guardian: regularGuardian.address,
          wallet: regularGuardianWallet.address,
          newOwner: newOwner.address,
        }
      );

      await expect(
        regularUserWallet.recoverAccount(newOwner.address, [guardianRecovery])
      ).to.be.revertedWith("Wallet: Wrong wallet");
    });

    it("Reverts if newOwner doesn't match", async () => {
      const guardianRecovery = await wallet.access.signGuardianRecovery(
        regularGuardian,
        {
          guardian: regularGuardian.address,
          wallet: regularUserWallet.address,
          newOwner: regularGuardian.address,
        }
      );

      await expect(
        regularUserWallet.recoverAccount(newOwner.address, [guardianRecovery])
      ).to.be.revertedWith("Wallet: newOwner mismatch");
    });

    it("Requires a majority of verified guardians", async () => {
      await Promise.all([
        regularUserWallet.grantGuardian(anotherRegularGuardian.address),
        regularUserWallet.grantGuardian(regularGuardianWallet.address),
      ]);
      const guardianRecovery = await wallet.access.signGuardianRecovery(
        regularGuardian,
        {
          guardian: regularGuardian.address,
          wallet: regularUserWallet.address,
          newOwner: newOwner.address,
        }
      );

      await expect(
        regularUserWallet.recoverAccount(newOwner.address, [guardianRecovery])
      ).to.be.revertedWith("Wallet: Insufficient guardians");
    });

    it("Assigns a new owner and revokes old one", async () => {
      await Promise.all([
        regularUserWallet.grantGuardian(anotherRegularGuardian.address),
        regularUserWallet.grantGuardian(regularGuardianWallet.address),
      ]);
      const guardianRecoveryArray = await Promise.all([
        wallet.access.signGuardianRecovery(regularGuardian, {
          guardian: regularGuardian.address,
          wallet: regularUserWallet.address,
          newOwner: newOwner.address,
        }),
        wallet.access.signGuardianRecovery(regularGuardian, {
          guardian: regularGuardianWallet.address,
          wallet: regularUserWallet.address,
          newOwner: newOwner.address,
        }),
      ]);

      await expect(
        regularUserWallet.recoverAccount(
          newOwner.address,
          guardianRecoveryArray
        )
      ).to.not.be.reverted;
      expect(await regularUserWallet.getOwnerCount()).to.equal(1);
      expect(await regularUserWallet.getOwner(0)).to.equal(newOwner.address);
    });
  });
});
