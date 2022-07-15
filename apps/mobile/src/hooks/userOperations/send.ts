import {useState} from 'react';
import {ethers, BigNumberish} from 'ethers';
import {wallet, constants} from '@stackupfinance/walletjs';
import {CurrencySymbols, Networks, Fee, NetworksConfig} from '../../config';
import {
  useBundlerStoreUserOpHooksSelector,
  useExplorerStoreUserOpHooksSelector,
} from '../../state';
import {gasOverrides} from '../../utils/userOperations';

interface SendData {
  toAddress: string;
  currency: CurrencySymbols;
  value: BigNumberish;
  fee: Fee;
  userOperations: Array<constants.userOperations.IUserOperation>;
}

interface UseSendUserOperationHook {
  data: SendData;

  update: (patch: Partial<SendData>) => void;
  clear: () => void;
  buildOps: (
    instance: wallet.WalletInstance,
    network: Networks,
    isDeployed: boolean,
    nonce: number,
    defaultCurrency: CurrencySymbols,
    toAddress: string,
    value: BigNumberish,
  ) => Promise<{
    fee: Fee;
    userOperations: Array<constants.userOperations.IUserOperation>;
  }>;
}

const defaultData: SendData = {
  toAddress: ethers.constants.AddressZero,
  currency: 'USDC',
  value: '0',
  fee: {currency: 'USDC', value: '0'},
  userOperations: [],
};

export const useSendUserOperation = (): UseSendUserOperationHook => {
  const {fetchPaymasterStatus} = useBundlerStoreUserOpHooksSelector();
  const {fetchGasEstimate} = useExplorerStoreUserOpHooksSelector();
  const [data, setData] = useState<SendData>(defaultData);

  return {
    data,
    update: patch => setData({...data, ...patch}),

    clear: () => setData(defaultData),

    buildOps: async (
      instance,
      network,
      isDeployed,
      nonce,
      defaultCurrency,
      toAddress,
      value,
    ) => {
      const [status, gasEstimate] = await Promise.all([
        fetchPaymasterStatus(instance.walletAddress, network),
        fetchGasEstimate(network),
      ]);
      const feeValue = ethers.BigNumber.from(
        status.fees[defaultCurrency] ?? '0',
      );
      const allowance = ethers.BigNumber.from(
        status.allowances[defaultCurrency] ?? '0',
      );
      const shouldApprovePaymaster = allowance.lt(feeValue);

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
      const sendOp = wallet.userOperations.get(instance.walletAddress, {
        nonce: nonce + (shouldApprovePaymaster ? 1 : 0),
        ...gasOverrides(gasEstimate),
        callData:
          data.currency === NetworksConfig[network].nativeCurrency
            ? wallet.encodeFunctionData.executeUserOp(toAddress, value)
            : wallet.encodeFunctionData.ERC20Transfer(
                NetworksConfig[network].currencies[data.currency].address,
                toAddress,
                value,
              ),
      });
      const userOperations = [approvePaymasterOp, sendOp].filter(
        Boolean,
      ) as Array<constants.userOperations.IUserOperation>;

      return {
        userOperations,
        fee: {currency: defaultCurrency, value: feeValue},
      };
    },
  };
};
