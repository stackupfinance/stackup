import React from 'react';
import {Box, HStack, Heading} from 'native-base';
import {faArrowLeft} from '@fortawesome/free-solid-svg-icons/faArrowLeft';
import {faXmark} from '@fortawesome/free-solid-svg-icons/faXmark';
import {IconButton} from '..';

type Props = {
  title: string;
  onBack?: () => void;
  onClose: () => void;
};

export const SheetHandle = ({title, onBack, onClose}: Props) => {
  return (
    <HStack
      zIndex={999}
      backgroundColor="background.3"
      borderTopRadius="15px"
      pt="24px"
      pb="15px"
      px="18px"
      justifyContent="space-between"
      alignItems="center">
      {onBack ? <IconButton icon={faArrowLeft} onPress={onBack} /> : <Box />}

      <Heading fontSize="16px" fontFamily="heading">
        {title}
      </Heading>

      <IconButton icon={faXmark} onPress={onClose} />
    </HStack>
  );
};
