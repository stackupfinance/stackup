import {useState} from 'react';
import {ethers, BigNumberish} from 'ethers';
import {wallet, constants} from '@stackupfinance/walletjs';
import {CurrencySymbols, Networks, Fee, NetworksConfig} from '../../config';
import {useBundlerStoreUserOpHooksSelector} from '../../state';

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
  clear: <K extends keyof SendData>(key?: K) => void;
  buildOps: (
    instance: wallet.WalletInstance,
    network: Networks,
    quoteCurrency: CurrencySymbols,
    isDeployed: boolean,
    nonce: number,
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
  const [data, setData] = useState<SendData>(defaultData);

  return {
    data,
    update: patch => setData({...data, ...patch}),

    clear: key => {
      if (key) {
        setData({...data, [key]: defaultData[key]});
      } else {
        setData(defaultData);
      }
    },

    buildOps: async (instance, network, quoteCurrency, isDeployed, nonce) => {
      const status = await fetchPaymasterStatus(
        instance.walletAddress,
        network,
      );
      const paymasterAddress = status.address;
      const feeValue = ethers.BigNumber.from(status.fees[quoteCurrency] ?? '0');
      const allowance = ethers.BigNumber.from(
        status.allowances[quoteCurrency] ?? '0',
      );
      const shouldApprove = allowance.lt(feeValue);

      const approveOp = shouldApprove
        ? wallet.userOperations.get(instance.walletAddress, {
            nonce,
            preVerificationGas: 0,
            initCode: isDeployed
              ? constants.userOperations.nullCode
              : wallet.proxy.getInitCode(
                  instance.initImplementation,
                  instance.initOwner,
                  instance.initGuardians,
                ),
            callData: wallet.encodeFunctionData.ERC20Approve(
              NetworksConfig[network].currencies[data.currency].address,
              paymasterAddress,
              feeValue,
            ),
          })
        : undefined;
      const sendOp = wallet.userOperations.get(instance.walletAddress, {
        nonce: shouldApprove ? nonce + 1 : nonce,
        preVerificationGas: 0,
        callData: wallet.encodeFunctionData.ERC20Transfer(
          NetworksConfig[network].currencies[data.currency].address,
          data.toAddress,
          data.value,
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
