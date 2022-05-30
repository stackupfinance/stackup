import React from 'react';
import {Box, Pressable} from 'native-base';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faXmark} from '@fortawesome/free-solid-svg-icons/faXmark';
import {AppColors} from '../config';

type Props = {
  onPress: () => void;
};

export const CloseButton = ({onPress}: Props) => {
  return (
    <Pressable onPress={onPress} w="22px" h="22px">
      {({isPressed}) => (
        <Box justifyContent="center" alignItems="center">
          <FontAwesomeIcon
            icon={faXmark}
            color={isPressed ? 'white' : AppColors.text[4]}
            size={22}
          />
        </Box>
      )}
    </Pressable>
  );
};
