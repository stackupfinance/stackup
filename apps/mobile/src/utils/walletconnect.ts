export const isValidWalletConnectURI = (value: string) => {
  return value.startsWith('wc:');
};
