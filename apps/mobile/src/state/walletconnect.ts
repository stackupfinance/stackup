import create from 'zustand';
import {devtools} from 'zustand/middleware';
import WalletConnect from '@walletconnect/client';
import {ethers} from 'ethers';
import {Networks, NetworksConfig, SessionRequestPayload} from '../config';

interface WalletConnectStateConstants {
  loading: boolean;
  sessionRequest: [WalletConnect, SessionRequestPayload] | null;
}

interface WalletConnectState extends WalletConnectStateConstants {
  connect: (uri: string) => void;
  approveSessionRequest: (
    network: Networks,
    walletAddress: string,
    value: boolean,
  ) => void;

  clear: () => void;
}

const defaults: WalletConnectStateConstants = {
  loading: false,
  sessionRequest: null,
};
const STORE_NAME = 'stackup-walletconnect-store';
const useWalletConnectStore = create<WalletConnectState>()(
  devtools(
    (set, get) => ({
      ...defaults,

      connect: uri => {
        const connector = new WalletConnect({
          uri,
          clientMeta: {
            description: 'A wallet that makes crypto effortless',
            url: 'https://stackup.sh',
            icons: ['https://i.imgur.com/maj0ZJ4.png'],
            name: 'Stackup',
          },
        });
        set({loading: true});

        const disconnect = async () =>
          connector.killSession().catch(error => {
            if (error.message === 'Missing or invalid topic field') {
              return;
            }

            set({loading: false});
            throw error;
          });

        const handleEventError =
          <E = Error | null, P = any>(cb: (payload: P) => void) =>
          async (error: E, payload: P) => {
            if (error) {
              await disconnect();

              set({loading: false});
              throw error;
            } else {
              cb(payload);
            }
          };

        connector.on(
          'session_request',
          handleEventError((payload: SessionRequestPayload) => {
            set({sessionRequest: [connector, payload]});
          }),
        );

        connector.on(
          'session_update',
          handleEventError(payload => {
            console.log('session_update');
            console.log(payload);
          }),
        );

        connector.on(
          'call_request',
          handleEventError(payload => {
            console.log('call_request');
            console.log(payload);
          }),
        );

        connector.on(
          'connect',
          handleEventError(payload => {
            console.log('connect');
            console.log(payload);
          }),
        );

        connector.on(
          'disconnect',
          handleEventError(async () => {
            await disconnect();
          }),
        );
      },

      approveSessionRequest: (network, walletAddress, value) => {
        const {sessionRequest} = get();
        if (!sessionRequest) {
          set({loading: false});
          return;
        }

        const [connector] = sessionRequest;
        if (value) {
          connector.approveSession({
            accounts: [walletAddress],
            chainId: ethers.BigNumber.from(
              NetworksConfig[network].chainId,
            ).toNumber(),
          });
        } else {
          connector.rejectSession({
            message: 'User rejected request.',
          });
        }

        set({loading: false, sessionRequest: null});
      },

      clear: () => {
        set({...defaults});
      },
    }),
    {name: STORE_NAME},
  ),
);

export const useWalletConnectStoreRemoveWalletSelector = () =>
  useWalletConnectStore(state => ({clear: state.clear}));

export const useWalletConnectStoreAssetsSheetsSelector = () =>
  useWalletConnectStore(state => ({
    sessionRequest: state.sessionRequest,
    approveSessionRequest: state.approveSessionRequest,
    connect: state.connect,
  }));
