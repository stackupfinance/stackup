import create from 'zustand';
import axios from 'axios';
import { App } from '../config';

export const fiatUseAuthSelector = (state) => ({
  clear: state.clear,
});

export const fiatFiatDepositPageSelector = (state) => ({
  loading: state.loading,
  fetchFiatDepositSession: state.fetchFiatDepositSession,
});

const defaultState = {
  loading: false,
};

export const useFiatStore = create((set, _get) => ({
  ...defaultState,

  fetchFiatDepositSession: async (options = {}) => {
    set({ loading: true });

    try {
      const res = await axios.get(
        `${App.stackup.backendUrl}/v1/users/${options.userId}/fiat/deposit-session`,
        { headers: { Authorization: `Bearer ${options.accessToken}` } },
      );

      set({ loading: false });
      return res.data.sessionUrl;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  clear: () => set({ ...defaultState }),
}));
