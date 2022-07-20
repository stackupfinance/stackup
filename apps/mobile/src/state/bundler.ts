import create from 'zustand';
import {devtools} from 'zustand/middleware';
import axios from 'axios';
import {ethers} from 'ethers';
import {constants, wallet} from '@stackupfinance/walletjs';
import {Env, Networks, NetworksConfig, PaymasterStatus} from '../config';

interface PaymasterSignatureResponse {
  userOperations: Array<constants.userOperations.IUserOperation>;
}

interface RelaySubmitResponse {
  status: 'PENDING' | 'SUCCESS' | 'FAIL';
  hash?: string | null;
}

interface BundlerStateConstants {
  loading: boolean;
}

interface BundlerState extends BundlerStateConstants {
  fetchPaymasterStatus: (
    address: string,
    network: Networks,
  ) => Promise<PaymasterStatus>;
  requestPaymasterSignature: (
    userOperations: Array<constants.userOperations.IUserOperation>,
    network: Networks,
  ) => Promise<Array<constants.userOperations.IUserOperation>>;
  verifyUserOperationsWithPaymaster: (
    userOperations: Array<constants.userOperations.IUserOperation>,
    userOperationsWithPaymaster: Array<constants.userOperations.IUserOperation>,
  ) => boolean;
  signUserOperations: (
    instance: wallet.WalletInstance,
    masterPassword: string,
    network: Networks,
    userOperations: Array<constants.userOperations.IUserOperation>,
  ) => Promise<Array<constants.userOperations.IUserOperation> | undefined>;
  relayUserOperations: (
    userOperations: Array<constants.userOperations.IUserOperation>,
    network: Networks,
    onChange: (
      status: RelaySubmitResponse['status'],
      hash: RelaySubmitResponse['hash'],
    ) => void,
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

          const response = await axios.get<PaymasterStatus>(
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

      verifyUserOperationsWithPaymaster: (ops, opsWithPaymaster) => {
        if (ops.length !== opsWithPaymaster.length) {
          return false;
        }

        const isUnchanged = ops.reduce((prev, curr, i) => {
          if (!prev) {
            return false;
          }
          return (
            curr.sender === opsWithPaymaster[i].sender &&
            curr.nonce === opsWithPaymaster[i].nonce &&
            curr.initCode === opsWithPaymaster[i].initCode &&
            curr.callData === opsWithPaymaster[i].callData &&
            curr.callGas === opsWithPaymaster[i].callGas &&
            curr.verificationGas === opsWithPaymaster[i].verificationGas &&
            curr.preVerificationGas ===
              opsWithPaymaster[i].preVerificationGas &&
            curr.maxFeePerGas === opsWithPaymaster[i].maxFeePerGas &&
            curr.maxPriorityFeePerGas ===
              opsWithPaymaster[i].maxPriorityFeePerGas
          );
        }, true);

        if (!isUnchanged) {
          set({loading: false});
        }
        return isUnchanged;
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
          onChange(
            response.data.status,
            response.data.hash ?? ethers.constants.HashZero,
          );
          set({loading: false});
        } catch (error) {
          onChange('FAIL', ethers.constants.HashZero);
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

export const useBundlerStoreAssetsSheetsSelector = () =>
  useBundlerStore(state => ({
    loading: state.loading,
    requestPaymasterSignature: state.requestPaymasterSignature,
    verifyUserOperationsWithPaymaster: state.verifyUserOperationsWithPaymaster,
    signUserOperations: state.signUserOperations,
    relayUserOperations: state.relayUserOperations,
    clear: state.clear,
  }));

export const useBundlerStoreSwapSelector = () =>
  useBundlerStore(state => ({
    loading: state.loading,
    fetchPaymasterStatus: state.fetchPaymasterStatus,
  }));

export const useBundlerStoreSwapSheetsSelector = () =>
  useBundlerStore(state => ({
    loading: state.loading,
    requestPaymasterSignature: state.requestPaymasterSignature,
    verifyUserOperationsWithPaymaster: state.verifyUserOperationsWithPaymaster,
    signUserOperations: state.signUserOperations,
    relayUserOperations: state.relayUserOperations,
    clear: state.clear,
  }));

export const useBundlerStoreWalletConnectSheetsSelector = () =>
  useBundlerStore(state => ({
    loading: state.loading,
    fetchPaymasterStatus: state.fetchPaymasterStatus,
    requestPaymasterSignature: state.requestPaymasterSignature,
    verifyUserOperationsWithPaymaster: state.verifyUserOperationsWithPaymaster,
    signUserOperations: state.signUserOperations,
    relayUserOperations: state.relayUserOperations,
    clear: state.clear,
  }));
