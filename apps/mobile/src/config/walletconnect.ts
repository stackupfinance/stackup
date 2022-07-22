import {BytesLike, BigNumberish} from 'ethers';

type PayloadParam = {
  session_request: [
    {
      chainId: number | null;
      peerId: string;
      peerMeta: {
        description: string;
        url: string;
        icons: Array<string>;
        name: string;
      };
    },
  ];

  personal_sign: [message: BytesLike, address: string];

  eth_sendTransaction: [
    {
      from: string;
      to: string;
      data: BytesLike;
      value: BigNumberish;
      gas: BigNumberish;
    },
  ];
};

interface BasePayload<M extends keyof PayloadParam, P = PayloadParam[M]> {
  id: number;
  jsonrpc: string;
  method: M;
  params: P;
}

export interface SessionRequestPayload extends BasePayload<'session_request'> {}

export interface PersonalSignPayload extends BasePayload<'personal_sign'> {}
export interface EthSendTransactionPayload
  extends BasePayload<'eth_sendTransaction'> {}

export type CallRequestPayloads =
  | PersonalSignPayload
  | EthSendTransactionPayload;
