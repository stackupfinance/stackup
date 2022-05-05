import create from 'zustand';

interface AuthState {
  loading: boolean;
  accessToken: undefined | string;
  refreshToken: undefined | string;
  login: () => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

// TODO: Remove after backend integration.
// These were generated from https://token.dev/ for testing.
const MOCK_ACCESS_TOKEN =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNjUxNzI0MTYwLCJleHAiOjE3NTE3Mjc3NjAsInR5cGUiOiJhY2Nlc3MifQ.lQ4mqs7AcnW6sPd2x-IV3QgoW-VGAMsoRMkmvqaSA_4';
const MOCK_REFRESH_TOKEN =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNjUxNzI0MTYwLCJleHAiOjE3NTE3Mjc3NjAsInR5cGUiOiJyZWZyZXNoIn0.IVyDUKsGN0xj0vAfbEV7kOhYSU2J15RInOu5DJRZ4qE';
function mockDelay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const useAuthStore = create<AuthState>()(set => ({
  loading: false,
  accessToken: undefined,
  refreshToken: undefined,

  login: async () => {
    // TODO: Implement actual login.
    set({loading: true});
    await mockDelay(500);
    set({
      accessToken: MOCK_ACCESS_TOKEN,
      refreshToken: MOCK_REFRESH_TOKEN,
      loading: false,
    });
  },

  refresh: async () => {
    // TODO: Implement actual refresh.
    set({loading: true});
    await mockDelay(500);
    set({
      accessToken: MOCK_ACCESS_TOKEN,
      refreshToken: MOCK_REFRESH_TOKEN,
      loading: false,
    });
  },

  logout: async () => {
    // TODO: Implement actual logout.
    set({loading: true});
    await mockDelay(500);
    set({accessToken: undefined, refreshToken: undefined, loading: false});
  },
}));

export const useAuthStoreLogoutSelector = () =>
  useAuthStore(state => ({
    logout: state.logout,
  }));

export const useAuthStoreAuthSelector = () =>
  useAuthStore(state => ({
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
    refresh: state.refresh,
  }));

export const useAuthStoreLoginSelector = () =>
  useAuthStore(state => ({
    loading: state.loading,
    login: state.login,
  }));

export const useAuthStoreAssetsSelector = () =>
  useAuthStore(state => ({
    loading: state.loading,
  }));
