import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import axios from 'axios';
import { wallet, constants } from '@stackupfinance/contracts';
import {
  provider,
  walletContract,
  usdcContract,
  defaultPaymasterApproval,
  defaultPaymasterReapproval,
} from '../../src/utils/web3';
import { App } from '../config';

export const recoverUseAuthSelector = (state) => ({
  clear: state.clear,
});

export const recoverHomePageSelector = (state) => ({
  clear: state.clear,
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
  userOps: state.userOps,
  guardians: state.guardians,
  sendVerificationEmail: state.sendVerificationEmail,
  verifyEmail: state.verifyEmail,
});

export const recoverRecoverConfirmPageSelector = (state) => ({
  loading: state.loading,
});

const defaultState = {
  loading: false,
  user: undefined,
  encryptedSigner: undefined,
  userOps: undefined,
  guardians: undefined,
};

export const useRecoverStore = create(
  devtools(
    persist(
      (set, get) => ({
        ...defaultState,

        createSignerAndUserOps: async (password) => {
          const user = get().user;
          if (!user) return;
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
            const userOps = [
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
            ].filter(Boolean);

            set({ loading: false, encryptedSigner, userOps });
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
          if (!get().user || !get().newOwner) return;
          set({ loading: true });

          try {
            const res = await axios.post(`${App.stackup.backendUrl}/v1/auth/recover/verify-email`, {
              username: get().user.username,
              code,
              newOwner: get().newOwner,
            });

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
