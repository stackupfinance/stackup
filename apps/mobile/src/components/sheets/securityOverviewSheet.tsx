import React from 'react';
import {VStack, Text} from 'native-base';
import {BaseSheet} from '.';
import {
  // SecurityOverview,
  SecurityItem,
  SecuritySwitch,
  ShieldWithCheckLogo,
  FingerprintLogo,
} from '..';

type Props = {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onBack: () => void;
  onPasswordPress: () => void;
  onFingerprintChange: (value: boolean) => void;
  isFingerprintSupported: boolean;
  isFingerprintEnabled: boolean;
};

export const SecurityOverviewSheet = ({
  isOpen,
  isLoading,
  onClose,
  onBack,
  onPasswordPress,
  onFingerprintChange,
  isFingerprintSupported,
  isFingerprintEnabled,
}: Props) => {
  return (
    <BaseSheet
      title="Security"
      isOpen={isOpen}
      onClose={onClose}
      onBack={onBack}>
      <VStack flex={1} py="25px" px="18px" space="8px">
        {/* <SecurityOverview level="Insufficient" /> */}

        <Text fontWeight={600} fontSize="18px" color="text.5">
          Account security
        </Text>

        <SecurityItem
          heading="Password"
          description="Old fashion yet effective security"
          source={ShieldWithCheckLogo}
          onPress={onPasswordPress}
        />

        {isFingerprintSupported && (
          <SecuritySwitch
            isLoading={isLoading}
            heading="Fingerprint"
            description="Use your finger to get in"
            source={FingerprintLogo}
            isActive={isFingerprintEnabled}
            onValueChange={onFingerprintChange}
          />
        )}
      </VStack>
    </BaseSheet>
  );
};
