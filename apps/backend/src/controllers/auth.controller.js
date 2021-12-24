const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const {
  authService,
  userService,
  walletService,
  tokenService,
  emailService,
  codeService,
  pusherService,
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
  res.send({ user, tokens });
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

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send({ user });
});

const recoverSendVerificationEmail = catchAsync(async (req, res) => {
  const [email, codeDoc] = await codeService.generateRecoverAccountCode(req.body.username);
  await emailService.sendRecoverAccountEmail(req.body.username, email, codeDoc.code);
  res.status(httpStatus.NO_CONTENT).send();
});

const recoverVerifyEmail = catchAsync(async (req, res) => {
  const guardianRecovery = await authService.recoverVerifyEmail(req.body.username, req.body.code, req.body.newOwner);
  res.send({ guardianRecovery });
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
  recoverSendVerificationEmail,
  recoverVerifyEmail,
  sendVerificationEmail,
  verifyEmail,
  authPusher,
};
