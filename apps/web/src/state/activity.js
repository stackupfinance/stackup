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
  clearSavedActivity: state.clearSavedActivity,
  createActivityItem: state.createActivityItem,
});

const defaultState = {
  loading: false,
  savedActivity: undefined,
};

export const useActivityStore = create(
  devtools(
    persist(
      (set, get) => ({
        findOrCreateActivity: async (toUserId, options = {}) => {
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

        createActivityItem: async (userOperations, options = {}) => {
          set({ loading: true });
          const savedActivity = get().savedActivity;
          const toUser = savedActivity.users.find((curr) => curr.id !== options.userId);

          try {
            const res = await axios.post(
              `${App.stackup.backendUrl}/v1/users/${options.userId}/activity/${savedActivity.id}`,
              { toUserId: toUser.id, userOperations },
              { headers: { Authorization: `Bearer ${options.accessToken}` } },
            );
            set({ loading: false });
          } catch (error) {
            set({ loading: false });
            throw error;
          }
        },

        clearSavedActivity: () => set({ savedActivity: undefined }),

        clear: () => set({ ...defaultState }),
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
