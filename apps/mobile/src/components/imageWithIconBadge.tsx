import React from 'react';
import {ImageSourcePropType} from 'react-native';
import {Box, Image} from 'native-base';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {IconDefinition} from '@fortawesome/fontawesome-common-types';

type Props = {
  source: ImageSourcePropType;
  icon: IconDefinition;
};

export const ImageWithIconBadge = ({source, icon}: Props) => {
  return (
    <Box h="75px">
      <Image source={source} w="68px" h="68px" alt="image-with-icon-badge" />

      <Box
        position="absolute"
        top="43px"
        left="43px"
        backgroundColor="primary.600"
        borderRadius="50"
        w="32px"
        h="32px"
        justifyContent="center"
        alignItems="center">
        <FontAwesomeIcon icon={icon} color="white" size={16} />
      </Box>
    </Box>
  );
};
