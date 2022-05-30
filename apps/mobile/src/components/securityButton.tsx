import React from 'react';
import {Box, Pressable} from 'native-base';
import hexToRgba from 'hex-to-rgba';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faShieldHalved} from '@fortawesome/free-solid-svg-icons/faShieldHalved';
import {AppColors} from '../config';

type Props = {
  onPress: () => void;
};

export const SecurityButton = ({onPress}: Props) => {
  return (
    <Pressable onPress={onPress} w="22px" h="22px">
      {({isPressed}) => (
        <Box
          w="26px"
          h="26px"
          backgroundColor={
            isPressed
              ? hexToRgba(AppColors.singletons.warning, 0.8)
              : hexToRgba(AppColors.singletons.warning, 0.4)
          }
          borderWidth="1px"
          borderColor={AppColors.singletons.warning}
          borderRadius="5px"
          justifyContent="center"
          alignItems="center">
          <FontAwesomeIcon
            icon={faShieldHalved}
            color={AppColors.singletons.warning}
            size={15}
          />
        </Box>
      )}
    </Pressable>
  );
};
