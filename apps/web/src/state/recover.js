import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { wallet, constants } from '@stackupfinance/contracts';
import {
  provider,
  walletContract,
  usdcContract,
  defaultPaymasterApproval,
  defaultPaymasterReapproval,
  loginMessage,
} from '../../src/utils/web3';
import { App } from '../config';

export const recoverUseAuthSelector = (state) => ({
  clear: state.clear,
});

export const recoverLoginPageSelector = (state) => ({
  clear: state.clear,
});

export const recoverHomePageSelector = (state) => ({
  clear: state.clear,
  selectGuardianRequest: state.selectGuardianRequest,
});

export const recoverRecoverLookupPageSelector = (state) => ({
  loading: state.loading,
  lookup: state.lookup,
});

export const recoverRecoverNewPasswordPageSelector = (state) => ({
  loading: state.loading,
  user: state.user,
  guardians: state.guardians,
  createSignerAndUserOps: state.createSignerAndUserOps,
});

export const recoverRecoverVerifyEmailPageSelector = (state) => ({
  loading: state.loading,
  userOperations: state.userOperations,
  guardians: state.guardians,
  sendVerificationEmail: state.sendVerificationEmail,
  verifyEmail: state.verifyEmail,
});

export const recoverRecoverStatusPageSelector = (state) => ({
  loading: state.loading,
  userOperations: state.userOperations,
  status: state.status,
  channelId: state.channelId,
});

export const recoverRecoverApproveRequestPageSelector = (state) => ({
  loading: state.loading,
  savedGuardianRequest: state.savedGuardianRequest,
  approveGuardianRequest: state.approveGuardianRequest,
});

export const recoverRecoverConfirmPageSelector = (state) => ({
  loading: state.loading,
  userOperations: state.userOperations,
  confirm: state.confirm,
  onComplete: state.onComplete,
  channelId: state.channelId,
});

const defaultState = {
  loading: false,
  user: undefined,
  encryptedSigner: undefined,
  userOperations: undefined,
  status: undefined,
  guardians: undefined,
  channelId: undefined,
  savedGuardianRequest: undefined,
};

const paymasterApproval = async (userOperations) => {
  try {
    const res = await axios.post(`${App.stackup.backendUrl}/v1/auth/recover/paymaster-approval`, {
      userOperations,
    });

    return res.data.userOperations;
  } catch (error) {
    throw error;
  }
};

export const useRecoverStore = create(
  devtools(
    persist(
      (set, get) => ({
        ...defaultState,

        createSignerAndUserOps: async (password) => {
          const user = get().user;
          const guardians = get().guardians;
          if (!user || !guardians) return;
          set({ loading: true });

          try {
            const { encryptedSigner } = wallet.proxy.initEncryptedIdentity(password);
            const newOwner = wallet.proxy.decryptSigner({ encryptedSigner }, password).address;
            const [isDeployed, allowance] = await Promise.all([
              wallet.proxy.isCodeDeployed(provider, user.wallet.walletAddress),
              usdcContract.allowance(user.wallet.walletAddress, App.web3.paymaster),
            ]);
            const shouldApprove = allowance.lte(defaultPaymasterReapproval);
            const nonce = isDeployed
              ? await wallet.proxy.getNonce(provider, user.wallet.walletAddress)
              : constants.userOperations.initNonce;
            const userOperations = await Promise.all([
              shouldApprove
                ? wallet.userOperations.get(user.wallet.walletAddress, {
                    nonce,
                    initCode: isDeployed
                      ? constants.userOperations.nullCode
                      : wallet.proxy.getInitCode(
                          user.wallet.initImplementation,
                          user.wallet.initEntryPoint,
                          user.wallet.initOwner,
                          user.wallet.initGuardians,
                        ),
                    callData: wallet.encodeFunctionData.ERC20Approve(
                      App.web3.usdc,
                      App.web3.paymaster,
                      defaultPaymasterApproval,
                    ),
                  })
                : undefined,
              wallet.userOperations.get(user.wallet.walletAddress, {
                nonce: shouldApprove ? nonce + 1 : nonce,
                callData: wallet.encodeFunctionData.transferOwner(newOwner),
              }),
            ])
              .then((ops) => ops.filter(Boolean))
              .then(paymasterApproval);

            const channelId = nanoid(16);
            let status;
            if (guardians.length > 1) {
              const res = await axios.post(
                `${App.stackup.backendUrl}/v1/auth/recover/request-guardian-approval`,
                {
                  channelId,
                  username: user.username,
                  guardians: guardians.filter((g) => g !== App.web3.paymaster),
                  userOperations,
                },
              );
              status = res.data.status;
            }

            set({ loading: false, encryptedSigner, userOperations, status, channelId });
          } catch (error) {
            set({ loading: false });
            throw error;
          }
        },

        lookup: async (data) => {
          set({ loading: true });

          try {
            const res = await axios.post(`${App.stackup.backendUrl}/v1/auth/recover/lookup`, data);

            const { user } = res.data;
            const isDeployed =
              (user.wallet?.walletAddress &&
                (await wallet.proxy.isCodeDeployed(provider, user.wallet.walletAddress))) ||
              false;
            const guardians = isDeployed
              ? await wallet.access.getGuardians(walletContract(user.wallet.walletAddress))
              : user.wallet?.initGuardians ?? [];

            const account = { user, guardians };
            set({ loading: false, ...account });
            return account;
          } catch (error) {
            set({ loading: false });
            throw error;
          }
        },

        sendVerificationEmail: async () => {
          if (!get().user) return;
          set({ loading: true });

          try {
            await axios.post(`${App.stackup.backendUrl}/v1/auth/recover/send-verification-email`, {
              username: get().user.username,
            });

            set({ loading: false });
          } catch (error) {
            set({ loading: false });
            throw error;
          }
        },

        verifyEmail: async (code) => {
          if (!get().user || !get().userOperations) return;
          set({ loading: true });

          try {
            const res = await axios.post(`${App.stackup.backendUrl}/v1/auth/recover/verify-email`, {
              username: get().user.username,
              code,
              userOperations: get().userOperations,
            });

            set({ loading: false, userOperations: res.data.userOperations });
          } catch (error) {
            set({ loading: false });
            throw error;
          }
        },

        confirm: async (password) => {
          const { user, encryptedSigner, userOperations, channelId } = get();
          if (!user || !encryptedSigner || !userOperations || !channelId) return;
          set({ loading: true });

          try {
            const signer = wallet.proxy.decryptSigner({ encryptedSigner }, password);
            if (!signer) {
              throw new Error('Incorrect password');
            }

            await axios.post(`${App.stackup.backendUrl}/v1/auth/recover/confirm`, {
              channelId,
              username: user.username,
              signature: await signer.signMessage(loginMessage),
              encryptedSigner,
              userOperations,
            });
          } catch (error) {
            set({ loading: false });
            throw error;
          }
        },

        onComplete: async () => set({ loading: false }),

        selectGuardianRequest: (savedGuardianRequest) => set({ savedGuardianRequest }),

        approveGuardianRequest: async (userWallet, password, options) => {
          const { savedGuardianRequest } = get();
          if (!savedGuardianRequest) return;

          const signer = wallet.proxy.decryptSigner(userWallet, password);
          if (!signer) {
            throw new Error('Incorrect password');
          }
          set({ loading: true });

          try {
            const userOperations = await Promise.all(
              savedGuardianRequest.data.userOperations.map((op) =>
                wallet.userOperations.signAsGuardian(signer, userWallet.walletAddress, op),
              ),
            );

            await axios.post(
              `${App.stackup.backendUrl}/v1/auth/recover/send-guardian-approval`,
              {
                channelId: savedGuardianRequest.data.channelId,
                userOperations,
              },
              {
                headers: { Authorization: `Bearer ${options.accessToken}` },
              },
            );

            set({ loading: false });
          } catch (error) {
            set({ loading: false });
            throw error;
          }
        },

        clear: () => set({ ...defaultState }),
      }),
      {
        name: 'stackup-recover-store',
        partialize: (state) => {
          const { loading, ...persisted } = state;
          return persisted;
        },
      },
    ),
  ),
);
