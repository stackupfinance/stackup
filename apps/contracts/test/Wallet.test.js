const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const {
  DEFAULT_REQUIRED_PRE_FUND,
  MOCK_POST_OP_TOKEN_FEE,
  PAYMASTER_FEE,
  PAYMASTER_OPTS,
  USDC_TOKEN,
  encodeFailContractCall,
  encodePassContractCall,
  encodePassEntryPointCall,
  getAddressBalances,
  mockPostOpArgs,
  sendEth,
  swapEthForToken,
  transactionFee,
} = require("../utils/contractHelpers");
const { wallet, constants, contracts } = require("../lib");

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
    contracts.Wallet.address = walletImplementation.address;
    contracts.EntryPoint.address = mockEntryPoint.address;

    [paymasterUserWalletProxy, regularUserWalletProxy, regularGuardianProxy] =
      await Promise.all([
        WalletProxy.deploy(
          contracts.Wallet.address,
          wallet.encodeFunctionData.initialize(
            contracts.EntryPoint.address,
            paymasterUser.address,
            [regularGuardian.address]
          )
        ),
        WalletProxy.deploy(
          contracts.Wallet.address,
          wallet.encodeFunctionData.initialize(
            contracts.EntryPoint.address,
            regularUser.address,
            [regularGuardian.address]
          )
        ),
        WalletProxy.deploy(
          contracts.Wallet.address,
          wallet.encodeFunctionData.initialize(
            contracts.EntryPoint.address,
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
    let noopWallet;

    beforeEach(async () => {
      [newWalletImplementation, noopWallet] = await Promise.all([
        ethers.getContractFactory("Wallet").then((w) => w.deploy()),
        ethers.getContractFactory("NoopWallet").then((w) => w.deploy()),
      ]);
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
      expect(firstImplementation).to.equal(contracts.Wallet.address);

      await regularUserWallet.upgradeTo(newWalletImplementation.address);
      const secondImplementation =
        await regularUserWallet.getCurrentImplementation();
      expect(secondImplementation).to.equal(newWalletImplementation.address);
    });

    it("Reverts if upgrading to a non UUPS compliant implementation", async () => {
      await expect(
        regularUserWallet.upgradeTo(noopWallet.address)
      ).to.be.revertedWith("ERC1967Upgrade: new implementation is not UUPS");
      expect(await regularUserWallet.getCurrentImplementation()).to.equal(
        contracts.Wallet.address
      );
    });
  });

  describe("validateUserOp", () => {
    it("Required to be called from the Entry Point", async () => {
      const userOp = await wallet.userOperations.sign(
        paymasterUser,
        wallet.userOperations.get(paymasterUserWallet.address)
      );
      const requestId = wallet.message.requestId(
        userOp,
        contracts.EntryPoint.address,
        network.config.chainId
      );

      await expect(paymasterUserWallet.validateUserOp(userOp, requestId, 0)).to
        .not.be.reverted;
      await expect(
        paymasterUserWallet
          .connect(paymasterUser)
          .validateUserOp(userOp, requestId, 0)
      ).to.be.revertedWith("Wallet: Not from EntryPoint");
    });

    it("Does not revert when signed by the wallet's owner", async () => {
      const validUserOp = await wallet.userOperations.sign(
        paymasterUser,
        wallet.userOperations.get(paymasterUserWallet.address)
      );
      const validRequestId = wallet.message.requestId(
        validUserOp,
        contracts.EntryPoint.address,
        network.config.chainId
      );

      const invalidUserOp = await wallet.userOperations.sign(
        regularUser,
        wallet.userOperations.get(paymasterUserWallet.address)
      );
      const invalidRequestId = wallet.message.requestId(
        invalidUserOp,
        contracts.EntryPoint.address,
        network.config.chainId
      );

      await expect(
        paymasterUserWallet.validateUserOp(validUserOp, validRequestId, 0)
      ).to.not.be.reverted;
      await expect(
        paymasterUserWallet.validateUserOp(invalidUserOp, invalidRequestId, 0)
      ).to.be.revertedWith("Wallet: Invalid owner sig");
    });

    it("Increments valid nonce", async () => {
      const validUserOp = await wallet.userOperations.sign(
        paymasterUser,
        wallet.userOperations.get(paymasterUserWallet.address)
      );
      const requestId = wallet.message.requestId(
        validUserOp,
        contracts.EntryPoint.address,
        network.config.chainId
      );

      await expect(
        paymasterUserWallet.validateUserOp(validUserOp, requestId, 0)
      ).to.not.be.reverted;
      expect(await paymasterUserWallet.nonce()).to.equal(1);
    });

    it("Reverts on an invalid nonce", async () => {
      const invalidUserOp = await wallet.userOperations.sign(
        paymasterUser,
        wallet.userOperations.get(paymasterUserWallet.address, {
          nonce: 1,
        })
      );
      const requestId = wallet.message.requestId(
        invalidUserOp,
        contracts.EntryPoint.address,
        network.config.chainId
      );

      await expect(
        paymasterUserWallet.validateUserOp(invalidUserOp, requestId, 0)
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
          contracts.EntryPoint.address,
          paymasterUserWallet.address,
        ]);
      expect(walletInitBalance).to.equal(requiredPrefund);

      const userOp = await wallet.userOperations.sign(
        paymasterUser,
        wallet.userOperations.get(paymasterUserWallet.address)
      );
      const requestId = wallet.message.requestId(
        userOp,
        contracts.EntryPoint.address,
        network.config.chainId
      );

      const tx = await paymasterUserWallet
        .validateUserOp(userOp, requestId, requiredPrefund)
        .then((res) => res.wait());

      const [entryPointFinalBalance, walletFinalBalance] =
        await getAddressBalances([
          contracts.EntryPoint.address,
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

      const userOp = await wallet.userOperations.sign(
        paymasterUser,
        wallet.userOperations.get(paymasterUserWallet.address)
      );
      const requestId = wallet.message.requestId(
        userOp,
        contracts.EntryPoint.address,
        network.config.chainId
      );

      await paymasterUserWallet.validateUserOp(userOp, requestId, 0);
      const [walletBalance] = await getAddressBalances([
        paymasterUserWallet.address,
      ]);
      expect(walletBalance).to.equal(balance);
    });

    describe("When signed by the wallet's guardians", () => {
      it("Reverts on actions not required for recovery", async () => {
        const validUserOp = await wallet.userOperations.signAsGuardian(
          regularGuardian,
          regularGuardian.address,
          wallet.userOperations.get(regularUserWallet.address, {
            callData: wallet.encodeFunctionData.ERC20Transfer(
              USDC_TOKEN,
              regularGuardian.address,
              ethers.utils.parseUnits("1", "mwei")
            ),
          })
        );
        const requestId = wallet.message.requestId(
          validUserOp,
          contracts.EntryPoint.address,
          network.config.chainId
        );

        await expect(
          regularUserWallet.validateUserOp(validUserOp, requestId, 0)
        ).to.be.revertedWith("Wallet: Invalid guardian action");
      });

      it("Reverts without a majority of verified guardians", async () => {
        await Promise.all([
          regularUserWallet.grantGuardian(anotherRegularGuardian.address),
          regularUserWallet.grantGuardian(regularGuardianWallet.address),
        ]);
        const invalidUserOp = await wallet.userOperations.signAsGuardian(
          regularGuardian,
          regularGuardianWallet.address,
          wallet.userOperations.get(regularUserWallet.address, {
            callData: wallet.encodeFunctionData.transferOwner(newOwner.address),
          })
        );
        const requestId = wallet.message.requestId(
          invalidUserOp,
          contracts.EntryPoint.address,
          network.config.chainId
        );

        await expect(
          regularUserWallet.validateUserOp(invalidUserOp, requestId, 0)
        ).to.be.revertedWith("Wallet: Insufficient guardians");
      });

      it("Reverts on invalid guardian signature", async () => {
        const invalidUserOp = await wallet.userOperations
          .signAsGuardian(
            regularGuardian,
            regularGuardian.address,
            wallet.userOperations.get(regularUserWallet.address, {
              callData: wallet.encodeFunctionData.transferOwner(
                regularGuardian.address
              ),
            })
          )
          .then((op) => {
            op.callData = wallet.encodeFunctionData.transferOwner(
              newOwner.address
            );

            return op;
          });
        const requestId = wallet.message.requestId(
          invalidUserOp,
          contracts.EntryPoint.address,
          network.config.chainId
        );

        await expect(
          regularUserWallet.validateUserOp(invalidUserOp, requestId, 0)
        ).to.be.revertedWith("Wallet: Invalid guardian sig");
      });

      it("Reverts if guardian does not have the correct role", async () => {
        const invalidUserOp = await wallet.userOperations.signAsGuardian(
          anotherRegularGuardian,
          anotherRegularGuardian.address,
          wallet.userOperations.get(regularUserWallet.address, {
            callData: wallet.encodeFunctionData.transferOwner(newOwner.address),
          })
        );
        const requestId = wallet.message.requestId(
          invalidUserOp,
          contracts.EntryPoint.address,
          network.config.chainId
        );

        await expect(
          regularUserWallet.validateUserOp(invalidUserOp, requestId, 0)
        ).to.be.revertedWith("Wallet: Not a guardian");
      });

      it("Does not revert with a majority of verified guardians and approved actions", async () => {
        await Promise.all([
          regularUserWallet.grantGuardian(anotherRegularGuardian.address),
          regularUserWallet.grantGuardian(regularGuardianWallet.address),
        ]);
        const [approveUserOp, recoverUserOp] = await Promise.all([
          wallet.userOperations
            .signAsGuardian(
              regularGuardian,
              regularGuardianWallet.address,
              await wallet.userOperations.signPaymasterData(
                paymasterUser,
                paymasterUserWallet.address,
                ...PAYMASTER_OPTS,
                wallet.userOperations.get(regularUserWallet.address, {
                  callData: wallet.encodeFunctionData.ERC20Approve(
                    USDC_TOKEN,
                    paymasterUserWallet.address,
                    ethers.constants.MaxUint256
                  ),
                })
              )
            )
            .then((op) =>
              wallet.userOperations.signAsGuardian(
                anotherRegularGuardian,
                anotherRegularGuardian.address,
                op
              )
            ),
          wallet.userOperations
            .signAsGuardian(
              regularGuardian,
              regularGuardianWallet.address,
              wallet.userOperations.get(regularUserWallet.address, {
                nonce: 1,
                callData: wallet.encodeFunctionData.transferOwner(
                  newOwner.address
                ),
              })
            )
            .then((op) =>
              wallet.userOperations.signAsGuardian(
                anotherRegularGuardian,
                anotherRegularGuardian.address,
                op
              )
            ),
        ]);
        const approveRequestId = wallet.message.requestId(
          approveUserOp,
          contracts.EntryPoint.address,
          network.config.chainId
        );
        const recoverRequestId = wallet.message.requestId(
          recoverUserOp,
          contracts.EntryPoint.address,
          network.config.chainId
        );

        await expect(
          regularUserWallet.validateUserOp(approveUserOp, approveRequestId, 0)
        ).to.not.be.reverted;
        await expect(
          regularUserWallet.validateUserOp(recoverUserOp, recoverRequestId, 0)
        ).to.not.be.reverted;
      });
    });
  });

  describe("executeUserOp", () => {
    it("Required to be called from the Entry Point", async () => {
      const value = ethers.utils.parseEther("0.1");

      await expect(
        paymasterUserWallet
          .connect(paymasterUser)
          .executeUserOp(
            regularUser.address,
            value,
            constants.userOperations.nullCode
          )
      ).to.be.revertedWith("Wallet: Not from EntryPoint");
    });

    it("Sends the correct amount of Eth", async () => {
      const value = ethers.utils.parseEther("0.1");
      await sendEth(paymasterUser, paymasterUserWallet.address, value);
      const [initBalance] = await getAddressBalances([regularUser.address]);

      await expect(
        paymasterUserWallet.executeUserOp(
          regularUser.address,
          value,
          constants.userOperations.nullCode
        )
      ).to.not.be.reverted;
      const [finalBalance] = await getAddressBalances([regularUser.address]);

      expect(finalBalance.sub(initBalance)).to.equal(value);
    });

    it("Reverts when not enough Eth", async () => {
      const value = ethers.utils.parseEther("0.1");

      await expect(
        paymasterUserWallet.executeUserOp(
          regularUser.address,
          value,
          constants.userOperations.nullCode
        )
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
      const userOp = await wallet.userOperations.sign(
        regularUser,
        await wallet.userOperations.signPaymasterData(
          regularUser,
          paymasterUserWallet.address,
          ...PAYMASTER_OPTS,
          wallet.userOperations.get(regularUserWallet.address)
        )
      );

      await expect(
        paymasterUserWallet.validatePaymasterUserOp(userOp, 0)
      ).to.be.revertedWith("Paymaster: Invalid signature");
    });

    it("Does not revert if token approved", async () => {
      await mockEntryPoint.sendTransaction({
        to: regularUserWallet.address,
        data: wallet.encodeFunctionData.ERC20Approve(
          USDC_TOKEN,
          paymasterUserWallet.address,
          ethers.constants.MaxUint256
        ),
      });
      const userOp = await wallet.userOperations.sign(
        regularUser,
        await wallet.userOperations.signPaymasterData(
          paymasterUser,
          paymasterUserWallet.address,
          ...PAYMASTER_OPTS,
          wallet.userOperations.get(regularUserWallet.address, {
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
        data: wallet.encodeFunctionData.ERC20Approve(
          USDC_TOKEN,
          paymasterUserWallet.address,
          ethers.constants.MaxUint256
        ),
      });
      const userOp = await wallet.userOperations.sign(
        regularUser,
        await wallet.userOperations.signPaymasterData(
          paymasterUser,
          paymasterUserWallet.address,
          ...PAYMASTER_OPTS,
          wallet.userOperations.get(regularUserWallet.address, {
            callData: wallet.encodeFunctionData.ERC20Approve(
              USDC_TOKEN,
              paymasterUserWallet.address,
              ethers.constants.MaxUint256
            ),
          })
        )
      );

      await expect(paymasterUserWallet.validatePaymasterUserOp(userOp, 0)).to
        .not.be.reverted;
    });

    it("Reverts if token approved but op sets insufficient token allowance", async () => {
      await mockEntryPoint.sendTransaction({
        to: regularUserWallet.address,
        data: wallet.encodeFunctionData.ERC20Approve(
          USDC_TOKEN,
          paymasterUserWallet.address,
          ethers.constants.MaxUint256
        ),
      });
      const userOp = await wallet.userOperations.sign(
        regularUser,
        await wallet.userOperations.signPaymasterData(
          paymasterUser,
          paymasterUserWallet.address,
          ...PAYMASTER_OPTS,
          wallet.userOperations.get(regularUserWallet.address, {
            callData: wallet.encodeFunctionData.ERC20Approve(
              USDC_TOKEN,
              paymasterUserWallet.address,
              ethers.constants.Zero
            ),
          })
        )
      );

      await expect(
        paymasterUserWallet.validatePaymasterUserOp(userOp, 0)
      ).to.be.revertedWith("Paymaster: Not approved");
    });

    it("Does not revert if token not approved but op sets sufficient token allowance", async () => {
      const userOp = await wallet.userOperations.sign(
        regularUser,
        await wallet.userOperations.signPaymasterData(
          paymasterUser,
          paymasterUserWallet.address,
          ...PAYMASTER_OPTS,
          wallet.userOperations.get(regularUserWallet.address, {
            callData: wallet.encodeFunctionData.ERC20Approve(
              USDC_TOKEN,
              paymasterUserWallet.address,
              ethers.constants.MaxUint256
            ),
          })
        )
      );

      await expect(paymasterUserWallet.validatePaymasterUserOp(userOp, 0)).to
        .not.be.reverted;
    });

    it("Revert if token not approved but op sets insufficient token allowance", async () => {
      const userOp = await wallet.userOperations.sign(
        regularUser,
        await wallet.userOperations.signPaymasterData(
          paymasterUser,
          paymasterUserWallet.address,
          ...PAYMASTER_OPTS,
          wallet.userOperations.get(regularUserWallet.address, {
            callData: wallet.encodeFunctionData.ERC20Approve(
              USDC_TOKEN,
              paymasterUserWallet.address,
              ethers.constants.Zero
            ),
          })
        )
      );

      await expect(
        paymasterUserWallet.validatePaymasterUserOp(userOp, 0)
      ).to.be.revertedWith("Paymaster: Not approved");
    });

    it("Returns an ABI encoded sender, token, exchange rate, and fee", async () => {
      const userOp = await wallet.userOperations.sign(
        regularUser,
        await wallet.userOperations.signPaymasterData(
          paymasterUser,
          paymasterUserWallet.address,
          ...PAYMASTER_OPTS,
          wallet.userOperations.get(regularUserWallet.address, {
            callData: wallet.encodeFunctionData.ERC20Approve(
              USDC_TOKEN,
              paymasterUserWallet.address,
              ethers.constants.MaxUint256
            ),
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
        data: wallet.encodeFunctionData.ERC20Approve(
          USDC_TOKEN,
          paymasterUserWallet.address,
          ethers.constants.MaxUint256
        ),
      });

      await paymasterUserWallet.postOp(
        ...mockPostOpArgs(regularUserWallet.address)
      );
      expect(
        await contracts.Erc20.getInstance(
          USDC_TOKEN,
          ethers.provider
        ).balanceOf(paymasterUserWallet.address)
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
      const hash = ethers.utils.hashMessage("Test message!");
      const signature = newOwner.signMessage("Test message!");

      await expect(
        regularGuardianWallet.isValidSignature(hash, signature)
      ).to.be.revertedWith("Wallet: Invalid signature");
    });

    it("Returns correct value if signature is valid", async () => {
      const hash = ethers.utils.hashMessage("Test message!");
      const signature = regularGuardian.signMessage("Test message!");

      expect(
        await regularGuardianWallet.isValidSignature(hash, signature)
      ).to.equal(constants.ERC1271.magicValue);
    });
  });

  describe("transferOwner", () => {
    it("Required to be called from the Entry Point", async () => {
      await expect(
        regularUserWallet.connect(regularUser).transferOwner(newOwner.address)
      ).to.be.revertedWith("Wallet: Not from EntryPoint");
    });

    it("Assigns a new owner and revokes old one", async () => {
      await expect(regularUserWallet.transferOwner(newOwner.address)).to.not.be
        .reverted;
      expect(await regularUserWallet.getOwnerCount()).to.equal(1);
      expect(await regularUserWallet.getOwner(0)).to.equal(newOwner.address);
    });
  });
});
