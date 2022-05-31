import React from 'react';
import {Box, Pressable} from 'native-base';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {IconDefinition} from '@fortawesome/fontawesome-common-types';
import {AppColors} from '../config';

type Props = {
  icon: IconDefinition;
  onPress: () => void;
};

export const IconButton = ({icon, onPress}: Props) => {
  return (
    <Pressable onPress={onPress} hitSlop={16} w="22px" h="22px">
      {({isPressed}) => (
        <Box justifyContent="center" alignItems="center">
          <FontAwesomeIcon
            icon={icon}
            color={isPressed ? 'white' : AppColors.text[4]}
            size={22}
          />
        </Box>
      )}
    </Pressable>
  );
};
