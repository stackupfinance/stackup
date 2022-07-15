import create from 'zustand';
import {devtools} from 'zustand/middleware';
import {ethers, BigNumberish} from 'ethers';
import {wallet, constants} from '@stackupfinance/walletjs';
import {
  Networks,
  NetworksConfig,
  CurrencySymbols,
  OptimalQuote,
  PaymasterStatus,
  GasEstimate,
} from '../config';
import {gasOverrides} from '../utils/userOperations';

interface SwapData {
  baseCurrency: CurrencySymbols;
  quoteCurrency: CurrencySymbols;
  baseCurrencyValue: BigNumberish;
  quoteCurrencyValue: BigNumberish;
  quote: OptimalQuote | null;
  status: PaymasterStatus | null;
  gasEstimate: GasEstimate | null;
  userOperations: Array<constants.userOperations.IUserOperation>;
}

interface SwapStateConstants {
  data: SwapData;
}

interface SwapState extends SwapStateConstants {
  update: (patch: Partial<SwapData>) => void;
  buildOps: (
    instance: wallet.WalletInstance,
    network: Networks,
    defaultCurrency: CurrencySymbols,
    isDeployed: boolean,
    nonce: number,
  ) => Array<constants.userOperations.IUserOperation>;

  clear: () => void;
}

const defaults: SwapStateConstants = {
  data: {
    baseCurrency: 'USDC',
    quoteCurrency: 'ETH',
    baseCurrencyValue: '0',
    quoteCurrencyValue: '0',
    quote: null,
    status: null,
    gasEstimate: null,
    userOperations: [],
  },
};

const STORE_NAME = 'stackup-swap-store';
const useSwapStore = create<SwapState>()(
  devtools(
    (set, get) => ({
      ...defaults,

      update: patch => {
        set({data: {...get().data, ...patch}});
      },

      buildOps: (instance, network, defaultCurrency, isDeployed, nonce) => {
        const {baseCurrency, baseCurrencyValue, quote, status, gasEstimate} =
          get().data;
        if (!quote || !status || !gasEstimate) {
          return [];
        }

        const feeValue = ethers.BigNumber.from(
          status.fees[defaultCurrency] ?? '0',
        );
        const allowance = ethers.BigNumber.from(
          status.allowances[defaultCurrency] ?? '0',
        );
        const shouldApprovePaymaster = allowance.lt(feeValue);
        const shouldApproveRouter =
          baseCurrency !== NetworksConfig[network].nativeCurrency;

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
                status.address,
                feeValue,
              ),
            })
          : undefined;
        const approveRouterOp = shouldApproveRouter
          ? wallet.userOperations.get(instance.walletAddress, {
              nonce: nonce + (shouldApprovePaymaster ? 1 : 0),
              ...gasOverrides(gasEstimate),
              initCode:
                isDeployed || shouldApprovePaymaster
                  ? constants.userOperations.nullCode
                  : wallet.proxy
                      .getInitCode(
                        instance.initImplementation,
                        instance.initOwner,
                        instance.initGuardians,
                      )
                      .toString(),
              callData: wallet.encodeFunctionData.ERC20Approve(
                NetworksConfig[network].currencies[baseCurrency].address,
                quote.transaction.to,
                baseCurrencyValue,
              ),
            })
          : undefined;
        const swapOp = wallet.userOperations.get(instance.walletAddress, {
          nonce:
            nonce +
            (shouldApprovePaymaster ? 1 : 0) +
            (shouldApproveRouter ? 1 : 0),
          ...gasOverrides(gasEstimate),
          callData: wallet.encodeFunctionData.executeUserOp(
            quote.transaction.to,
            quote.transaction.value,
            quote.transaction.data,
          ),
        });
        const userOperations = [
          approvePaymasterOp,
          approveRouterOp,
          swapOp,
        ].filter(Boolean) as Array<constants.userOperations.IUserOperation>;
        return userOperations;
      },

      clear: () => {
        set({...defaults});
      },
    }),
    {name: STORE_NAME},
  ),
);

export const useSwapStoreRemoveWalletSelector = () =>
  useSwapStore(state => ({clear: state.clear}));

export const useSwapStoreHomeSelector = () =>
  useSwapStore(state => ({clear: state.clear}));

export const useSwapStoreSwapSelector = () =>
  useSwapStore(state => ({
    data: state.data,
    update: state.update,
    buildOps: state.buildOps,
  }));

export const useSwapStoreSwapSheetsSelector = () =>
  useSwapStore(state => ({
    data: state.data,
    clear: state.clear,
    buildOps: state.buildOps,
  }));
