import React from 'react';
import {
  Text,
  HStack,
  VStack,
  Spacer,
  useTheme
} from "native-base";
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faArrowTrendUp} from '@fortawesome/free-solid-svg-icons/faArrowTrendUp';
import {faArrowTrendDown} from '@fortawesome/free-solid-svg-icons/faArrowTrendDown';

type AssetListItemDetailsProps = {
  data: any;
}

const AssetListItemDetails = (props: AssetListItemDetailsProps) => {
  const { data } = props;
  const changeValueIndicator = (data.valueChange > 0) ? '+' : '-';
  const { colors } = useTheme();
  /* @ts-ignore */
  const gainColor = colors.text[6];
  const lossColor = colors.tertiary[600];
  const changePercentColor = (data.valueChange >= 0) ? gainColor : lossColor;
  const trendIcon = (data.valueChange > 0) ? 
    <FontAwesomeIcon icon={faArrowTrendUp} style={{ color: gainColor }} size={10} /> :
    <FontAwesomeIcon icon={faArrowTrendDown} style={{ color: lossColor }} size={10} />
  return (
    <>
      <VStack>
        <Text color="text.1" bold>
          {data.name}
        </Text>
        <Text color="text.3">
          {data.value}
        </Text>
      </VStack>
      <Spacer />
      <VStack>
        <Text color="text.1">
          {data.valueUSDC}
        </Text>
        <HStack>
          <Text color={changePercentColor}>
            {data.percentChange}%{` `}{trendIcon}
          </Text>
          <Text>
            {changeValueIndicator}{data.valueChange}{' '}
          </Text>
         </HStack>
      </VStack>
    </>
  );
};

export default AssetListItemDetails;