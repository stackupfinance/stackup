import React, {useState} from 'react';
import {Box, Button, HStack} from 'native-base';
import type {CompositeScreenProps} from '@react-navigation/native';
import type {MaterialTopTabScreenProps} from '@react-navigation/material-top-tabs';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faSliders} from '@fortawesome/free-solid-svg-icons/faSliders';
import {faBars} from '@fortawesome/free-solid-svg-icons/faBars';
import {RootStackParamList, HomeTabParamList, AppColors} from '../../config';
import {
  TabScreenContainer,
  TabScreenHeader,
  HomeTabTitle,
  SecurityButton,
  IconButton,
  List,
  PortfolioBalance,
  PortfolioItem,
} from '../../components';
import {useNavigationStoreAssetsSelector} from '../../state';

type Props = CompositeScreenProps<
  MaterialTopTabScreenProps<HomeTabParamList, 'Assets'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function AssetsScreen({navigation}: Props) {
  const {setShowSettingsSheet, setShowTokenListSheet} =
    useNavigationStoreAssetsSelector();
  const [isHidden, setIsHidden] = useState<boolean>(false);

  const onSecurityPress = () => {
    navigation.navigate('Security');
  };

  const onSettingPress = () => {
    setShowSettingsSheet(true);
  };

  const onTokenListPress = () => {
    setShowTokenListSheet(true);
  };

  return (
    <TabScreenContainer>
      <TabScreenHeader>
        <IconButton icon={faBars} onPress={onSettingPress} />

        <HomeTabTitle screen="Assets" network="Polygon" />

        <SecurityButton onPress={onSecurityPress} />
      </TabScreenHeader>

      <Box flex={1}>
        <Box mt="20px">
          <PortfolioBalance
            previousBalance="11777844200"
            currentBalance="11883895672"
            currency="USDC"
            isHidden={isHidden}
            onToggleVisibility={() => setIsHidden(!isHidden)}
          />
        </Box>

        <HStack mt="33px" space="14px">
          <Button flex={1} mb="16px" onPress={() => {}}>
            Deposit
          </Button>

          <Button flex={1} mb="16px" onPress={() => {}}>
            Send
          </Button>
        </HStack>

        <Box mt="31px">
          <List
            items={[
              <PortfolioItem
                currency="USDC"
                defaultCurrency="USDC"
                balance="10000000000"
                previousBalanceInDefaultCurrency="10000000000"
                currentBalanceInDefaultCurrency="10000000000"
                isHidden={isHidden}
              />,
              <PortfolioItem
                currency="ETH"
                defaultCurrency="USDC"
                balance="1860000000000000000"
                previousBalanceInDefaultCurrency="1773741200"
                currentBalanceInDefaultCurrency="1880165672"
                isHidden={isHidden}
              />,
              <PortfolioItem
                currency="MATIC"
                defaultCurrency="USDC"
                balance="6240000000000000000"
                previousBalanceInDefaultCurrency="4103000"
                currentBalanceInDefaultCurrency="3730000"
                isHidden={isHidden}
              />,
            ]}
          />
        </Box>

        <Button
          colorScheme="text"
          variant="link"
          onPress={onTokenListPress}
          _text={{color: AppColors.text[4], fontWeight: 400}}
          leftIcon={
            <FontAwesomeIcon
              icon={faSliders}
              color={AppColors.text[4]}
              size={20}
            />
          }>
          Manage token list
        </Button>
      </Box>
    </TabScreenContainer>
  );
}
