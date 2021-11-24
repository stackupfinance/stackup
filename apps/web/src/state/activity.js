import create from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import axios from 'axios';
import { ethers } from 'ethers';
import { App, Web3 } from '../config';
import { getToUserFromSavedActivity } from '../utils/activity';

export const activityUseAuthSelector = (state) => ({
  clear: state.clear,
});

export const activityActivityPageSelector = (state) => ({
  loading: state.loading,
  savedActivity: state.savedActivity,
  activityItems: state.activityItems,
  findOrCreateActivity: state.findOrCreateActivity,
  clearSavedActivity: state.clearSavedActivity,
  createActivityItem: state.createActivityItem,
  fetchActivityItems: state.fetchActivityItems,
  updateActivityItemFromChannel: state.updateActivityItemFromChannel,
});

const defaultState = {
  loading: false,
  savedActivity: undefined,
  activityItems: undefined,
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

        createActivityItem: async (userOperations, amount, message, options = {}) => {
          set({ loading: true });
          const savedActivity = get().savedActivity;
          const toUser = getToUserFromSavedActivity(savedActivity, options.userId);
          const data = {
            toUser: toUser.id,
            amount: ethers.utils.parseUnits(amount, Web3.USDC_UNITS).toNumber(),
            message,
            userOperations,
          };

          try {
            const res = await axios.post(
              `${App.stackup.backendUrl}/v1/users/${options.userId}/activity/${savedActivity.id}`,
              data,
              { headers: { Authorization: `Bearer ${options.accessToken}` } },
            );

            set({ loading: false, activityItems: res.data.activityItems });
          } catch (error) {
            set({ loading: false });
            throw error;
          }
        },

        updateActivityItemFromChannel: (data) => {
          const { activityItem } = data;
          const activityItems = get().activityItems;
          if (!activityItems) return;

          if (!activityItems.results.find((curr) => curr.id === activityItem.id)) {
            set({
              activityItems: {
                ...activityItems,
                results: [activityItem, ...activityItems.results],
              },
            });
          } else {
            set({
              activityItems: {
                ...activityItems,
                results: activityItems.results.map((item) => {
                  if (item.id !== activityItem.id) return item;
                  else return activityItem;
                }),
              },
            });
          }
        },

        fetchActivityItems: async (options = {}) => {
          const savedActivity = get().savedActivity;
          if (!savedActivity) return;
          set({ loading: true });

          try {
            const res = await axios.get(
              `${App.stackup.backendUrl}/v1/users/${options.userId}/activity/${savedActivity?.id}`,
              {
                params: { limit: 20, page: 1 },
                headers: { Authorization: `Bearer ${options.accessToken}` },
              },
            );

            set({ loading: false, activityItems: res.data.activityItems });
          } catch (error) {
            set({ loading: false });
            throw error;
          }
        },

        clearSavedActivity: () => set({ savedActivity: undefined, activityItems: undefined }),

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
