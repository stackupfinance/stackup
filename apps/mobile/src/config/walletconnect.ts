type Events = {
  session_request: {
    chainId: number | null;
    peerId: string;
    peerMeta: {
      description: string;
      url: string;
      icons: Array<string>;
      name: string;
    };
  };
};

interface BasePayload<E extends keyof Events, P = Events[E]> {
  id: number;
  jsonrpc: string;
  method: E;
  params: Array<P>;
}

export interface SessionRequestPayload extends BasePayload<'session_request'> {}
