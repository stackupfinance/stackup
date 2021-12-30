module.exports.getGuardians = async (wallet) => {
  const guardianCount = await wallet.getGuardianCount();
  return Promise.all(
    new Array(guardianCount.toNumber())
      .fill("")
      .map((_, i) => wallet.getGuardian(i))
  );
};
