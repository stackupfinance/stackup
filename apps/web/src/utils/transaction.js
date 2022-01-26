export const txType = {
  genericRelay: 'genericRelay',
  newPayment: 'newPayment',
  recoverAccount: 'recoverAccount',
};

export const txStatus = {
  success: 'success',
  failed: 'failed',
};

export const getActivityId = (address1, address2) => {
  return [address1, address2].sort().join('-');
};
