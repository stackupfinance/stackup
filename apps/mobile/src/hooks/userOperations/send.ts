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
    quoteCurrency: CurrencySymbols,
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
      quoteCurrency,
      toAddress,
      value,
    ) => {
      const [status, gasEstimate] = await Promise.all([
        fetchPaymasterStatus(instance.walletAddress, network),
        fetchGasEstimate(network),
      ]);
      const paymasterAddress = status.address;
      const feeValue = ethers.BigNumber.from(status.fees[quoteCurrency] ?? '0');
      const allowance = ethers.BigNumber.from(
        status.allowances[quoteCurrency] ?? '0',
      );
      const shouldApprove = allowance.lt(feeValue);

      const approveOp = shouldApprove
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
              NetworksConfig[network].currencies[data.currency].address,
              paymasterAddress,
              feeValue,
            ),
          })
        : undefined;
      const sendOp = wallet.userOperations.get(instance.walletAddress, {
        nonce: shouldApprove ? nonce + 1 : nonce,
        ...gasOverrides(gasEstimate),
        callData: wallet.encodeFunctionData.ERC20Transfer(
          NetworksConfig[network].currencies[data.currency].address,
          toAddress,
          value,
        ),
      });
      const userOperations = approveOp ? [approveOp, sendOp] : [sendOp];

      return {
        userOperations,
        fee: {currency: quoteCurrency, value: feeValue},
      };
    },
  };
};
