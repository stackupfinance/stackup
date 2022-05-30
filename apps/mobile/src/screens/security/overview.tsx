import * as React from 'react';
import {Box, VStack, Heading} from 'native-base';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {faArrowLeft} from '@fortawesome/free-solid-svg-icons/faArrowLeft';
import {
  StackScreenHeader,
  IconButton,
  SecurityOverview,
  SecurityItem,
  FingerprintLogo,
  ShieldWithCheckLogo,
} from '../../components';
import {SecurityStackParamList} from '../../config';

type Props = NativeStackScreenProps<SecurityStackParamList, 'Overview'>;

export default function OverviewScreen({navigation}: Props) {
  const onBackPress = () => {
    navigation.goBack();
  };

  return (
    <>
      <StackScreenHeader>
        <IconButton icon={faArrowLeft} onPress={onBackPress} />

        <Heading fontSize="16px" fontFamily="heading">
          Security
        </Heading>

        <Box />
      </StackScreenHeader>

      <Box flex={1} py="25px" px="18px">
        <SecurityOverview level="Insufficient" />

        <VStack mt="29px" space="9px">
          <SecurityItem
            heading="Fingerprint"
            description="Access wallet with Touch ID"
            source={FingerprintLogo}
            isActive={true}
            showArrow={false}
            onPress={() => {}}
          />

          <SecurityItem
            heading="Cloud Backup"
            description="Encrypted storage for easy import"
            source={ShieldWithCheckLogo}
            isActive={false}
            showArrow={true}
            onPress={() => {}}
          />
        </VStack>
      </Box>
    </>
  );
}
