import create from 'zustand';
import axios from 'axios';
import { App } from '../config';

export const inviteUseAuthSelector = (state) => ({
  clear: state.clear,
});

export const inviteBetaPageSelector = (state) => ({
  loading: state.loading,
  fetchInvite: state.fetchInvite,
});

export const inviteSignUpPageSelector = (state) => ({
  code: state.code,
});

const defaultState = {
  loading: false,
  code: undefined,
  used: undefined,
};

export const useInviteStore = create((set, _get) => ({
  ...defaultState,

  fetchInvite: async (inviteCode) => {
    set({ loading: true });

    try {
      const res = await axios.get(`${App.stackup.backendUrl}/v1/invite`, {
        params: { inviteCode },
      });

      const { code, used } = res.data;
      set({
        loading: false,
        code,
        used,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  clear: () => set({ ...defaultState }),
}));
