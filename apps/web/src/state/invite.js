import create from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { App } from '../config';

export const inviteUseAuthSelector = (state) => ({
  clear: state.clear,
});

export const inviteSelector = (state) => ({
  loading: state.loading,
  invite: state.invite,
  fetchInvite: state.fetchInvite,
});

const defaultState = {
  loading: false,
  invite: undefined,
};

export const useInviteStore = create(
  persist(
    (set, _get) => ({
      ...defaultState,

      fetchInvite: async (data) => {
        set({ loading: true });

        try {
          const res = await axios.get(`${App.stackup.backendUrl}/v1/invite`, {
            params: { invite: data.invite },
          });

          console.log(res);

          set({
            loading: false,
            invite: res.data.invite,
          });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      clear: () => set({ ...defaultState }),
    }),
    {
      name: 'stackup-invite-store',
      partialize: (state) => {
        // eslint-disable-next-line unused-imports/no-unused-vars
        const { loading, ...persisted } = state;
        return persisted;
      },
    },
  ),
);
