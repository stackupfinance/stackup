import React from 'react';
import {ImageSourcePropType} from 'react-native';
import {Box, VStack, HStack, Switch, Text} from 'native-base';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faArrowRight} from '@fortawesome/free-solid-svg-icons/faArrowRight';
import {BaseItem} from '.';
import {AppColors} from '../config';

type Props = {
  heading: string;
  description: string;
  onSwitchValueChange: any;
  switchValue: boolean;
  isActive: boolean;
  showArrow: boolean;
  source: ImageSourcePropType;
};

export const OnboardingItem = ({
  heading,
  description,
  onSwitchValueChange,
  showArrow,
  source,
  switchValue,
}: Props) => {
  return (
    <BaseItem
      alt="menuItem"
      source={source}
      backgroundColor={AppColors.background[3]}>
      <HStack>
        <VStack width="50%">
          <HStack justifyContent="space-between" alignItems="center">
            <Text fontWeight={500} fontSize="16px" color="white">
              {heading}
            </Text>
          </HStack>

          <HStack justifyContent="space-between" alignItems="center">
            <Text fontWeight={300} fontSize="14px" color="text.3">
              {description}
            </Text>

            {showArrow ? (
              <FontAwesomeIcon
                icon={faArrowRight}
                color={AppColors.text[1]}
                size={15}
              />
            ) : undefined}
          </HStack>
        </VStack>
        <Box width="50%">
          <Switch
            size="lg"
            colorScheme="primary"
            onValueChange={onSwitchValueChange}
            value={switchValue}
          />
        </Box>
      </HStack>
    </BaseItem>
  );
};
