import React from 'react';
import {Box} from 'native-base';
import QRCodeSVG from 'react-native-qrcode-svg';

type Props = {
  value: string;
};

export const QRCode = ({value}: Props) => {
  return (
    <Box
      w="220px"
      h="220px"
      p="10px"
      borderRadius="19px"
      backgroundColor="white"
      justifyContent="center"
      alignItems="center">
      <QRCodeSVG value={value} size={200} />
    </Box>
  );
};
