const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const {
  authService,
  userService,
  walletService,
  tokenService,
  emailService,
  intercomService,
  codeService,
  pusherService,
  signerService,
  transactionService,
  notificationService,
} = require('../services');

const register = catchAsync(async (req, res) => {
  const { wallet, ...user } = req.body;
  const u = await userService.createUser(user);
  const w = await walletService.createWallet(u.id, wallet);
  await userService.updateUserById(u.id, { wallet: w.id });

  const tokens = await tokenService.generateAuthTokens(u);
  res.status(httpStatus.CREATED).send({ user: await userService.getUserById(u.id), tokens });
});

const lookup = catchAsync(async (req, res) => {
  const { username } = req.body;
  const user = await userService.getWalletForLogin(username);
  res.send({ user });
});

const login = catchAsync(async (req, res) => {
  const { username, signature } = req.body;
  const user = await authService.loginUserWithUsernameAndSignature(username, signature);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user: { ...user.toJSON(), intercomHmacHash: intercomService.getHmacHash(user._id) }, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const recoverLookup = catchAsync(async (req, res) => {
  const user = await userService.getWalletForRecovery(req.body.username);
  res.send({ user });
});

const recoverPaymasterApproval = catchAsync(async (req, res) => {
  // TODO: Run additional verification before approving?
  const userOperations = await Promise.all(req.body.userOperations.map(signerService.signUserOpWithPaymaster));
  res.send({ userOperations });
});

const recoverRequestGuardianApproval = catchAsync(async (req, res) => {
  const users = await userService.getUsersByWalletAddress(req.body.guardians);
  await notificationService.createRequestGuardianApprovals(
    users.map((u) => ({
      user: u._id,
      preview: `${req.body.username} needs your help with recovery`,
      data: { username: req.body.username, channelId: req.body.channelId, userOperations: req.body.userOperations },
    }))
  );
  pusherService.pushRequestGuardianApprovals(users);

  res.send({
    status: users.map((user) => {
      const { _id, ...rest } = user;
      return { ...rest, isComplete: false };
    }),
  });
});

const recoverSendGuardianApproval = catchAsync(async (req, res) => {
  await pusherService.pushRecoverAccountUpdates(req.body.channelId, {
    username: req.user.username,
    userOperations: req.body.userOperations,
  });
  res.status(httpStatus.NO_CONTENT).send();
});

const recoverSendVerificationEmail = catchAsync(async (req, res) => {
  const [email, codeDoc] = await codeService.generateRecoverAccountCode(req.body.username);
  await emailService.sendRecoverAccountEmail(req.body.username, email, codeDoc.code);
  res.status(httpStatus.NO_CONTENT).send();
});

const recoverVerifyEmail = catchAsync(async (req, res) => {
  const userOperations = await authService.recoverVerifyEmail(req.body.username, req.body.code, req.body.userOperations);
  res.send({ userOperations });
});

const recoverConfirm = catchAsync(async (req, res) => {
  const { signature, userOperations, ...context } = req.body;
  await transactionService.verifyRecoverAccountUserOps(signature, userOperations);

  const tx = await transactionService.createTransaction(await transactionService.parseUserOperations(userOperations));
  await transactionService.relayTransaction({ transactionId: tx._id, userOperations, context });

  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const codeDoc = await codeService.generateVerifyEmailCode(req.user);
  await emailService.sendVerificationEmail(req.user.username, req.user.email, codeDoc.code);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.user.id, req.body.code);
  res.status(httpStatus.NO_CONTENT).send();
});

const authPusher = catchAsync(async (req, res) => {
  const auth = await pusherService.auth(req.body.socket_id, req.body.channel_name);
  res.send(auth);
});

module.exports = {
  register,
  lookup,
  login,
  logout,
  refreshTokens,
  recoverLookup,
  recoverPaymasterApproval,
  recoverRequestGuardianApproval,
  recoverSendGuardianApproval,
  recoverSendVerificationEmail,
  recoverVerifyEmail,
  recoverConfirm,
  sendVerificationEmail,
  verifyEmail,
  authPusher,
};
