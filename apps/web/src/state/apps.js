import create from 'zustand';
import { persist } from 'zustand/middleware';
import WalletConnect from '@walletconnect/client';
import { nanoid } from 'nanoid';
import { getChainId } from '../utils/web3';

export const appUseAuthSelector = (state) => ({
  clear: state.clear,
  initAppSessions: state.initAppSessions,
});

export const appsHomePageSelector = (state) => ({
  loading: state.loading,
  sessions: state.sessions,
  connectToApp: state.connectToApp,
  disconnectFromApp: state.disconnectFromApp,
});

const defaultState = {
  loading: false,
  sessions: undefined,
  connectors: undefined,
};

export const useAppsStore = create(
  persist(
    (set, get) => ({
      ...defaultState,

      connectToApp: (walletAddress, opts = {}) => {
        const { sessions = {} } = get();
        const sessionId = opts.sessionId ?? nanoid(6);
        const connector = new WalletConnect({
          uri: opts.uri,
          session: opts.session,
        });
        // Hacky workaround since connectorOpts.session is bugged.
        connector._sessionStorage = {
          getSession: () => sessions[sessionId] || null,
          setSession: (session) =>
            set({
              sessions: { ...(get().sessions || {}), [sessionId]: session },
              connectors: { ...(get().connectors || {}), [sessionId]: connector },
            }),
          removeSession: () => {
            const { [sessionId]: _s, ...sessions } = get().sessions || {};
            const { [sessionId]: _c, ...connectors } = get().connectors || {};
            set({ sessions: Object.keys(sessions).length ? sessions : undefined, connectors });
          },
        };
        opts.uri && set({ loading: true });

        connector.on('session_request', async (error) => {
          if (error) {
            set({ loading: false });
            throw error;
          }

          connector.approveSession({
            accounts: [walletAddress],
            chainId: await getChainId(),
          });
        });

        connector.on('connect', (error) => {
          set({ loading: false });
          if (error) throw error;
        });

        connector.on('disconnect', (error) => {
          set({ loading: false });
          if (error) throw error;
        });
      },

      disconnectFromApp: (sessionId) => {
        const connector = get().connectors?.[sessionId];
        if (!connector) return;

        set({ loading: true });
        connector.killSession();
      },

      initAppSessions: (walletAddress) => {
        const { sessions = {}, connectToApp } = get();
        Object.entries(sessions).forEach(([sessionId, session]) => {
          connectToApp(walletAddress, { sessionId, session });
        });
      },

      clear: () => {
        const { sessions = {}, disconnectFromApp } = get();
        Object.entries(sessions).forEach(([sessionId]) => {
          disconnectFromApp(sessionId);
        });

        set({ ...defaultState });
      },
    }),
    {
      name: 'stackup-apps-store',
      partialize: (state) => {
        const { loading, connectors, ...persisted } = state;
        return persisted;
      },
    },
  ),
);
