import create from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { App } from '../config';

export const searchHomePageSelector = (state) => ({
  loading: state.loading,
  searchData: state.searchData,
  searchByUsername: state.searchByUsername,
  fetchNextPage: state.fetchNextPage,
  hasMore: state.hasMore,
  clearSearchData: state.clearSearchData,
});

export const searchUseAuthSelector = (state) => ({
  clear: state.clear,
});

export const searchOnboardRecoveryPageSelector = (state) => ({
  loading: state.loading,
  searchData: state.searchData,
  searchByUsername: state.searchByUsername,
  fetchNextPage: state.fetchNextPage,
  hasMore: state.hasMore,
  clearSearchData: state.clearSearchData,
});

export const searchUpdateEditGuardiansPageSelector = (state) => ({
  loading: state.loading,
  searchData: state.searchData,
  searchByUsername: state.searchByUsername,
  fetchNextPage: state.fetchNextPage,
  hasMore: state.hasMore,
  clearSearchData: state.clearSearchData,
});

const defaultState = {
  loading: false,
  searchData: undefined,
  selectedResult: undefined,
};

export const useSearchStore = create(
  persist(
    (set, get) => ({
      ...defaultState,

      searchByUsername: async (username, options = {}) => {
        set({ loading: true });

        try {
          const search = await axios.get(
            `${App.stackup.backendUrl}/v1/users/${options.userId}/search`,
            {
              params: { username, limit: 20, page: 1 },
              headers: { Authorization: `Bearer ${options.accessToken}` },
            },
          );

          console.log(search.data);

          set({
            loading: false,
            searchData: search.data,
          });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      fetchNextPage: async (username, options = {}) => {
        const searchData = get().searchData;
        if (!searchData) return;

        try {
          const latest = await axios.get(
            `${App.stackup.backendUrl}/v1/users/${options.userId}/search`,
            {
              params: { username, limit: searchData.limit, page: searchData.page + 1 },
              headers: { Authorization: `Bearer ${options.accessToken}` },
            },
          );
          latest.data.results = [...searchData.results, ...latest.data.results];

          set({
            loading: false,
            searchData: latest.data,
          });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      hasMore: () => {
        const searchData = get().searchData;
        if (!searchData) return false;

        return searchData.page < searchData.totalPages;
      },

      clearSearchData: () => set({ searchData: undefined }),

      clear: () => set({ ...defaultState }),
    }),
    {
      name: 'stackup-search-store',
      partialize: (state) => {
        const { loading, searchData, ...persisted } = state;
        return persisted;
      },
    },
  ),
);
