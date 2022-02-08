module.exports.isBlacklisted = (username) => {
  return username.match(/stackup|admin|support/i);
};
