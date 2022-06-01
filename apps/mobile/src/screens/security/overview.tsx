import * as React from 'react';
import {Box, VStack, Heading} from 'native-base';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {faArrowLeft} from '@fortawesome/free-solid-svg-icons/faArrowLeft';
import {
  StackScreenHeader,
  IconButton,
  SecurityOverview,
  SecurityItem,
  ShieldWithCheckLogo,
  FingerprintLogo,
  EmailLogo,
  // LockLogo,
  List,
} from '../../components';
import {SecurityStackParamList} from '../../config';
import {useNavigationStoreSecurityOverviewSelector} from '../../state';

type Props = NativeStackScreenProps<SecurityStackParamList, 'Overview'>;

export default function OverviewScreen({navigation}: Props) {
  const {setShowPasswordSheet, setshowEmailSheet} =
    useNavigationStoreSecurityOverviewSelector();

  const onBackPress = () => {
    navigation.goBack();
  };

  const onPasswordPress = () => {
    setShowPasswordSheet(true);
  };

  const onEmailPress = () => {
    setshowEmailSheet(true);
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

      <VStack flex={1} py="25px" px="18px" space="19px">
        <SecurityOverview level="Insufficient" />

        <List
          sections={[
            {
              title: 'Account security',
              data: [
                <SecurityItem
                  heading="Password"
                  description="Old fashion yet effective security"
                  source={ShieldWithCheckLogo}
                  isActive={true}
                  onPress={onPasswordPress}
                />,
                <SecurityItem
                  heading="Fingerprint"
                  description="Use your finger to get in"
                  source={FingerprintLogo}
                  isActive={true}
                  onPress={() => {}}
                />,
              ],
            },
            {
              title: 'Backup your account',
              data: [
                <SecurityItem
                  heading="Email"
                  description="Link your account to your email"
                  source={EmailLogo}
                  isActive={false}
                  onPress={onEmailPress}
                />,
                // <SecurityItem
                //   heading="Authenticator"
                //   description="6 digit authenticator code"
                //   source={LockLogo}
                //   isActive={false}
                //   onPress={() => {}}
                // />,
              ],
            },
          ]}
        />
      </VStack>
    </>
  );
}
