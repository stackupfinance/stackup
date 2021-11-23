import create from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { ethers } from 'ethers';
import axios from 'axios';
import { App, Web3 } from '../config';
import {
  usdcContract,
  getSigner,
  isWalletDeployed,
  getWalletNonce,
  signUserOperation,
  getUserOperation,
  getInitCode,
  encodeERC20Approve,
  encodeERC20Transfer,
  defaultPaymasterApproval,
  defaultPaymasterReapproval,
} from '../utils/wallets';

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
  sendNewPayment: state.sendNewPayment,
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
  return Promise.all(ops.map((op) => signUserOperation(signer, op)));
};

export const useWalletStore = create(
  devtools(
    persist(
      (set, get) => ({
        ...defaultState,

        fetchBalance: async (wallet) => {
          if (!wallet) return;
          set({ loading: true });

          try {
            const balance = await usdcContract.balanceOf(wallet.walletAddress);
            set({ loading: false, balance });
          } catch (error) {
            set({ loading: false });
            throw error;
          }
        },

        sendNewPayment: async (wallet, data, options) => {
          const signer = getSigner(wallet, data.password);
          if (!signer) {
            throw new Error('Incorrect password');
          }
          set({ loading: true });

          try {
            const [isDeployed, allowance] = await Promise.all([
              isWalletDeployed(wallet.walletAddress),
              usdcContract.allowance(data.toWalletAddress, wallet.walletAddress),
            ]);
            const shouldApprove = allowance.lte(defaultPaymasterReapproval);
            const nonce = isDeployed ? await getWalletNonce(wallet.walletAddress) : 0;
            const newPaymentUserOps = await Promise.all([
              shouldApprove
                ? getUserOperation(wallet.walletAddress, {
                    ...(!isDeployed && { initCode: getInitCode(wallet.initSignerAddress) }),
                    nonce,
                    callData: encodeERC20Approve(Web3.PAYMASTER_ADDRESS, defaultPaymasterApproval),
                  })
                : undefined,
              getUserOperation(wallet.walletAddress, {
                nonce,
                callData: encodeERC20Transfer(
                  data.toWalletAddress,
                  ethers.utils.parseUnits(data.amount, Web3.USDC_UNITS),
                ),
              }),
            ])
              .then((ops) => ops.filter(Boolean))
              .then(paymasterApproval(options))
              .then(signUserOps(signer));

            console.log(newPaymentUserOps);

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
          const { loading, ...persisted } = state;
          return persisted;
        },
      },
    ),
  ),
);
