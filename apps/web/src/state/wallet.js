import create from 'zustand';
import { persist, devtools } from 'zustand/middleware';
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

const defaultState = {
  loading: false,
  balance: ethers.constants.Zero,
};

const paymasterApproval =
  (options = {}) =>
  async (userOperations) => {
    try {
      const res = await axios.post(
        `${App.stackup.backendUrl}/v1/users/${options.userId}/activity/paymasterApproval`,
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

export const useWalletStore = create(
  devtools(
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
          const signer = wallet.proxy.decryptSigner(userWallet, data.password);
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
              .then(signUserOps(signer));

            set({ loading: false });
            return newPaymentUserOps;
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
  ),
);
