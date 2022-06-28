import create from 'zustand';
import {devtools} from 'zustand/middleware';
import axios from 'axios';
import {constants, wallet} from '@stackupfinance/walletjs';
import {Env, CurrencyBalances, Networks, NetworksConfig} from '../config';

interface PaymasterSignatureResponse {
  userOperations: Array<constants.userOperations.IUserOperation>;
}

interface RelaySubmitResponse {
  status: 'PENDING' | 'SUCCESS' | 'FAIL';
}

interface StatusResponse {
  address: string;
  fees: CurrencyBalances;
  allowances: CurrencyBalances;
}

interface BundlerStateConstants {
  loading: boolean;
}

interface BundlerState extends BundlerStateConstants {
  fetchPaymasterStatus: (
    address: string,
    network: Networks,
  ) => Promise<StatusResponse>;
  requestPaymasterSignature: (
    userOperations: Array<constants.userOperations.IUserOperation>,
    network: Networks,
  ) => Promise<Array<constants.userOperations.IUserOperation>>;
  signUserOperations: (
    instance: wallet.WalletInstance,
    masterPassword: string,
    network: Networks,
    userOperations: Array<constants.userOperations.IUserOperation>,
  ) => Promise<Array<constants.userOperations.IUserOperation> | undefined>;
  relayUserOperations: (
    userOperations: Array<constants.userOperations.IUserOperation>,
    network: Networks,
    onChange: (status: RelaySubmitResponse['status']) => void,
  ) => Promise<void>;

  clear: () => void;
}

const defaults: BundlerStateConstants = {
  loading: false,
};
const STORE_NAME = 'stackup-bundler-store';
const useBundlerStore = create<BundlerState>()(
  devtools(
    set => ({
      ...defaults,

      fetchPaymasterStatus: async (address, network) => {
        try {
          set({loading: true});

          const response = await axios.get<StatusResponse>(
            `${Env.BUNDLER_URL}/v1/paymaster/status`,
            {params: {address, network}},
          );

          set({loading: false});
          return response.data;
        } catch (error) {
          set({loading: false});
          throw error;
        }
      },

      requestPaymasterSignature: async (userOperations, network) => {
        try {
          set({loading: true});

          const response = await axios.post<PaymasterSignatureResponse>(
            `${Env.BUNDLER_URL}/v1/paymaster/sign`,
            {userOperations, network},
          );

          return response.data.userOperations;
        } catch (error) {
          set({loading: false});
          throw error;
        }
      },

      signUserOperations: async (
        instance,
        masterPassword,
        network,
        userOperations,
      ) => {
        const signer = await wallet.decryptSigner(
          instance,
          masterPassword,
          instance.salt,
        );
        if (!signer) {
          set({loading: false});
          return undefined;
        }

        const signedOps = await Promise.all(
          userOperations.map(op =>
            wallet.userOperations.sign(
              signer,
              NetworksConfig[network].chainId,
              op,
            ),
          ),
        );
        return signedOps;
      },

      relayUserOperations: async (userOperations, network, onChange) => {
        try {
          const response = await axios.post<RelaySubmitResponse>(
            `${Env.BUNDLER_URL}/v1/relay/submit`,
            {userOperations, network},
          );
          onChange(response.data.status);
          set({loading: false});
        } catch (error) {
          onChange('FAIL');
          set({loading: false});
          throw error;
        }
      },

      clear: () => {
        set({...defaults});
      },
    }),
    {name: STORE_NAME},
  ),
);

export const useBundlerStoreRemoveWalletSelector = () =>
  useBundlerStore(state => ({clear: state.clear}));

export const useBundlerStoreUserOpHooksSelector = () =>
  useBundlerStore(state => ({
    fetchPaymasterStatus: state.fetchPaymasterStatus,
  }));

export const useBundlerStoreHomeSelector = () =>
  useBundlerStore(state => ({
    loading: state.loading,
    requestPaymasterSignature: state.requestPaymasterSignature,
    signUserOperations: state.signUserOperations,
    relayUserOperations: state.relayUserOperations,
  }));
