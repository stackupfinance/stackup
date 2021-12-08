const { interface } = require("../contracts/wallet");

module.exports.initialize = (entryPoint, owner, guardians) => {
  return interface.encodeFunctionData("initialize", [
    entryPoint,
    owner,
    guardians,
  ]);
};

module.exports.recoverAccount = (newOwner, guardianRecoveryArray) => {
  return interface.encodeFunctionData("recoverAccount", [
    newOwner,
    guardianRecoveryArray,
  ]);
};
