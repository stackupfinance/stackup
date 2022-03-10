import create from 'zustand';
import { persist } from 'zustand/middleware';
import { ethers } from 'ethers';
import axios from 'axios';
import { wallet, constants } from '@stackupfinance/contracts';
import { App } from '../config';
import {
  provider,
  usdcContract,
  defaultPaymasterApproval,
  defaultPaymasterReapproval,
} from '../utils/web3';

export const walletUseAuthSelector = (state) => ({
  clear: state.clear,
});

export const walletWeb3TransactionsSelector = (state) => ({
  loading: state.loading,
  sendUserOpFromWalletConnect: state.sendUserOpFromWalletConnect,
});

export const walletHomePageSelector = (state) => ({
  loading: state.loading,
  balance: state.balance,
  fetchBalance: state.fetchBalance,
});

export const walletActivityPageSelector = (state) => ({
  loading: state.loading,
  balance: state.balance,
  fetchBalance: state.fetchBalance,
  signNewPaymentUserOps: state.signNewPaymentUserOps,
});

export const walletRecoverApproveRequestPageSelector = (state) => ({
  loading: state.loading,
  setupWalletUserOps: state.setupWalletUserOps,
});

export const walletUpdateConfirmGuardiansPageSelector = (state) => ({
  loading: state.loading,
  updateGuardianOps: state.updateGuardianOps,
});

const defaultState = {
  loading: false,
  balance: ethers.constants.Zero,
};

const paymasterApproval =
  (options = {}) =>
  async (userOperations) => {
    try {
      const res = await axios.post(
        `${App.stackup.backendUrl}/v1/users/${options.userId}/transaction/paymaster-approval`,
        { userOperations },
        { headers: { Authorization: `Bearer ${options.accessToken}` } },
      );

      return res.data.userOperations;
    } catch (error) {
      throw error;
    }
  };

const signUserOps = (signer) => async (ops) => {
  return Promise.all(ops.map((op) => wallet.userOperations.sign(signer, op)));
};

const genericRelay =
  (options = {}) =>
  async (userOperations) => {
    try {
      await axios.post(
        `${App.stackup.backendUrl}/v1/users/${options.userId}/transaction`,
        { userOperations },
        { headers: { Authorization: `Bearer ${options.accessToken}` } },
      );
    } catch (error) {
      throw error;
    }
  };

export const useWalletStore = create(
  persist(
    (set, get) => ({
      ...defaultState,

      fetchBalance: async (wallet) => {
        set({ loading: true });

        try {
          const balance = await usdcContract.balanceOf(wallet.walletAddress);
          set({ loading: false, balance });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      signNewPaymentUserOps: async (userWallet, data, options) => {
        const signer = await wallet.proxy.decryptSigner(userWallet, data.password, data.username);
        if (!signer) {
          throw new Error('Incorrect password');
        }
        set({ loading: true });

        try {
          const [isDeployed, allowance] = await Promise.all([
            wallet.proxy.isCodeDeployed(provider, userWallet.walletAddress),
            usdcContract.allowance(userWallet.walletAddress, App.web3.paymaster),
          ]);
          const shouldApprove = allowance.lte(defaultPaymasterReapproval);
          const nonce = isDeployed
            ? await wallet.proxy.getNonce(provider, userWallet.walletAddress)
            : constants.userOperations.initNonce;
          const newPaymentUserOps = await Promise.all([
            shouldApprove
              ? wallet.userOperations.get(userWallet.walletAddress, {
                  nonce,
                  initCode: isDeployed
                    ? constants.userOperations.nullCode
                    : wallet.proxy.getInitCode(
                        userWallet.initImplementation,
                        userWallet.initEntryPoint,
                        userWallet.initOwner,
                        userWallet.initGuardians,
                      ),
                  callData: wallet.encodeFunctionData.ERC20Approve(
                    App.web3.usdc,
                    App.web3.paymaster,
                    defaultPaymasterApproval,
                  ),
                })
              : undefined,
            wallet.userOperations.get(userWallet.walletAddress, {
              nonce: shouldApprove ? nonce + 1 : nonce,
              callData: wallet.encodeFunctionData.ERC20Transfer(
                App.web3.usdc,
                data.toWalletAddress,
                ethers.utils.parseUnits(data.amount, App.web3.usdcUnits),
              ),
            }),
          ])
            .then((ops) => ops.filter(Boolean))
            .then(paymasterApproval(options))
            .then(signUserOps(signer.connect(provider)));

          set({ loading: false });
          return newPaymentUserOps;
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      setupWalletUserOps: async (userWallet, username, password, options) => {
        const signer = await wallet.proxy.decryptSigner(userWallet, password, username);
        if (!signer) {
          throw new Error('Incorrect password');
        }
        set({ loading: true });

        try {
          await Promise.all([
            wallet.userOperations.get(userWallet.walletAddress, {
              callGas: constants.userOperations.defaultGas * 2,
              verificationGas: constants.userOperations.defaultGas * 2,
              preVerificationGas: constants.userOperations.defaultGas * 2,
              initCode: wallet.proxy.getInitCode(
                userWallet.initImplementation,
                userWallet.initEntryPoint,
                userWallet.initOwner,
                userWallet.initGuardians,
              ),
              callData: wallet.encodeFunctionData.ERC20Approve(
                App.web3.usdc,
                App.web3.paymaster,
                defaultPaymasterApproval,
              ),
            }),
          ])
            .then(paymasterApproval(options))
            .then(signUserOps(signer.connect(provider)))
            .then(genericRelay(options));

          set({ loading: false });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      updateGuardianOps: async (
        currentGuardians,
        newGuardians,
        userWallet,
        username,
        password,
        options,
      ) => {
        const signer = await wallet.proxy.decryptSigner(userWallet, password, username);
        if (!signer) {
          throw new Error('Incorrect password');
        }
        const removeGuardians = currentGuardians.filter((g) => !newGuardians.includes(g));
        const addGuardians = newGuardians.filter((g) => !currentGuardians.includes(g));
        if (!removeGuardians.length && !addGuardians.length) return;
        set({ loading: true });

        try {
          const [isDeployed, allowance] = await Promise.all([
            wallet.proxy.isCodeDeployed(provider, userWallet.walletAddress),
            usdcContract.allowance(userWallet.walletAddress, App.web3.paymaster),
          ]);
          const shouldApprove = allowance.lte(defaultPaymasterReapproval);
          const nonce = isDeployed
            ? await wallet.proxy.getNonce(provider, userWallet.walletAddress)
            : constants.userOperations.initNonce;
          await Promise.all([
            shouldApprove
              ? wallet.userOperations.get(userWallet.walletAddress, {
                  nonce,
                  callData: wallet.encodeFunctionData.ERC20Approve(
                    App.web3.usdc,
                    App.web3.paymaster,
                    defaultPaymasterApproval,
                  ),
                })
              : undefined,
            ...removeGuardians.map((g, i) => {
              return wallet.userOperations.get(userWallet.walletAddress, {
                nonce: nonce + i + (shouldApprove ? 1 : 0),
                callData: wallet.encodeFunctionData.revokeGuardian(g),
              });
            }),
            ...addGuardians.map((g, i) => {
              return wallet.userOperations.get(userWallet.walletAddress, {
                nonce: nonce + i + (shouldApprove ? 1 : 0) + removeGuardians.length,
                callData: wallet.encodeFunctionData.grantGuardian(g),
              });
            }),
          ])
            .then((ops) => ops.filter(Boolean))
            .then((ops) => {
              if (!isDeployed) {
                ops[0].initCode = wallet.proxy.getInitCode(
                  userWallet.initImplementation,
                  userWallet.initEntryPoint,
                  userWallet.initOwner,
                  userWallet.initGuardians,
                );
              }
              return ops;
            })
            .then(paymasterApproval(options))
            .then(signUserOps(signer.connect(provider)))
            .then(genericRelay(options));
          set({ loading: false });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      sendUserOpFromWalletConnect: async (userWallet, username, password, transaction, options) => {
        const { user } = get();
        const signer = await wallet.proxy.decryptSigner(userWallet, password, username);
        if (!signer) {
          throw new Error('Incorrect password');
        }
        set({ loading: true });

        try {
          const [isDeployed, allowance] = await Promise.all([
            wallet.proxy.isCodeDeployed(provider, userWallet.walletAddress),
            usdcContract.allowance(userWallet.walletAddress, App.web3.paymaster),
          ]);
          const shouldApprove = allowance.lte(defaultPaymasterReapproval);
          const nonce = isDeployed
            ? await wallet.proxy.getNonce(provider, userWallet.walletAddress)
            : constants.userOperations.initNonce;
          await Promise.all([
            shouldApprove
              ? wallet.userOperations.get(userWallet.walletAddress, {
                  nonce,
                  callData: wallet.encodeFunctionData.ERC20Approve(
                    App.web3.usdc,
                    App.web3.paymaster,
                    defaultPaymasterApproval,
                  ),
                })
              : undefined,
            wallet.userOperations.get(userWallet.walletAddress, {
              nonce: nonce + (shouldApprove ? 1 : 0),
              callData: wallet.encodeFunctionData.executeUserOp(
                transaction.to,
                transaction.value,
                transaction.data,
              ),
            }),
          ])
            .then((ops) => ops.filter(Boolean))
            .then((ops) => {
              if (!isDeployed) {
                ops[0].initCode = wallet.proxy.getInitCode(
                  userWallet.initImplementation,
                  userWallet.initEntryPoint,
                  userWallet.initOwner,
                  userWallet.initGuardians,
                );
              }
              return ops;
            })
            .then(paymasterApproval(options))
            .then(signUserOps(signer.connect(provider)))
            .then(genericRelay(options));
          set({ loading: false });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      clear: () => set({ ...defaultState }),
    }),
    {
      name: 'stackup-wallet-store',
      partialize: (state) => {
        const { loading, balance, ...persisted } = state;
        return persisted;
      },
    },
  ),
);
