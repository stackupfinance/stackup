import create from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { ethers } from 'ethers';
import { Web3 } from '../config';

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
});

const defaultState = {
  loading: false,
  balance: ethers.constants.Zero,
};

export const useWalletStore = create(
  devtools(
    persist(
      (set, get) => ({
        ...defaultState,

        fetchBalance: async (wallet) => {
          if (!wallet) return;

          const usdc = new ethers.Contract(
            Web3.USDC,
            Web3.ERC20_ABI,
            new ethers.providers.JsonRpcProvider(Web3.RPC),
          );
          set({ loading: true });

          try {
            const balance = await usdc.balanceOf(wallet.walletAddress);
            set({ loading: false, balance });
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
