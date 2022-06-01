import React from 'react';
import {ImageSourcePropType} from 'react-native';
import {Pressable, VStack, HStack, Text} from 'native-base';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faArrowRight} from '@fortawesome/free-solid-svg-icons/faArrowRight';
import hexToRgba from 'hex-to-rgba';
import {BaseItem} from '.';
import {AppColors} from '../config';

type Props = {
  heading: string;
  description: string;
  onPress: () => void;
  isActive: boolean;
  source: ImageSourcePropType;
};

export const SecurityItem = ({
  heading,
  description,
  onPress,
  isActive,
  source,
}: Props) => {
  return (
    <Pressable onPress={onPress}>
      {({isPressed}) => (
        <BaseItem
          alt="menuItem"
          source={source}
          backgroundColor={
            isPressed
              ? hexToRgba(AppColors.background[3], 0.8)
              : AppColors.background[3]
          }>
          <VStack>
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontWeight={500} fontSize="16px" color="white">
                {heading}
              </Text>

              <Text
                fontWeight={600}
                fontSize="16px"
                color={
                  isActive
                    ? AppColors.singletons.good
                    : AppColors.singletons.warning
                }>
                {isActive ? 'Active' : 'Inactive'}
              </Text>
            </HStack>

            <HStack justifyContent="space-between" alignItems="center">
              <Text fontWeight={300} fontSize="14px" color="text.3">
                {description}
              </Text>

              <FontAwesomeIcon
                icon={faArrowRight}
                color={AppColors.text[1]}
                size={15}
              />
            </HStack>
          </VStack>
        </BaseItem>
      )}
    </Pressable>
  );
};
