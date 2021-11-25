import create from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import axios from 'axios';
import { ethers } from 'ethers';
import { App, Web3 } from '../config';
import { getToUserFromActivity } from '../utils/activity';

export const activityUseAuthSelector = (state) => ({
  clear: state.clear,
});

export const activityHomePageSelector = (state) => ({
  loading: state.loading,
  activityList: state.activityList,
  fetchActivities: state.fetchActivities,
  selectActivity: state.selectActivity,
  updateActivityListFromChannel: state.updateActivityListFromChannel,
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
  activityList: undefined,
  savedActivity: undefined,
  activityItems: undefined,
};

export const useActivityStore = create(
  devtools(
    persist(
      (set, get) => ({
        fetchActivities: async (options) => {
          set({ loading: true });

          try {
            const res = await axios.get(
              `${App.stackup.backendUrl}/v1/users/${options.userId}/activity`,
              {
                params: { limit: 20, page: 1 },
                headers: { Authorization: `Bearer ${options.accessToken}` },
              },
            );

            set({
              loading: false,
              activityList: res.data,
            });
          } catch (error) {
            set({ loading: false });
            throw error;
          }
        },

        updateActivityListFromChannel: async (data, options) => {
          const activityList = get().activityList;
          if (!activityList) return;

          try {
            const { activityItem } = data;
            const toUserId =
              activityItem.toUser === options.userId ? activityItem.fromUser : activityItem.toUser;
            const res = await axios.get(
              `${App.stackup.backendUrl}/v1/users/${options.userId}/activity/find`,
              {
                params: { toUserId },
                headers: { Authorization: `Bearer ${options.accessToken}` },
              },
            );
            const activity = res.data.activity;
            set({
              activityList: {
                ...activityList,
                results: [
                  activity,
                  ...activityList.results.filter((curr) => curr.id !== activity.id),
                ],
              },
            });
          } catch (error) {
            throw error;
          }
        },

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
          const toUser = getToUserFromActivity(savedActivity, options.userId);
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

        selectActivity: (savedActivity) => set({ savedActivity }),

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
