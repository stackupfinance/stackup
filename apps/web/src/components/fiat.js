import { Button, Link } from '@chakra-ui/react';
import { MdOutlinePayment } from 'react-icons/md';
import { Routes } from '../config';

export const Fiat = ({ isEnabled }) => {
  return (
    <Button
      as={Link}
      _hover={{ textDecoration: 'none' }}
      isFullWidth
      isExternal
      href={Routes.FIAT_DEPOSIT}
      isDisabled={!isEnabled}
      size="sm"
      shadow="base"
      leftIcon={<MdOutlinePayment />}
    >
      Deposit funds
    </Button>
  );
};
