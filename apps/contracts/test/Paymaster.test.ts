import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import { getSigners } from "./utils/helpers/signers";
import { bn, decimal, fp } from "./utils/helpers/numbers";
import { deploy, instanceAt } from "./utils/helpers/contracts";
import {
  encodePaymasterContext,
  encodePaymasterData,
} from "./utils/helpers/encoding";
import {
  ADMIN_ROLE,
  GUARDIAN_ROLE,
  MAX_UINT256,
  OWNER_ROLE,
  PAYMASTER_MODE_FREE,
  PAYMASTER_MODE_FULL,
  PAYMASTER_MODE_FEE_ONLY,
  PAYMASTER_MODE_GAS_ONLY,
  ZERO_ADDRESS,
} from "./utils/helpers/constants";

import Paymaster from "./utils/models/paymaster/Paymaster";
import { BigNumberish, UserOp, PaymasterData, buildOp } from "./utils/types";

describe("Paymaster", () => {
  let paymaster: Paymaster,
    owner: SignerWithAddress,
    guardian: SignerWithAddress,
    sender: SignerWithAddress,
    other: SignerWithAddress;

  beforeEach("deploy paymaster", async () => {
    [, owner, guardian, sender, other] = await getSigners();
    paymaster = await Paymaster.create({ owner, guardians: [guardian] });
  });

  describe("initialization", () => {
    it("defines role constants properly", async () => {
      expect(await paymaster.instance.OWNER_ROLE()).to.be.equal(OWNER_ROLE);
      expect(await paymaster.instance.GUARDIAN_ROLE()).to.be.equal(
        GUARDIAN_ROLE
      );
    });

    it("sets up owners properly", async () => {
      expect(await paymaster.getOwnersCount()).to.be.equal(1);
      expect(await paymaster.getRoleMemberCount(OWNER_ROLE)).to.be.equal(1);
      expect(await paymaster.hasRole(OWNER_ROLE, owner)).to.be.true;
      expect(await paymaster.getOwner(0)).to.be.equal(owner.address);
    });

    it("sets up guardians properly", async () => {
      expect(await paymaster.getGuardiansCount()).to.be.equal(1);
      expect(await paymaster.getRoleMemberCount(GUARDIAN_ROLE)).to.be.equal(1);
      expect(await paymaster.hasRole(GUARDIAN_ROLE, guardian)).to.be.true;
      expect(await paymaster.getGuardian(0)).to.be.equal(guardian.address);
      expect(await paymaster.getMinGuardiansSignatures()).to.be.equal(1);
    });

    it("sets up admin roles properly", async () => {
      expect(await paymaster.getRoleAdmin(OWNER_ROLE)).to.be.equal(OWNER_ROLE);
      expect(await paymaster.getRoleAdmin(GUARDIAN_ROLE)).to.be.equal(
        OWNER_ROLE
      );
      expect(await paymaster.getRoleMemberCount(ADMIN_ROLE)).to.be.equal(0);
    });

    it("cannot be initialized twice", async () => {
      await expect(
        paymaster.instance.initialize(owner.address, [])
      ).to.be.revertedWith("Initializable: contract is already initialized");
    });

    it("cannot initialize the implementation", async () => {
      const implementation = await instanceAt(
        "Paymaster",
        await paymaster.getCurrentImplementation()
      );
      await expect(
        implementation.initialize(owner.address, [])
      ).to.be.revertedWith("Initializable: contract is already initialized");
    });

    it("cannot be initialized with the owner as a guardian", async () => {
      await expect(
        Paymaster.create({ owner, guardians: [owner] })
      ).to.be.revertedWith("ACL: Owner cannot be guardian");
    });
  });

  describe("receive", () => {
    const amount = fp(1);

    it("accepts ETH from anyone", async () => {
      await other.sendTransaction({ to: paymaster.address, value: amount });
      await guardian.sendTransaction({ to: paymaster.address, value: amount });

      expect(await ethers.provider.getBalance(paymaster.address)).to.be.equal(
        amount.mul(2)
      );
    });
  });

  describe("validatePaymasterUserOp", () => {
    let op: UserOp;

    beforeEach("build op", () => {
      // These are required fields the op must have filled in order to allow the wallet decoding properly
      // It must have any calldata cause it will check the paymaster allowance is not changing
      op = buildOp({
        sender: sender.address,
        paymaster: paymaster.address,
        callData: "0xabcdef1111",
      });
    });

    context("when a signature is given", () => {
      context("when the signature can be decoded", () => {
        const exchangeRate = fp(2);
        let token: Contract, feed: Contract;

        beforeEach("deploy paymaster deps", async () => {
          token = await deploy("TokenMock", ["DAI", 18]);
          feed = await deploy("PriceFeedMock", [18, exchangeRate]);
        });

        context("when encoded as owner", () => {
          const signPaymasterData = async (
            paymasterData: PaymasterData,
            signer = owner
          ) => {
            const signature = await paymaster.signPaymasterRequestWithOwner(
              op,
              paymasterData,
              signer
            );
            return encodePaymasterData(paymasterData, signature);
          };

          context("when the signer is the owner", () => {
            const itReturnsTheEncodedContext = (
              maxCost: BigNumberish,
              expectedMode: number,
              expectedFee: BigNumberish
            ) => {
              it("returns the corresponding context", async () => {
                const context = await paymaster.validatePaymasterUserOp(
                  op,
                  maxCost
                );

                const results = ethers.utils.defaultAbiCoder.decode(
                  ["address", "uint8", "address", "uint256", "uint256"],
                  context
                );
                expect(results[0]).to.equal(op.sender);
                expect(results[1]).to.equal(expectedMode);
                expect(results[2]).to.equal(token.address);
                expect(results[3]).to.equal(exchangeRate);
                expect(results[4]).to.equal(expectedFee);
              });
            };

            const itRevertsWithoutBalance = (maxCost: BigNumberish) => {
              it("reverts", async () => {
                await expect(
                  paymaster.validatePaymasterUserOp(op, maxCost)
                ).to.be.revertedWith("Paymaster: Not enough balance");
              });
            };

            context("when the given max cost is zero", () => {
              const maxCost = 0;

              context("when the paymaster fee is zero", () => {
                const fee = 0;

                context("when paying full", () => {
                  const mode = PAYMASTER_MODE_FULL;

                  beforeEach("sign paymaster request", async () => {
                    op.paymasterData = await signPaymasterData({
                      token,
                      mode,
                      feed,
                      fee,
                    });
                  });

                  itReturnsTheEncodedContext(maxCost, mode, fee);
                });

                context("when paying gas only", () => {
                  const mode = PAYMASTER_MODE_GAS_ONLY;

                  beforeEach("sign paymaster request", async () => {
                    op.paymasterData = await signPaymasterData({
                      token,
                      mode,
                      feed,
                      fee,
                    });
                  });

                  itReturnsTheEncodedContext(maxCost, mode, fee);
                });

                context("when paying fee only", () => {
                  const mode = PAYMASTER_MODE_FEE_ONLY;

                  beforeEach("sign paymaster request", async () => {
                    op.paymasterData = await signPaymasterData({
                      token,
                      mode,
                      feed,
                      fee,
                    });
                  });

                  itReturnsTheEncodedContext(maxCost, mode, fee);
                });

                context("when not paying at all", () => {
                  const mode = PAYMASTER_MODE_FREE;

                  beforeEach("sign paymaster request", async () => {
                    op.paymasterData = await signPaymasterData({
                      token,
                      mode,
                      feed,
                      fee,
                    });
                  });

                  itReturnsTheEncodedContext(maxCost, mode, fee);
                });
              });

              context("when the paymaster fee is greater than zero", () => {
                const fee = bn(1000000);

                context("when paying full", () => {
                  const mode = PAYMASTER_MODE_FULL;

                  beforeEach("sign paymaster request", async () => {
                    op.paymasterData = await signPaymasterData({
                      token,
                      mode,
                      feed,
                      fee,
                    });
                  });

                  context("when the sender has enough balance", () => {
                    beforeEach("mint tokens to wallet", async () => {
                      await token.mint(sender.address, fee);
                    });

                    itReturnsTheEncodedContext(maxCost, mode, fee);
                  });

                  context(
                    "when the sender does not have enough balance",
                    () => {
                      itRevertsWithoutBalance(maxCost);
                    }
                  );
                });

                context("when paying fee only", () => {
                  const mode = PAYMASTER_MODE_FEE_ONLY;

                  beforeEach("sign paymaster request", async () => {
                    op.paymasterData = await signPaymasterData({
                      token,
                      mode,
                      feed,
                      fee,
                    });
                  });

                  context("when the sender has enough balance", () => {
                    beforeEach("mint tokens to wallet", async () => {
                      await token.mint(sender.address, fee);
                    });

                    itReturnsTheEncodedContext(maxCost, mode, fee);
                  });

                  context(
                    "when the sender does not have enough balance",
                    () => {
                      itRevertsWithoutBalance(maxCost);
                    }
                  );
                });

                context("when paying gas only", () => {
                  const mode = PAYMASTER_MODE_GAS_ONLY;

                  beforeEach("sign paymaster request", async () => {
                    op.paymasterData = await signPaymasterData({
                      token,
                      mode,
                      feed,
                      fee,
                    });
                  });

                  itReturnsTheEncodedContext(maxCost, mode, fee);
                });

                context("when not paying at all", () => {
                  const mode = PAYMASTER_MODE_FREE;

                  beforeEach("sign paymaster request", async () => {
                    op.paymasterData = await signPaymasterData({
                      token,
                      mode,
                      feed,
                      fee,
                    });
                  });

                  itReturnsTheEncodedContext(maxCost, mode, fee);
                });
              });
            });

            context("when the given max cost is greater than zero", () => {
              const maxCost = fp(10);

              context("when the paymaster fee is zero", () => {
                const fee = 0;

                context("when paying full", () => {
                  const mode = PAYMASTER_MODE_FULL;

                  beforeEach("sign paymaster request", async () => {
                    op.paymasterData = await signPaymasterData({
                      token,
                      mode,
                      feed,
                      fee,
                    });
                  });

                  context("when the sender has enough balance", () => {
                    beforeEach("mint tokens to wallet", async () => {
                      const expectedCost = maxCost.mul(exchangeRate).div(fp(1));
                      await token.mint(sender.address, expectedCost);
                    });

                    itReturnsTheEncodedContext(maxCost, mode, fee);
                  });

                  context(
                    "when the sender does not have enough balance",
                    () => {
                      itRevertsWithoutBalance(maxCost);
                    }
                  );
                });

                context("when paying gas only", () => {
                  const mode = PAYMASTER_MODE_GAS_ONLY;

                  beforeEach("sign paymaster request", async () => {
                    op.paymasterData = await signPaymasterData({
                      token,
                      mode,
                      feed,
                      fee,
                    });
                  });

                  context("when the sender has enough balance", () => {
                    beforeEach("mint tokens to wallet", async () => {
                      const expectedCost = maxCost.mul(exchangeRate).div(fp(1));
                      await token.mint(sender.address, expectedCost);
                    });

                    itReturnsTheEncodedContext(maxCost, mode, fee);
                  });

                  context(
                    "when the sender does not have enough balance",
                    () => {
                      itRevertsWithoutBalance(maxCost);
                    }
                  );
                });

                context("when paying fee only", () => {
                  const mode = PAYMASTER_MODE_FEE_ONLY;

                  beforeEach("sign paymaster request", async () => {
                    op.paymasterData = await signPaymasterData({
                      token,
                      mode,
                      feed,
                      fee,
                    });
                  });

                  itReturnsTheEncodedContext(maxCost, mode, fee);
                });

                context("when not paying at all", () => {
                  const mode = PAYMASTER_MODE_FREE;

                  beforeEach("sign paymaster request", async () => {
                    op.paymasterData = await signPaymasterData({
                      token,
                      mode,
                      feed,
                      fee,
                    });
                  });

                  itReturnsTheEncodedContext(maxCost, mode, fee);
                });
              });

              context("when the paymaster fee is greater than zero", () => {
                const fee = bn(1000000);

                context("when paying full", () => {
                  const mode = PAYMASTER_MODE_FULL;

                  beforeEach("sign paymaster request", async () => {
                    op.paymasterData = await signPaymasterData({
                      token,
                      mode,
                      feed,
                      fee,
                    });
                  });

                  context("when the sender has enough balance", () => {
                    beforeEach("mint tokens to wallet", async () => {
                      const expectedCost = maxCost
                        .mul(exchangeRate)
                        .div(fp(1))
                        .add(fee);
                      await token.mint(sender.address, expectedCost);
                    });

                    itReturnsTheEncodedContext(maxCost, mode, fee);
                  });

                  context(
                    "when the sender does not have enough balance",
                    () => {
                      itRevertsWithoutBalance(maxCost);
                    }
                  );
                });

                context("when paying gas only", () => {
                  const mode = PAYMASTER_MODE_GAS_ONLY;

                  beforeEach("sign paymaster request", async () => {
                    op.paymasterData = await signPaymasterData({
                      token,
                      mode,
                      feed,
                      fee,
                    });
                  });

                  context("when the sender has enough balance", () => {
                    beforeEach("mint tokens to wallet", async () => {
                      const expectedCost = maxCost.mul(exchangeRate).div(fp(1));
                      await token.mint(sender.address, expectedCost);
                    });

                    itReturnsTheEncodedContext(maxCost, mode, fee);
                  });

                  context(
                    "when the sender does not have enough balance",
                    () => {
                      itRevertsWithoutBalance(maxCost);
                    }
                  );
                });

                context("when paying fee only", () => {
                  const mode = PAYMASTER_MODE_FEE_ONLY;

                  beforeEach("sign paymaster request", async () => {
                    op.paymasterData = await signPaymasterData({
                      token,
                      mode,
                      feed,
                      fee,
                    });
                  });

                  context("when the sender has enough balance", () => {
                    beforeEach("mint tokens to wallet", async () => {
                      await token.mint(sender.address, fee);
                    });

                    itReturnsTheEncodedContext(maxCost, mode, fee);
                  });

                  context(
                    "when the sender does not have enough balance",
                    () => {
                      itRevertsWithoutBalance(maxCost);
                    }
                  );
                });

                context("when not paying at all", () => {
                  const mode = PAYMASTER_MODE_FREE;

                  beforeEach("sign paymaster request", async () => {
                    op.paymasterData = await signPaymasterData({
                      token,
                      mode,
                      feed,
                      fee,
                    });
                  });

                  itReturnsTheEncodedContext(maxCost, mode, fee);
                });
              });
            });
          });

          context("when the signer is not the owner", () => {
            beforeEach("sign op", async () => {
              const paymasterData = {
                token,
                feed,
                fee: 0,
                mode: PAYMASTER_MODE_FULL,
              };
              const signature = await paymaster.signPaymasterRequestWithOwner(
                op,
                paymasterData,
                guardian
              );
              op.paymasterData = encodePaymasterData(paymasterData, signature);
            });

            it("reverts", async () => {
              await expect(
                paymaster.validatePaymasterUserOp(op)
              ).to.be.revertedWith("ACL: Signer not an owner");
            });
          });
        });

        context("when encoded as guardians", () => {
          beforeEach("sign as guardians", async () => {
            const paymasterData = {
              token,
              feed,
              fee: 0,
              mode: PAYMASTER_MODE_FULL,
            };
            const signature = await paymaster.signPaymasterRequestWithGuardians(
              op,
              paymasterData
            );
            op.paymasterData = encodePaymasterData(paymasterData, signature);
          });

          it("reverts", async () => {
            await expect(
              paymaster.validatePaymasterUserOp(op)
            ).to.be.revertedWith("Paymaster: Cannot sign guardian");
          });
        });
      });

      context("when the signature cannot be decoded", () => {
        beforeEach("set bad signature", () => {
          op.signature = "0xabcdef";
        });

        it("reverts", async () => {
          await expect(paymaster.validatePaymasterUserOp(op)).to.be.reverted;
        });
      });
    });

    context("when no signature is given", () => {
      it("reverts", async () => {
        await expect(paymaster.validatePaymasterUserOp(op)).to.be.reverted;
      });
    });
  });

  describe("postOp", () => {
    let token: Contract;
    const FEE = bn(10),
      EXCHANGE_RATE = fp(2),
      GAS_COST = fp(1);

    beforeEach("deploy token mock", async () => {
      token = await deploy("TokenMock", ["DAI", 18]);
    });

    context("when the sender is the entry point", () => {
      let from: Contract;

      beforeEach("set sender", async () => {
        from = paymaster.entryPoint;
      });

      const itHandlesPostOpProperly = (
        mode: number,
        expectedCost: BigNumberish
      ) => {
        let contextData: string;

        beforeEach("encode paymaster data", async () => {
          contextData = encodePaymasterContext(
            sender,
            mode,
            token,
            EXCHANGE_RATE,
            FEE
          );
        });

        context(
          "when the payer has approved the paymaster enough tokens",
          () => {
            beforeEach("approve tokens", async () => {
              await token
                .connect(sender)
                .approve(paymaster.address, MAX_UINT256);
            });

            context("when the payer has enough balance", () => {
              beforeEach("approve tokens", async () => {
                await token.mint(sender.address, expectedCost);
              });

              it("transfers the tokens", async () => {
                const previousSenderBalance = await token.balanceOf(
                  sender.address
                );
                const previousWalletBalance = await token.balanceOf(
                  paymaster.address
                );

                await paymaster.postOp(contextData, GAS_COST, { from });

                const currentSenderBalance = await token.balanceOf(
                  sender.address
                );
                expect(currentSenderBalance).to.be.equal(
                  previousSenderBalance.sub(expectedCost)
                );

                const currentWalletBalance = await token.balanceOf(
                  paymaster.address
                );
                expect(currentWalletBalance).to.be.equal(
                  previousWalletBalance.add(expectedCost)
                );
              });
            });

            context("when the payer does not have enough balance", () => {
              it("reverts", async () => {
                await expect(
                  paymaster.postOp(contextData, GAS_COST, { from })
                ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
              });
            });
          }
        );

        context(
          "when the payer has not approved the paymaster enough tokens",
          () => {
            it("reverts", async () => {
              await expect(
                paymaster.postOp(contextData, GAS_COST, { from })
              ).to.be.revertedWith("ERC20: insufficient allowance");
            });
          }
        );
      };

      context("when paying full", () => {
        const mode = PAYMASTER_MODE_FULL;
        const expectedCost = GAS_COST.mul(EXCHANGE_RATE).div(fp(1)).add(FEE);

        itHandlesPostOpProperly(mode, expectedCost);
      });

      context("when paying gas only", () => {
        const mode = PAYMASTER_MODE_GAS_ONLY;
        const expectedCost = GAS_COST.mul(EXCHANGE_RATE).div(fp(1));

        itHandlesPostOpProperly(mode, expectedCost);
      });

      context("when paying fee only", () => {
        const mode = PAYMASTER_MODE_FEE_ONLY;
        const expectedCost = FEE;

        itHandlesPostOpProperly(mode, expectedCost);
      });

      context("when not paying at all", () => {
        const mode = PAYMASTER_MODE_FREE;

        it("does not have to pay for the op", async () => {
          const previousSenderBalance = await token.balanceOf(sender.address);
          const previousWalletBalance = await token.balanceOf(
            paymaster.address
          );

          const contextData = encodePaymasterContext(
            sender,
            mode,
            token,
            EXCHANGE_RATE,
            FEE
          );
          await paymaster.postOp(contextData, GAS_COST, { from });

          const currentSenderBalance = await token.balanceOf(sender.address);
          expect(currentSenderBalance).to.be.equal(previousSenderBalance);

          const currentWalletBalance = await token.balanceOf(paymaster.address);
          expect(currentWalletBalance).to.be.equal(previousWalletBalance);
        });
      });
    });

    context("when the sender is not the entry point", () => {
      let from: SignerWithAddress;

      beforeEach("set sender", async () => {
        from = other;
      });

      it("reverts", async () => {
        await expect(
          paymaster.postOp("0x", GAS_COST, { from })
        ).to.be.revertedWith("ACL: sender not allowed");
      });
    });
  });

  describe("getTokenFee", () => {
    const COST = fp(1);
    const FEE = decimal(3);
    const RATE = decimal(2);

    const itExpressTheRateCorrectly = (
      tokenDecimals: number,
      feedDecimals: number
    ) => {
      let token: Contract, feed: Contract;

      beforeEach("deploy token and feed", async () => {
        token = await deploy("TokenMock", ["TKN", tokenDecimals]);
        feed = await deploy("PriceFeedMock", [
          feedDecimals,
          bn(RATE.mul(10 ** feedDecimals)),
        ]);
      });

      it(`expresses token rate with ${tokenDecimals} decimals`, async () => {
        // pre-approve tokens since paymaster validation will check that
        const op = buildOp({
          sender: owner.address,
          paymaster: paymaster.address,
        });
        await token.mint(owner.address, fp(1000000));

        const baseFee = bn(FEE.mul(10 ** tokenDecimals));
        const paymasterData = {
          mode: PAYMASTER_MODE_FULL,
          fee: baseFee,
          token,
          feed,
        };
        const signature = await paymaster.signPaymasterRequestWithOwner(
          op,
          paymasterData
        );
        op.paymasterData = encodePaymasterData(paymasterData, signature);

        const context = await paymaster.validatePaymasterUserOp(op, COST);
        const results = ethers.utils.defaultAbiCoder.decode(
          ["address", "uint8", "address", "uint256", "uint256"],
          context
        );

        const expectedRate = bn(RATE.mul(10 ** tokenDecimals));
        expect(results[1]).to.be.equal(PAYMASTER_MODE_FULL);
        expect(results[3]).to.be.equal(expectedRate);
        expect(results[4]).to.be.equal(baseFee);
      });
    };

    context("when the token has 6 decimals", () => {
      const tokenDecimals = 6;

      context("when the feed has 6 decimals", () => {
        const feedDecimals = 6;

        itExpressTheRateCorrectly(tokenDecimals, feedDecimals);
      });

      context("when the feed has 18 decimals", () => {
        const feedDecimals = 18;

        itExpressTheRateCorrectly(tokenDecimals, feedDecimals);
      });

      context("when the feed has 20 decimals", () => {
        const feedDecimals = 20;

        itExpressTheRateCorrectly(tokenDecimals, feedDecimals);
      });
    });

    context("when the token has 18 decimals", () => {
      const tokenDecimals = 18;

      context("when the feed has 6 decimals", () => {
        const feedDecimals = 6;

        itExpressTheRateCorrectly(tokenDecimals, feedDecimals);
      });

      context("when the feed has 18 decimals", () => {
        const feedDecimals = 18;

        itExpressTheRateCorrectly(tokenDecimals, feedDecimals);
      });

      context("when the feed has 20 decimals", () => {
        const feedDecimals = 20;

        itExpressTheRateCorrectly(tokenDecimals, feedDecimals);
      });
    });

    context("when the token has 20 decimals", () => {
      const tokenDecimals = 20;

      context("when the feed has 6 decimals", () => {
        const feedDecimals = 6;

        itExpressTheRateCorrectly(tokenDecimals, feedDecimals);
      });

      context("when the feed has 18 decimals", () => {
        const feedDecimals = 18;

        itExpressTheRateCorrectly(tokenDecimals, feedDecimals);
      });

      context("when the feed has 20 decimals", () => {
        const feedDecimals = 20;

        itExpressTheRateCorrectly(tokenDecimals, feedDecimals);
      });
    });
  });

  describe("isValidSignature", () => {
    const message = ethers.utils.hashMessage("Test message!");

    context("when the given message was signed by the owner", () => {
      let signature: string;

      beforeEach("sign message", async () => {
        signature = await owner.signMessage("Test message!");
      });

      it("returns the function selector", async () => {
        const result = await paymaster.isValidSignature(message, signature);
        expect(result).to.be.equal(
          paymaster.instance.interface.getSighash(
            "isValidSignature(bytes32,bytes)"
          )
        );
      });
    });

    context("when the given message was not signed by the owner", () => {
      let signature: string;

      beforeEach("sign message", async () => {
        signature = await guardian.signMessage("Test message!");
      });

      it("reverts", async () => {
        await expect(
          paymaster.isValidSignature(message, signature)
        ).to.be.revertedWith("ACL: Invalid signature");
      });
    });
  });

  describe("transferOwner", () => {
    context("when the sender is the entry point", () => {
      let from: Contract;

      beforeEach("set sender", async () => {
        from = paymaster.entryPoint;
      });

      context("when the new owner is not the address zero", () => {
        it("transfer ownership to the grantee", async () => {
          await paymaster.transferOwner(other, { from });

          expect(await paymaster.getOwnersCount()).to.be.equal(1);
          expect(await paymaster.getRoleMemberCount(OWNER_ROLE)).to.be.equal(1);
          expect(await paymaster.hasRole(OWNER_ROLE, owner)).to.be.false;
          expect(await paymaster.hasRole(OWNER_ROLE, other)).to.be.true;
          expect(await paymaster.getOwner(0)).to.be.equal(other.address);
        });
      });

      context("when the new owner is the address zero", () => {
        it("reverts", async () => {
          await expect(
            paymaster.transferOwner(ZERO_ADDRESS, { from })
          ).to.be.revertedWith("ACL: Owner cannot be zero");
        });
      });
    });

    context("when the sender is not the entry point", () => {
      let from: SignerWithAddress;

      beforeEach("set sender", async () => {
        from = other;
      });

      it("reverts", async () => {
        await expect(
          paymaster.transferOwner(other, { from })
        ).to.be.revertedWith("ACL: sender not allowed");
      });
    });
  });

  describe("grantGuardian", () => {
    context("when the sender is the entry point", () => {
      let from: Contract;

      beforeEach("set sender", async () => {
        from = paymaster.entryPoint;
      });

      context("when the grantee is not the owner", () => {
        context("when the grantee was not a guardian yet", () => {
          it("grants the guardian role to the grantee", async () => {
            await paymaster.grantGuardian(other, { from });

            expect(await paymaster.getGuardiansCount()).to.be.equal(2);
            expect(
              await paymaster.getRoleMemberCount(GUARDIAN_ROLE)
            ).to.be.equal(2);
            expect(await paymaster.hasRole(GUARDIAN_ROLE, guardian)).to.be.true;
            expect(await paymaster.hasRole(GUARDIAN_ROLE, other)).to.be.true;
            expect(await paymaster.getGuardian(0)).to.be.equal(
              guardian.address
            );
            expect(await paymaster.getGuardian(1)).to.be.equal(other.address);
          });
        });

        context("when the grantee was already a guardian", () => {
          it("does not affect the guardian list", async () => {
            await paymaster.grantGuardian(guardian, { from });

            expect(await paymaster.getGuardiansCount()).to.be.equal(1);
            expect(
              await paymaster.getRoleMemberCount(GUARDIAN_ROLE)
            ).to.be.equal(1);
            expect(await paymaster.hasRole(GUARDIAN_ROLE, guardian)).to.be.true;
            expect(await paymaster.getGuardian(0)).to.be.equal(
              guardian.address
            );
          });
        });
      });

      context("when the grantee is the owner", () => {
        it("reverts", async () => {
          await expect(
            paymaster.grantGuardian(owner, { from })
          ).to.be.revertedWith("ACL: Owner cannot be guardian");
        });
      });
    });

    context("when the sender is not the entry point", () => {
      let from: SignerWithAddress;

      beforeEach("set sender", async () => {
        from = other;
      });

      it("reverts", async () => {
        await expect(
          paymaster.grantGuardian(other, { from })
        ).to.be.revertedWith("ACL: sender not allowed");
      });
    });
  });

  describe("revokeGuardian", () => {
    context("when the sender is the entry point", () => {
      let from: Contract;

      beforeEach("set sender", async () => {
        from = paymaster.entryPoint;
      });

      context("when the grantee was already a guardian", () => {
        it("revokes the guardian role to the grantee", async () => {
          await paymaster.revokeGuardian(guardian, { from });

          expect(await paymaster.getGuardiansCount()).to.be.equal(0);
          expect(await paymaster.getRoleMemberCount(GUARDIAN_ROLE)).to.be.equal(
            0
          );
          expect(await paymaster.hasRole(GUARDIAN_ROLE, guardian)).to.be.false;
        });
      });

      context("when the grantee was not a guardian", () => {
        it("does not affect the guardian list", async () => {
          await paymaster.revokeGuardian(other, { from });

          expect(await paymaster.getGuardiansCount()).to.be.equal(1);
          expect(await paymaster.getRoleMemberCount(GUARDIAN_ROLE)).to.be.equal(
            1
          );
          expect(await paymaster.hasRole(GUARDIAN_ROLE, guardian)).to.be.true;
          expect(await paymaster.getGuardian(0)).to.be.equal(guardian.address);
        });
      });
    });

    context("when the sender is not the entry point", () => {
      let from: SignerWithAddress;

      beforeEach("set sender", async () => {
        from = other;
      });

      it("reverts", async () => {
        await expect(
          paymaster.revokeGuardian(other, { from })
        ).to.be.revertedWith("ACL: sender not allowed");
      });
    });
  });

  describe("upgradeTo", () => {
    let newImplementation: Contract;

    context("when the sender is the entry point", () => {
      let from: Contract;

      beforeEach("set sender", async () => {
        from = paymaster.entryPoint;
      });

      context("when the new implementation is UUPS-compliant", () => {
        beforeEach("deploy new UUPS-compliant implementation", async () => {
          newImplementation = await deploy("Paymaster", [
            paymaster.entryPoint.address,
          ]);
        });

        it("upgrades to the new implementation", async () => {
          await paymaster.upgradeTo(newImplementation, { from });

          expect(await paymaster.getCurrentImplementation()).to.be.equal(
            newImplementation.address
          );
        });

        it("works fine with storage layout changes", async () => {
          const previousEntryPoint = await paymaster.instance.entryPoint();

          const v2 = await deploy("PaymasterV2Mock", [
            paymaster.entryPoint.address,
          ]);
          await paymaster.upgradeTo(v2, { from });
          const paymasterV2 = await instanceAt(
            "PaymasterV2Mock",
            paymaster.address
          );
          expect(await paymaster.getCurrentImplementation()).to.be.equal(
            v2.address
          );

          await paymasterV2.setX(10);
          expect(await paymasterV2.x()).to.be.equal(10);

          const currentEntryPoint = await paymasterV2.entryPoint();
          expect(currentEntryPoint).to.be.equal(previousEntryPoint);
        });
      });

      context("when the new implementation is not UUPS-compliant", () => {
        beforeEach("deploy non UUPS-compliant implementation", async () => {
          newImplementation = await deploy("TokenMock", ["TKN", 18]);
        });

        it("reverts", async () => {
          await expect(
            paymaster.upgradeTo(newImplementation, { from })
          ).to.be.revertedWith(
            "ERC1967Upgrade: new implementation is not UUPS"
          );
        });
      });
    });

    context("when the sender is not the entry point", () => {
      let from: SignerWithAddress;

      beforeEach("set sender", async () => {
        from = other;
      });

      it("reverts", async () => {
        await expect(
          paymaster.upgradeTo(newImplementation, { from })
        ).to.be.revertedWith("ACL: sender not allowed");
      });
    });
  });
});
