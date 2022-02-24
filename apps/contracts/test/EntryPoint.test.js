const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  DEFAULT_REQUIRED_PRE_FUND,
  PAYMASTER_LOCK_EXPIRY_PERIOD,
  PAYMASTER_FEE,
  PAYMASTER_OPTS,
  PAYMASTER_OPTS_NO_FEE,
  USDC_TOKEN,
  encodeFailEntryPointCall,
  encodePassEntryPointCall,
  getAddressBalances,
  getLastBlockTimestamp,
  incrementBlockTimestamp,
  sendEth,
  swapEthForToken,
  transactionFee,
} = require("../utils/contractHelpers");
const { wallet, contracts } = require("../lib");

describe("EntryPoint", () => {
  let owner;
  let paymaster;

  let entryPoint;
  let walletImplementation;
  let test;

  let initCode;
  let paymasterInitCode;

  let sender;
  let paymasterWallet;

  beforeEach(async () => {
    [owner, paymaster] = await ethers.getSigners();
    const [EntryPoint, Wallet, Test] = await Promise.all([
      ethers.getContractFactory("EntryPoint"),
      ethers.getContractFactory("Wallet"),
      ethers.getContractFactory("Test"),
    ]);

    [entryPoint, walletImplementation, test] = await Promise.all([
      EntryPoint.deploy(contracts.SingletonFactory.address),
      Wallet.deploy(),
      Test.deploy(),
    ]);
    contracts.Wallet.address = walletImplementation.address;
    contracts.EntryPoint.address = entryPoint.address;

    const ownerInit = [
      contracts.Wallet.address,
      contracts.EntryPoint.address,
      owner.address,
      [],
    ];
    const paymasterInit = [
      contracts.Wallet.address,
      contracts.EntryPoint.address,
      paymaster.address,
      [],
    ];

    initCode = wallet.proxy.getInitCode(...ownerInit);
    paymasterInitCode = wallet.proxy.getInitCode(...paymasterInit);

    sender = wallet.proxy.getAddress(...ownerInit);
    paymasterWallet = wallet.proxy.getAddress(...paymasterInit);
  });

  describe("handleOps", () => {
    it("Uses CREATE2 to deploy wallet if it does not yet exist", async () => {
      await sendEth(owner, sender, DEFAULT_REQUIRED_PRE_FUND);
      const userOp = await wallet.userOperations.sign(
        owner,
        wallet.userOperations.get(sender, { initCode })
      );

      expect(await wallet.proxy.isCodeDeployed(ethers.provider, sender)).to.be
        .false;
      await entryPoint.handleOps([userOp], ethers.constants.AddressZero);
      expect(await wallet.proxy.isCodeDeployed(ethers.provider, sender)).to.be
        .true;
    });

    it("Reverts if the wallet does not exist and the initcode is empty", async () => {
      const userOp = await wallet.userOperations.sign(
        owner,
        wallet.userOperations.get(sender)
      );

      await expect(
        entryPoint.handleOps([userOp], ethers.constants.AddressZero)
      ).to.be.revertedWith("EntryPoint: No wallet & initCode");
    });

    it("Reverts if the wallet does not pay the correct prefund", async () => {
      await sendEth(owner, sender, "0.0015");
      const userOp = await wallet.userOperations.sign(
        owner,
        wallet.userOperations.get(sender, { initCode })
      );

      await expect(
        entryPoint.handleOps([userOp], ethers.constants.AddressZero)
      ).to.be.revertedWith("EntryPoint: incorrect prefund");
    });

    it("Does not revert if callData is good", async () => {
      await sendEth(owner, sender, DEFAULT_REQUIRED_PRE_FUND);
      const userOp = await wallet.userOperations.sign(
        owner,
        wallet.userOperations.get(sender, {
          initCode,
          callData: encodePassEntryPointCall(test.address),
        })
      );

      const [preRedeemerBalance, preSenderBalance] = await getAddressBalances([
        ethers.constants.AddressZero,
        sender,
      ]);
      await expect(entryPoint.handleOps([userOp], ethers.constants.AddressZero))
        .to.not.be.reverted;

      const [postRedeemerBalance, postSenderBalance] = await getAddressBalances(
        [ethers.constants.AddressZero, sender]
      );
      expect(postRedeemerBalance.gt(preRedeemerBalance)).to.be.true;
      expect(postSenderBalance.lt(preSenderBalance)).to.be.true;
      expect(postRedeemerBalance.sub(preRedeemerBalance)).to.equal(
        preSenderBalance.sub(postSenderBalance)
      );
    });

    it("Reverts if callData is bad", async () => {
      await sendEth(owner, sender, DEFAULT_REQUIRED_PRE_FUND);
      const userOp = await wallet.userOperations.sign(
        owner,
        wallet.userOperations.get(sender, {
          initCode,
          callData: encodeFailEntryPointCall(test.address),
        })
      );

      await expect(
        entryPoint.handleOps([userOp], ethers.constants.AddressZero)
      ).to.be.revertedWith("Test: reverted");
    });

    it("Does not revert with EIP-1559 style transactions", async () => {
      await sendEth(owner, sender, DEFAULT_REQUIRED_PRE_FUND);
      const userOp = await wallet.userOperations.sign(
        owner,
        wallet.userOperations.get(sender, {
          initCode,
          // use recommended default of 2 GWei for maxPriorityFee
          maxPriorityFeePerGas: ethers.utils.parseEther("2", "gwei"),
        })
      );

      await expect(entryPoint.handleOps([userOp], ethers.constants.AddressZero))
        .to.not.be.reverted;
    });

    it("Reverts if paymaster stake is not locked", async () => {
      await entryPoint
        .connect(paymaster)
        .addStake({ value: DEFAULT_REQUIRED_PRE_FUND });
      const userOp = await wallet.userOperations.sign(
        owner,
        await wallet.userOperations.signPaymasterData(
          paymaster,
          paymaster.address,
          ...PAYMASTER_OPTS,
          wallet.userOperations.get(sender, {
            initCode,
          })
        )
      );

      await expect(
        entryPoint.handleOps([userOp], ethers.constants.AddressZero)
      ).to.be.revertedWith("EntryPoint: Stake not locked");
    });

    it("Reverts if paymaster does not have enough Eth staked", async () => {
      await entryPoint
        .connect(paymaster)
        .addStake({ value: DEFAULT_REQUIRED_PRE_FUND.div(2) });
      await entryPoint.connect(paymaster).lockStake();
      const userOp = await wallet.userOperations.sign(
        owner,
        await wallet.userOperations.signPaymasterData(
          paymaster,
          paymaster.address,
          ...PAYMASTER_OPTS,
          wallet.userOperations.get(sender, {
            initCode,
          })
        )
      );

      await expect(
        entryPoint.handleOps([userOp], ethers.constants.AddressZero)
      ).to.be.revertedWith("EntryPoint: Insufficient stake");
    });

    it("Reverts if paymaster fails to validate user operation", async () => {
      await sendEth(paymaster, paymasterWallet, "10");
      const userOps = await Promise.all([
        wallet.userOperations.sign(
          paymaster,
          wallet.userOperations.get(paymasterWallet, {
            initCode: paymasterInitCode,
            callData: wallet.encodeFunctionData.addEntryPointStake(
              DEFAULT_REQUIRED_PRE_FUND
            ),
          })
        ),
        wallet.userOperations.sign(
          paymaster,
          wallet.userOperations.get(paymasterWallet, {
            callData: wallet.encodeFunctionData.lockEntryPointStake(),
            nonce: 1,
          })
        ),
      ]);
      await entryPoint
        .connect(paymaster)
        .handleOps(userOps, ethers.constants.AddressZero);

      const userOp = await wallet.userOperations.sign(
        owner,
        await wallet.userOperations.signPaymasterData(
          paymaster,
          paymasterWallet,
          ...PAYMASTER_OPTS,
          wallet.userOperations.get(sender, {
            initCode,
            callData: wallet.encodeFunctionData.ERC20Approve(
              USDC_TOKEN,
              paymasterWallet,
              ethers.constants.Zero
            ),
          })
        )
      );
      await expect(
        entryPoint.handleOps([userOp], ethers.constants.AddressZero)
      ).to.be.revertedWith("Paymaster: Not approved");
    });

    describe("Successful transaction with paymaster", () => {
      beforeEach(async () => {
        await Promise.all([
          sendEth(paymaster, paymasterWallet, "10"),
          swapEthForToken(
            owner,
            sender,
            USDC_TOKEN,
            ethers.utils.parseEther("10")
          ),
        ]);

        const paymasterSetupOps = await Promise.all([
          wallet.userOperations.sign(
            paymaster,
            wallet.userOperations.get(paymasterWallet, {
              initCode: paymasterInitCode,
              callData: wallet.encodeFunctionData.addEntryPointStake(
                ethers.utils.parseEther("1")
              ),
            })
          ),
          wallet.userOperations.sign(
            paymaster,
            wallet.userOperations.get(paymasterWallet, {
              callData: wallet.encodeFunctionData.lockEntryPointStake(),
              nonce: 1,
            })
          ),
        ]);
        await entryPoint
          .connect(paymaster)
          .handleOps(paymasterSetupOps, ethers.constants.AddressZero);
      });

      it("Does not revert if paymaster has enough Eth staked, validates user operation is OK, and gets paid", async () => {
        const userOps = await Promise.all([
          wallet.userOperations.sign(
            owner,
            await wallet.userOperations.signPaymasterData(
              paymaster,
              paymasterWallet,
              ...PAYMASTER_OPTS,
              wallet.userOperations.get(sender, {
                initCode,
                callData: wallet.encodeFunctionData.ERC20Approve(
                  USDC_TOKEN,
                  paymasterWallet,
                  ethers.constants.MaxUint256
                ),
              })
            )
          ),
          wallet.userOperations.sign(
            owner,
            await wallet.userOperations.signPaymasterData(
              paymaster,
              paymasterWallet,
              ...PAYMASTER_OPTS_NO_FEE,
              wallet.userOperations.get(sender, {
                callData: wallet.encodeFunctionData.ERC20Transfer(
                  USDC_TOKEN,
                  owner.address,
                  ethers.utils.parseUnits("1", "mwei")
                ),
                nonce: 1,
              })
            )
          ),
        ]);
        const [preStake, preTokenBalance] = await Promise.all([
          entryPoint.getStake(paymasterWallet),
          contracts.Erc20.getInstance(USDC_TOKEN, ethers.provider).balanceOf(
            paymasterWallet
          ),
        ]);

        await expect(
          entryPoint.handleOps(userOps, ethers.constants.AddressZero)
        ).to.not.be.reverted;

        const [postStake, postTokenBalance] = await Promise.all([
          entryPoint.getStake(paymasterWallet),
          contracts.Erc20.getInstance(USDC_TOKEN, ethers.provider).balanceOf(
            paymasterWallet
          ),
        ]);
        expect(postStake[0].lt(preStake[0])).to.be.true;
        expect(postTokenBalance.gt(preTokenBalance.add(PAYMASTER_FEE))).to.be
          .true;
      });
    });
  });

  describe("addStake", () => {
    it("Should receive Eth stake from paymaster", async () => {
      expect(
        ...(await getAddressBalances([contracts.EntryPoint.address]))
      ).to.equal(0);
      expect(await entryPoint.getStake(owner.address)).to.deep.equal([
        ethers.constants.Zero,
        ethers.constants.Zero,
        false,
      ]);

      await entryPoint.addStake({ value: DEFAULT_REQUIRED_PRE_FUND });

      expect(
        ...(await getAddressBalances([contracts.EntryPoint.address]))
      ).to.equal(DEFAULT_REQUIRED_PRE_FUND);
      expect(await entryPoint.getStake(owner.address)).to.deep.equal([
        DEFAULT_REQUIRED_PRE_FUND,
        ethers.constants.Zero,
        false,
      ]);
    });
  });

  describe("lockStake", () => {
    it("Should lock staked Eth from paymaster", async () => {
      await entryPoint.addStake({ value: DEFAULT_REQUIRED_PRE_FUND });
      expect(await entryPoint.getStake(owner.address)).to.deep.equal([
        DEFAULT_REQUIRED_PRE_FUND,
        ethers.constants.Zero,
        false,
      ]);

      await entryPoint.lockStake();
      expect(await entryPoint.getStake(owner.address)).to.deep.equal([
        DEFAULT_REQUIRED_PRE_FUND,
        ethers.BigNumber.from(
          (await getLastBlockTimestamp()) + PAYMASTER_LOCK_EXPIRY_PERIOD
        ),
        true,
      ]);
    });
  });

  describe("unlockStake", () => {
    it("Should unlock stake if past lock expiry time", async () => {
      await entryPoint.addStake({ value: DEFAULT_REQUIRED_PRE_FUND });
      await entryPoint.lockStake();
      expect(await entryPoint.getStake(owner.address)).to.deep.equal([
        DEFAULT_REQUIRED_PRE_FUND,
        ethers.BigNumber.from(
          (await getLastBlockTimestamp()) + PAYMASTER_LOCK_EXPIRY_PERIOD
        ),
        true,
      ]);

      await incrementBlockTimestamp(PAYMASTER_LOCK_EXPIRY_PERIOD);
      await entryPoint.unlockStake();
      expect(await entryPoint.getStake(owner.address)).to.deep.equal([
        DEFAULT_REQUIRED_PRE_FUND,
        ethers.constants.Zero,
        false,
      ]);
    });

    it("Should revert if not past lock expiry time", async () => {
      await entryPoint.addStake({ value: DEFAULT_REQUIRED_PRE_FUND });
      await entryPoint.lockStake();
      const expectedStake = await entryPoint.getStake(owner.address);

      await expect(entryPoint.unlockStake()).to.be.revertedWith(
        "EntryPoint: Lock not expired"
      );
      expect(await entryPoint.getStake(owner.address)).to.deep.equal(
        expectedStake
      );
    });
  });

  describe("withdrawStake", () => {
    it("Should withdraw unlocked stake to the given address", async () => {
      await entryPoint.addStake({ value: DEFAULT_REQUIRED_PRE_FUND });
      await entryPoint.lockStake();
      await incrementBlockTimestamp(PAYMASTER_LOCK_EXPIRY_PERIOD);
      await entryPoint.unlockStake();

      const [initBalance] = await getAddressBalances([owner.address]);
      const tx = await entryPoint
        .withdrawStake(owner.address)
        .then((tx) => tx.wait());
      const [finalBalance] = await getAddressBalances([owner.address]);
      expect(
        initBalance.sub(transactionFee(tx)).add(DEFAULT_REQUIRED_PRE_FUND)
      ).to.equal(finalBalance);
      expect(await entryPoint.getStake(owner.address)).to.deep.equal([
        ethers.constants.Zero,
        ethers.constants.Zero,
        false,
      ]);
    });

    it("Should revert if stake has not been unlocked", async () => {
      await entryPoint.addStake({ value: DEFAULT_REQUIRED_PRE_FUND });
      await entryPoint.lockStake();
      const expectedStake = await entryPoint.getStake(owner.address);

      await expect(entryPoint.withdrawStake(owner.address)).to.be.revertedWith(
        "EntryPoint: Stake is locked"
      );
      expect(await entryPoint.getStake(owner.address)).to.deep.equal(
        expectedStake
      );
    });
  });
});
