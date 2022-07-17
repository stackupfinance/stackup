import React, {useEffect, useState} from 'react';
import {Alert, Linking, StyleSheet} from 'react-native';
import {Box, VStack, Text, useToast, HStack, Center, Image} from 'native-base';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import {useScanBarcodes, BarcodeFormat} from 'vision-camera-code-scanner';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faArrowRight} from '@fortawesome/free-solid-svg-icons/faArrowRight';
import {BaseSheet} from '.';
import {WalletConnectLogo} from '..';
import {useHasChanged} from '../../hooks';
import {AppColors, Networks, NetworksConfig} from '../../config';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  network: Networks;
  onQRCodeDetected: (value: string) => void;
};

export const QRCodeSheet = ({
  isOpen,
  onClose,
  network,
  onQRCodeDetected,
}: Props) => {
  const toast = useToast();
  const [isActive, setIsActive] = useState(false);
  const devices = useCameraDevices();
  const device = devices.back;

  const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE], {
    checkInverted: true,
  });
  const codeHasChanged = useHasChanged(barcodes[0]?.displayValue);

  const startCamera = async () => {
    const cameraPermission = await Camera.getCameraPermissionStatus();
    switch (cameraPermission) {
      case 'not-determined':
        await Camera.requestCameraPermission();
        setTimeout(startCamera);
        return;

      case 'denied':
        Alert.alert(
          'Camera permissions not allowed...',
          'But we can fix this from your settings!',
          [
            {text: 'Cancel'},
            {text: 'Take me there', onPress: () => Linking.openSettings()},
          ],
        );
        return;

      case 'restricted':
        toast.show({
          title: 'Camera access restricted',
          backgroundColor: AppColors.palettes.primary[600],
          placement: 'top',
        });
        return;

      default:
        setIsActive(true);
        return;
    }
  };

  useEffect(() => {
    if (!codeHasChanged || !barcodes[0]?.displayValue) {
      return;
    }
    onQRCodeDetected(barcodes[0].displayValue);
  }, [codeHasChanged, barcodes]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      setIsActive(false);
    }
  }, [isOpen]);

  return (
    <BaseSheet title="Scan QR code" isOpen={isOpen} onClose={onClose}>
      <Box
        backgroundColor="background.1"
        flex={1}
        borderBottomRadius="16px"
        overflow="hidden">
        {device && (
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={isActive}
            frameProcessor={frameProcessor}
            frameProcessorFps={5}
          />
        )}
      </Box>

      <VStack space="35px" my="39px" px="34px">
        <HStack space="12px" alignItems="center">
          <Center
            rounded="full"
            w="40px"
            h="40px"
            backgroundColor={NetworksConfig[network].color}>
            <FontAwesomeIcon icon={faArrowRight} color="white" size={20} />
          </Center>

          <VStack>
            <Text fontWeight={500} fontSize="16px">
              Send to address
            </Text>
            <Text color="text.3">
              on{' '}
              <Text color={NetworksConfig[network].color}>
                {`< ${NetworksConfig[network].name} >`}
              </Text>
            </Text>
          </VStack>
        </HStack>

        <HStack space="12px" alignItems="center">
          <Image
            rounded="full"
            source={WalletConnectLogo}
            w="40px"
            h="40px"
            alt="walletconnect-logo"
          />

          <VStack>
            <Text fontWeight={500} fontSize="16px">
              Connect to app
            </Text>
            <Text color="text.3">via WalletConnect</Text>
          </VStack>
        </HStack>
      </VStack>
    </BaseSheet>
  );
};
