import React, {useState} from 'react';
import {useToast} from 'native-base';
import {
  RequestMasterPassword,
  SecurityOverviewSheet,
  PasswordSheet,
} from '../../components';
import {
  useNavigationStoreSecuritySheetsSelector,
  useFingerprintStoreSecuritySheetsSelector,
  useWalletStoreSecuritySheetsSelector,
} from '../../state';
import {AppColors} from '../../config';
import {logEvent} from '../../utils/analytics';

export default function SecuritySheets() {
  const toast = useToast();
  const {
    showPasswordSheet,
    showSecurityOverviewSheet,
    setShowSettingsSheet,
    setShowSecurityOverviewSheet,
    setShowPasswordSheet,
  } = useNavigationStoreSecuritySheetsSelector();
  const {
    loading: fingerprintLoading,
    isSupported: isFingerprintSupported,
    isEnabled: isFingerprintEnabled,
    getMasterPassword,
    setMasterPassword,
    resetMasterPassword,
  } = useFingerprintStoreSecuritySheetsSelector();
  const {
    loading: walletLoading,
    instance,
    getWalletSigner,
    reencryptWalletSigner,
  } = useWalletStoreSecuritySheetsSelector();
  const [showRequestMasterPassword, setShowRequestMasterPassword] =
    useState(false);

  const isLoading = fingerprintLoading || walletLoading;

  const onMasterPasswordClose = () => {
    setShowRequestMasterPassword(false);
  };

  const onSecurityOverviewClose = () => {
    logEvent('SECURITY_SETTINGS_CLOSE');
    setShowSecurityOverviewSheet(false);
  };

  const onClosePasswordSheet = () => {
    logEvent('SECURITY_SETTINGS_PASSWORD_CLOSE');
    setShowPasswordSheet(false);
  };

  const onPasswordPress = () => {
    logEvent('SECURITY_SETTINGS_PASSWORD_OPEN');
    setShowPasswordSheet(true);
  };

  const onChangePassword = async (password: string, newPassword: string) => {
    try {
      if (await reencryptWalletSigner(password, newPassword)) {
        logEvent('SECURITY_SETTINGS_PASSWORD_UPDATE');
        isFingerprintEnabled &&
          (await setMasterPassword(newPassword, instance.salt));
        setShowPasswordSheet(false);
        toast.show({
          title: 'Password updated',
          backgroundColor: AppColors.singletons.good,
          placement: 'top',
        });
      } else {
        toast.show({
          title: 'Incorrect password',
          backgroundColor: AppColors.singletons.warning,
          placement: 'top',
        });
      }
    } catch (error) {
      toast.show({
        title: 'Unexpected error. Contact us for help.',
        backgroundColor: AppColors.singletons.warning,
        placement: 'top',
      });
    }
  };

  const onFingerprintChange = async (value: boolean) => {
    if (value) {
      setShowRequestMasterPassword(true);
    } else {
      onDisableFingerprint();
    }
  };

  const onEnableFingerprint = async (masterPassword: string) => {
    setShowRequestMasterPassword(false);

    if (await getWalletSigner(masterPassword)) {
      logEvent('SECURITY_SETTINGS_TOGGLE_FINGERPRINT', {
        enableFingerprint: true,
      });
      await setMasterPassword(masterPassword, instance.salt);
    } else {
      toast.show({
        title: 'Incorrect password',
        backgroundColor: AppColors.singletons.warning,
        placement: 'top',
      });
    }
  };

  const onDisableFingerprint = async () => {
    const masterPassword = await getMasterPassword();
    if (masterPassword && (await getWalletSigner(masterPassword))) {
      logEvent('SECURITY_SETTINGS_TOGGLE_FINGERPRINT', {
        enableFingerprint: false,
      });
      await resetMasterPassword();
    }
  };

  const onSecurityOverviewBack = () => {
    logEvent('SECURITY_SETTINGS_BACK');
    setShowSettingsSheet(true);
  };

  const onPasswordSheetBack = () => {
    logEvent('SECURITY_SETTINGS_PASSWORD_BACK');
    setShowSecurityOverviewSheet(true);
  };

  return (
    <>
      <RequestMasterPassword
        isOpen={showRequestMasterPassword}
        onClose={onMasterPasswordClose}
        onConfirm={onEnableFingerprint}
      />

      <SecurityOverviewSheet
        isOpen={showSecurityOverviewSheet}
        isLoading={isLoading}
        onClose={onSecurityOverviewClose}
        onBack={onSecurityOverviewBack}
        onPasswordPress={onPasswordPress}
        onFingerprintChange={onFingerprintChange}
        isFingerprintSupported={isFingerprintSupported}
        isFingerprintEnabled={isFingerprintEnabled}
      />

      <PasswordSheet
        isOpen={showPasswordSheet}
        isLoading={isLoading}
        onClose={onClosePasswordSheet}
        onBack={onPasswordSheetBack}
        onSubmit={onChangePassword}
      />
    </>
  );
}
