import {useState} from 'react';
import {ethers, BigNumberish} from 'ethers';
import {CurrencySymbols} from '../../config';

interface SendData {
  toAddress: string;
  currency: CurrencySymbols;
  value: BigNumberish;
}

interface UseSendUserOperationHook {
  data: SendData;

  update: (patch: Partial<SendData>) => void;
  clear: <K extends keyof SendData>(key?: K) => void;
}

const defaultData: SendData = {
  toAddress: ethers.constants.AddressZero,
  currency: 'USDC',
  value: '0',
};

export const useSendUserOperation = (): UseSendUserOperationHook => {
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
  };
};
