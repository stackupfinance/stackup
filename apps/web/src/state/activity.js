import create from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { App } from '../config';
import { getActivityId } from '../utils/transaction';

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
  sendNewPaymentTransaction: state.sendNewPaymentTransaction,
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
  persist(
    (set, get) => ({
      fetchActivities: async (options) => {
        set({ loading: true });

        try {
          const res = await axios.get(
            `${App.stackup.backendUrl}/v1/users/${options.userId}/activities`,
            {
              params: { limit: 20, page: 1 },
              headers: { Authorization: `Bearer ${options.accessToken}` },
            },
          );

          console.log(res.data);
          
          set({
            loading: false,
            activityList: res.data,
          });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      fetchActivityItems: async (options = {}) => {
        const savedActivity = get().savedActivity;
        if (!savedActivity) return;
        set({ loading: true });

        try {
          const res = await axios.get(
            `${App.stackup.backendUrl}/v1/users/${options.userId}/activity/${savedActivity.id}`,
            {
              params: { limit: 100, page: 1 },
              headers: { Authorization: `Bearer ${options.accessToken}` },
            },
          );

          set({ loading: false, activityItems: res.data.activityItems });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      sendNewPaymentTransaction: async (userOperations, message, options = {}) => {
        const { savedActivity, activityItems } = get();
        if (!savedActivity || !activityItems) return;
        set({ loading: true });

        try {
          const res = await axios.post(
            `${App.stackup.backendUrl}/v1/users/${options.userId}/transaction`,
            { message, userOperations },
            { headers: { Authorization: `Bearer ${options.accessToken}` } },
          );

          set({
            loading: false,
            activityItems: {
              ...activityItems,
              results: [res.data.pendingNewPayment, ...activityItems.results],
            },
          });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      updateActivityListFromChannel: async (data) => {
        const activityList = get().activityList;
        if (!activityList) return;

        try {
          const { activityItem } = data;
          const activity = {
            id: getActivityId(
              activityItem.fromUser.walletAddress,
              activityItem.toUser.walletAddress,
            ),
            toUser: activityItem.isReceiving ? activityItem.fromUser : activityItem.toUser,
            preview: activityItem.message,
            updatedAt: activityItem.updatedAt,
          };
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

      selectActivity: (savedActivity) => set({ savedActivity, activityItems: undefined }),

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
);
