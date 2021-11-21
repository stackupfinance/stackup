import create from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import axios from 'axios';
import { App } from '../config';

export const activityUseAuthSelector = (state) => ({
  clear: state.clear,
});

export const activityActivityPageSelector = (state) => ({
  loading: state.loading,
  savedActivity: state.savedActivity,
  findOrCreateActivity: state.findOrCreateActivity,
});

const defaultState = {
  loading: false,
  savedActivity: undefined,
};

export const useActivityStore = create(
  devtools(
    persist(
      (set, get) => ({
        findOrCreateActivity: async (toUserId, options) => {
          set({ loading: true });

          try {
            const find = await axios.get(
              `${App.stackup.backendUrl}/v1/users/${options.userId}/activity/find`,
              {
                params: { toUserId },
                headers: { Authorization: `Bearer ${options.accessToken}` },
              },
            );

            if (!find.data.activity) {
              const create = await axios.post(
                `${App.stackup.backendUrl}/v1/users/${options.userId}/activity`,
                { toUserId },
                { headers: { Authorization: `Bearer ${options.accessToken}` } },
              );

              set({ loading: false, savedActivity: create.data.activity });
            } else {
              set({ loading: false, savedActivity: find.data.activity });
            }
          } catch (error) {
            set({ loading: false });
            throw error;
          }
        },

        clear: () => ({ ...defaultState }),
      }),
      {
        name: 'stackup-activity-store',
        partialize: (state) => {
          const { loading, ...persisted } = state;
          return persisted;
        },
      },
    ),
  ),
);
