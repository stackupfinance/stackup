const { ethers } = require("ethers");

module.exports.guardianRecovery = (data) => {
  return ethers.utils.arrayify(
    ethers.utils.keccak256(
      ethers.utils.solidityPack(
        ["address", "address", "address"],
        [data.guardian, data.wallet, data.newOwner]
      )
    )
  );
};
