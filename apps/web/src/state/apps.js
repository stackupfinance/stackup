import create from 'zustand';
import { persist } from 'zustand/middleware';
import WalletConnect from '@walletconnect/client';
import { nanoid } from 'nanoid';
import { ethers } from 'ethers';
import { wallet as walletLib } from '@stackupfinance/walletjs';
import { getChainId } from '../utils/web3';

export const appsUseAuthSelector = (state) => ({
  clear: state.clear,
  initAppSessions: state.initAppSessions,
});

export const appsWeb3TransactionsSelector = (state) => ({
  loading: state.loading,
  sessions: state.sessions,
  connectors: state.connectors,
  callRequestQueue: state.callRequestQueue,
  removeLastInCallRequestQueue: state.removeLastInCallRequestQueue,
  signMessage: state.signMessage,
});

export const appsHomePageSelector = (state) => ({
  loading: state.loading,
  sessions: state.sessions,
  callRequestQueue: state.callRequestQueue,
  connectToApp: state.connectToApp,
  disconnectFromApp: state.disconnectFromApp,
});

const defaultState = {
  loading: false,
  sessions: undefined,
  connectors: undefined,
  callRequestQueue: undefined,
};

export const useAppsStore = create(
  persist(
    (set, get) => ({
      ...defaultState,

      connectToApp: (walletAddress, opts = {}) => {
        const sessionId = opts.sessionId ?? nanoid(6);
        const connector = new WalletConnect({
          uri: opts.uri,
          session: opts.session,
        });
        // Hacky workaround since connectorOpts.storage is bugged.
        connector._sessionStorage = {
          getSession: () => (get().sessions || {})[sessionId] || null,
          setSession: (session) =>
            set({
              sessions: { ...(get().sessions || {}), [sessionId]: session },
              connectors: { ...(get().connectors || {}), [sessionId]: connector },
            }),
          removeSession: () => {
            const { [sessionId]: _s, ...sessions } = get().sessions || {};
            const { [sessionId]: _c, ...connectors } = get().connectors || {};
            const callRequestQueue = (get().callRequestQueue || []).filter(
              (item) => item.sessionId !== sessionId,
            );
            set({
              sessions: Object.keys(sessions).length ? sessions : undefined,
              connectors,
              callRequestQueue: Object.keys(callRequestQueue).length ? sessions : undefined,
            });
          },
        };
        opts.session && connector._sessionStorage.setSession(opts.session);
        opts.uri && set({ loading: true });

        const handleError = (connector, error) => {
          set({ loading: false });
          connector.killSession();
          console.error('connector error.');
          throw error;
        };

        connector.on('session_request', async (error) => {
          if (error) {
            handleError(error);
          } else {
            connector.approveSession({
              accounts: [walletAddress],
              chainId: await getChainId(),
            });
          }
        });

        connector.on('session_update', async (error, payload) => {
          if (error) {
            handleError(error);
          } else {
            set({ loading: false });
            connector.killSession();
          }
        });

        connector.on('call_request', (error, payload) => {
          if (error) {
            handleError(error);
          } else {
            const callRequestQueue = get().callRequests ?? [];
            const alreadyInQueue = Boolean(
              callRequestQueue.find((r) => r.payload.id === payload.id),
            );
            set({
              loading: false,
              callRequestQueue: alreadyInQueue
                ? callRequestQueue
                : [{ sessionId, payload }, ...callRequestQueue],
            });
          }
        });

        connector.on('connect', (error) => {
          if (error) {
            handleError(error);
          } else {
            set({ loading: false });
          }
        });

        connector.on('disconnect', (error) => {
          if (error) {
            handleError(error);
          } else {
            set({ loading: false });
          }
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

      removeLastInCallRequestQueue: () => {
        const { callRequestQueue = [] } = get();
        if (!callRequestQueue.length) return;

        set({ callRequestQueue: callRequestQueue.slice(0, -1) });
      },

      signMessage: async (wallet, message, username, password) => {
        set({ loading: true });

        try {
          const signer = await walletLib.proxy.decryptSigner(wallet, password, username);
          if (!signer) throw new Error('Incorrect password');

          const sig = await signer.signMessage(ethers.utils.toUtf8String(message));
          set({ loading: false });
          return sig;
        } catch (error) {
          set({ loading: false });
          throw error;
        }
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
