import create from 'zustand';
import {devtools} from 'zustand/middleware';
import WalletConnect from '@walletconnect/client';
import {ethers, BytesLike} from 'ethers';
import {wallet, constants} from '@stackupfinance/walletjs';
import {
  Networks,
  NetworksConfig,
  SessionRequestPayload,
  CallRequestPayloads,
  CurrencySymbols,
  EthSendTransactionPayload,
  PaymasterStatus,
  GasEstimate,
  WalletStatus,
} from '../config';
import {decodeMessage} from '../utils/walletconnect';
import {gasOverrides} from '../utils/userOperations';

interface WalletConnectStateConstants {
  loading: boolean;
  sessionRequest: [WalletConnect, SessionRequestPayload] | null;
  callRequest: [WalletConnect, CallRequestPayloads] | null;
}

interface WalletConnectState extends WalletConnectStateConstants {
  connect: (uri: string) => void;
  approveSessionRequest: (
    network: Networks,
    walletAddress: string,
    value: boolean,
  ) => void;
  approveCallRequest: (value: boolean, result?: any) => void;
  signMessage: (
    walletInstance: wallet.WalletInstance,
    password: string,
    message: BytesLike,
  ) => Promise<BytesLike | undefined>;
  buildEthSendTransactionOps: (
    instance: wallet.WalletInstance,
    network: Networks,
    defaultCurrency: CurrencySymbols,
    walletStatus: WalletStatus,
    paymasterStatus: PaymasterStatus,
    gasEstimate: GasEstimate,
    payload: EthSendTransactionPayload,
  ) => Array<constants.userOperations.IUserOperation>;

  clear: () => void;
}

const defaults: WalletConnectStateConstants = {
  loading: false,
  sessionRequest: null,
  callRequest: null,
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
          handleEventError((payload: CallRequestPayloads) => {
            set({callRequest: [connector, payload]});
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

      approveCallRequest: (value, result) => {
        const {callRequest} = get();
        if (!callRequest) {
          set({loading: false});
          return;
        }

        const [connector, payload] = callRequest;
        if (value && result) {
          connector.approveRequest({
            id: payload.id,
            result,
          });
        } else {
          connector.rejectRequest({
            id: payload.id,
            error: {message: 'User rejected request.'},
          });
        }

        set({loading: false, callRequest: null});
      },

      signMessage: async (walletInstance, password, message) => {
        set({loading: true});

        try {
          const signer = await wallet.decryptSigner(
            walletInstance,
            password,
            walletInstance.salt,
          );
          if (!signer) {
            set({loading: false});
            return undefined;
          }

          const signMessage = await signer.signMessage(decodeMessage(message));
          set({loading: false});
          return signMessage;
        } catch (error) {
          set({loading: false});
          throw error;
        }
      },

      buildEthSendTransactionOps: (
        instance,
        network,
        defaultCurrency,
        walletStatus,
        paymasterStatus,
        gasEstimate,
        payload,
      ) => {
        const {nonce, isDeployed} = walletStatus;
        const feeValue = ethers.BigNumber.from(
          paymasterStatus.fees[defaultCurrency] ?? '0',
        );
        const allowance = ethers.BigNumber.from(
          paymasterStatus.allowances[defaultCurrency] ?? '0',
        );
        const shouldApprovePaymaster = allowance.lt(feeValue);
        const params = payload.params[0];

        const approvePaymasterOp = shouldApprovePaymaster
          ? wallet.userOperations.get(instance.walletAddress, {
              nonce,
              ...gasOverrides(gasEstimate),
              initCode: isDeployed
                ? constants.userOperations.nullCode
                : wallet.proxy
                    .getInitCode(
                      instance.initImplementation,
                      instance.initOwner,
                      instance.initGuardians,
                    )
                    .toString(),
              callData: wallet.encodeFunctionData.ERC20Approve(
                NetworksConfig[network].currencies[defaultCurrency].address,
                paymasterStatus.address,
                feeValue,
              ),
            })
          : undefined;
        const walletConnectOp = wallet.userOperations.get(
          instance.walletAddress,
          {
            nonce: nonce + (shouldApprovePaymaster ? 1 : 0),
            ...gasOverrides(gasEstimate),
            callGas: ethers.BigNumber.from(params.gas).toNumber(),
            callData: wallet.encodeFunctionData.executeUserOp(
              params.to,
              params.value,
              params.data,
            ),
          },
        );
        const userOperations = [approvePaymasterOp, walletConnectOp].filter(
          Boolean,
        ) as Array<constants.userOperations.IUserOperation>;
        return userOperations;
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

export const useWalletConnectStoreWalletConnectSheetsSelector = () =>
  useWalletConnectStore(state => ({
    loading: state.loading,
    callRequest: state.callRequest,
    approveCallRequest: state.approveCallRequest,
    signMessage: state.signMessage,
    buildEthSendTransactionOps: state.buildEthSendTransactionOps,
  }));
