import React from 'react';
import {Box, Pressable} from 'native-base';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faBars} from '@fortawesome/free-solid-svg-icons/faBars';
import {AppColors} from '../config';

type Props = {
  onPress: () => void;
};

export const SettingsButton = ({onPress}: Props) => {
  return (
    <Pressable onPress={onPress}>
      {({isPressed}) => (
        <Box justifyContent="center" alignItems="center">
          <FontAwesomeIcon
            icon={faBars}
            color={isPressed ? 'white' : AppColors.text[4]}
            size={22}
          />
        </Box>
      )}
    </Pressable>
  );
};
