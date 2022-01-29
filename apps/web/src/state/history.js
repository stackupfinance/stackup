import create from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { App } from '../config';

export const historyUseAuthSelector = (state) => ({
  clear: state.clear,
});

export const historyHomePageSelector = (state) => ({
  loading: state.loading,
  transactions: state.transactions,
  fetchTransactions: state.fetchTransactions,
});

const defaultState = {
  loading: false,
  transactions: undefined,
};

export const useHistoryStore = create(
  persist(
    (set, get) => ({
      ...defaultState,

      fetchTransactions: async (options) => {
        set({ loading: true });

        try {
          const res = await axios.get(
            `${App.stackup.backendUrl}/v1/users/${options.userId}/transaction/history`,
            {
              params: { limit: 100, page: 1 },
              headers: { Authorization: `Bearer ${options.accessToken}` },
            },
          );

          set({
            loading: false,
            transactions: res.data.transactions,
          });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      clear: () => set({ ...defaultState }),
    }),
    {
      name: 'stackup-history-store',
      partialize: (state) => {
        const { loading, searchData, ...persisted } = state;
        return persisted;
      },
    },
  ),
);
