import React, {useState} from 'react';
import {useToast} from 'native-base';
import {RequestMasterPassword, SecurityOverviewSheet} from '../../components';
import {
  useNavigationStoreSecuritySheetsSelector,
  useFingerprintStoreSecuritySheetsSelector,
  useWalletStoreSecuritySheetsSelector,
} from '../../state';
import {AppColors} from '../../config';

export default function SecuritySheets() {
  const toast = useToast();
  const {
    showSecurityOverviewSheet,
    setShowSettingsSheet,
    setShowSecurityOverviewSheet,
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
    isPasswordValid,
  } = useWalletStoreSecuritySheetsSelector();
  const [showRequestMasterPassword, setShowRequestMasterPassword] =
    useState(false);

  const isLoading = fingerprintLoading || walletLoading;

  const onMasterPasswordClose = () => {
    setShowRequestMasterPassword(false);
  };

  const onSecurityOverviewClose = () => {
    setShowSecurityOverviewSheet(false);
  };

  const onFingerprintChange = async (value: boolean) => {
    if (value) {
      setShowRequestMasterPassword(true);
    } else {
      await onDisableFingerprint();
    }
  };

  const onEnableFingerprint = async (masterPassword: string) => {
    setShowRequestMasterPassword(false);

    if (await isPasswordValid(masterPassword)) {
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
    if (masterPassword && (await isPasswordValid(masterPassword))) {
      await resetMasterPassword();
    }
  };

  const onSecurityOverviewBack = () => {
    setShowSettingsSheet(true);
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
        onFingerprintChange={onFingerprintChange}
        isFingerprintSupported={isFingerprintSupported}
        isFingerprintEnabled={isFingerprintEnabled}
      />
    </>
  );
}
