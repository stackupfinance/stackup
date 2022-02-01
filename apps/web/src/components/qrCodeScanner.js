import { useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Box, Skeleton } from '@chakra-ui/react';

const qrCodeId = 'stackup-qr-code-reader';

export const QRCodeScanner = ({ onSuccess = () => {} }) => {
  useEffect(() => {
    const html5QrCode = new Html5Qrcode(qrCodeId);

    (async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (!devices.length) return;

        await html5QrCode.start(
          { facingMode: 'environment' },
          { qrbox: { width: 250, height: 250 } },
          onSuccess,
        );
      } catch (error) {
        console.error(error);
      }
    })();

    return async () => html5QrCode.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box id={qrCodeId} w="100%" minH="256px">
      <Skeleton w="100%" minH="256px" />
    </Box>
  );
};
