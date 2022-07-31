import React from 'react';
import {ImageSourcePropType} from 'react-native';
import {Box, Image} from 'native-base';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {IconDefinition} from '@fortawesome/fontawesome-common-types';

type Props = {
  source: ImageSourcePropType;
  icon: IconDefinition;
  small?: boolean;
};

export const ImageWithIconBadge = ({source, icon, small}: Props) => {
  const imageContainerDimension = small ? '45px' : '75px';
  const imageDimension = small ? '40px' : '68px';
  const iconContainerDimension = small ? '18px' : '32px';
  const iconContainerOffset = small ? '25px' : '43px';
  const iconDimension = small ? 10 : 16;

  return (
    <Box h={imageContainerDimension}>
      <Image
        source={source}
        w={imageDimension}
        h={imageDimension}
        alt="image-with-icon-badge"
      />

      <Box
        position="absolute"
        top={iconContainerOffset}
        left={iconContainerOffset}
        backgroundColor="primary.600"
        borderRadius="50"
        w={iconContainerDimension}
        h={iconContainerDimension}
        justifyContent="center"
        alignItems="center">
        <FontAwesomeIcon icon={icon} color="white" size={iconDimension} />
      </Box>
    </Box>
  );
};
