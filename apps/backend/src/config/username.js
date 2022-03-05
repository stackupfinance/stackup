module.exports.isBlacklisted = (username) => {
  return username.match(/stackup|\.eth|admin|support/i);
};
