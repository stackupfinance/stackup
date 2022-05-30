import React from 'react';
import {Pressable, HStack, Text} from 'native-base';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {IconDefinition} from '@fortawesome/fontawesome-common-types';
import hexToRgba from 'hex-to-rgba';
import {BaseItem} from '.';
import {AppColors} from '../config';

type Props = {
  heading: string;
  description?: string;
  onPress: () => void;
  backgroundColor?: string;
  icon: IconDefinition;
};

export const MenuItem = ({
  heading,
  description,
  onPress,
  backgroundColor = AppColors.background[3],
  icon,
}: Props) => {
  return (
    <Pressable onPress={onPress}>
      {({isPressed}) => (
        <BaseItem
          alt="menuItem"
          backgroundColor={
            isPressed ? hexToRgba(backgroundColor, 0.8) : backgroundColor
          }>
          <HStack justifyContent="space-between" alignItems="center">
            <Text fontWeight={600} fontSize="16px" color="white">
              {heading}
            </Text>

            <FontAwesomeIcon icon={icon} color={AppColors.text[1]} size={15} />
          </HStack>

          {description ? (
            <Text fontWeight={300} fontSize="14px" color="text.1">
              {description}
            </Text>
          ) : undefined}
        </BaseItem>
      )}
    </Pressable>
  );
};
