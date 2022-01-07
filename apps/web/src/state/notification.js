import create from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import axios from 'axios';
import { App } from '../config';

export const notificationUseAuthSelector = (state) => ({
  clear: state.clear,
});

export const notificationHomePageSelector = (state) => ({
  loading: state.loading,
  notifications: state.notifications,
  fetchNotifications: state.fetchNotifications,
  deleteNotification: state.deleteNotification,
  selectNotification: state.selectNotification,
});

const defaultState = {
  loading: false,
  notifications: undefined,
};

export const useNotificationStore = create(
  devtools(
    persist(
      (set, get) => ({
        ...defaultState,

        fetchNotifications: async (options) => {
          set({ loading: true });

          try {
            const res = await axios.get(
              `${App.stackup.backendUrl}/v1/users/${options.userId}/notifications`,
              {
                headers: { Authorization: `Bearer ${options.accessToken}` },
              },
            );

            set({
              loading: false,
              notifications: res.data.notifications,
            });
          } catch (error) {
            set({ loading: false });
            throw error;
          }
        },

        deleteNotification: async (notificationId, options) => {
          set({ loading: true });

          try {
            const res = await axios.delete(
              `${App.stackup.backendUrl}/v1/users/${options.userId}/notifications/${notificationId}`,
              {
                headers: { Authorization: `Bearer ${options.accessToken}` },
              },
            );

            set({
              loading: false,
              notifications: res.data.notifications,
            });
          } catch (error) {
            set({ loading: false });
            throw error;
          }
        },

        clear: () => set({ ...defaultState }),
      }),
      {
        name: 'stackup-notification-store',
        partialize: (state) => {
          const { loading, ...persisted } = state;
          return persisted;
        },
      },
    ),
  ),
);
