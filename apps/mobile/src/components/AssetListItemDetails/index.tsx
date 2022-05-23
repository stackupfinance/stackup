import React from 'react';
import {
  Text,
  HStack,
  VStack,
  Spacer
} from "native-base";

type AssetListItemDetailsProps = {
  data: any;
}

const AssetListItemDetails = (props: AssetListItemDetailsProps) => {
  const { data } = props;
  const changeValueIndicator = (data.valueChange > 0) ? '+' : '-';
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
          <Text color="#1ED759">
            {data.percentChange}%
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