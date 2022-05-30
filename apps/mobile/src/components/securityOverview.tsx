import * as React from 'react';
import {Box, VStack, Text} from 'native-base';
import {AppColors, SecurityLevels} from '../config';

type Props = {
  level: SecurityLevels;
};

export const SecurityOverview = ({level}: Props) => {
  const levelColor =
    level === 'Insufficient'
      ? AppColors.singletons.warning
      : level === 'Ok'
      ? AppColors.singletons.medium
      : AppColors.singletons.good;

  const levelDescription =
    level === 'Insufficient'
      ? 'Add more layers of security to make your assets on Stackup even safer.'
      : level === 'Ok'
      ? 'Add more layers of security to make your assets on Stackup even safer.'
      : 'Add more layers of security to make your assets on Stackup even safer.';

  return (
    <>
      <VStack justifyContent="center" alignItems="center">
        <Text fontWeight={600} fontSize="25px" textAlign="center">
          Your security level is
        </Text>

        <Text
          fontWeight={600}
          fontSize="25px"
          color={levelColor}
          textAlign="center">
          {level}
        </Text>
      </VStack>

      <Box mt="19px" justifyContent="center" alignItems="center">
        <Text fontSize="16px" color="text.3" textAlign="center">
          {levelDescription}
        </Text>
      </Box>
    </>
  );
};
