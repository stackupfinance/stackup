import React, {PropsWithChildren, ReactElement} from 'react';
import {RefreshControl} from 'react-native';
import {Box, SectionList, Text} from 'native-base';

type Sections = {
  title: string;
  data: Array<ReactElement>;
};

type Props = {
  header?: ReactElement;
  footer?: ReactElement;
  sections: Array<Sections>;
  isRefreshing?: boolean;
  onRefresh?: () => void | Promise<void>;
};

const SectionSeparator = ({leadingItem}: any) => {
  return leadingItem ? <Box mt="18px" /> : null;
};

export const List = ({
  header,
  footer,
  sections,
  isRefreshing,
  onRefresh,
}: PropsWithChildren<Props>) => {
  return (
    <SectionList
      w="100%"
      px="18px"
      refreshControl={
        <RefreshControl
          refreshing={Boolean(isRefreshing)}
          onRefresh={onRefresh}
        />
      }
      ListHeaderComponent={header}
      ListFooterComponent={footer}
      sections={sections}
      SectionSeparatorComponent={SectionSeparator}
      renderSectionHeader={({section}) => {
        return section.title ? (
          <Text fontWeight={600} fontSize="18px" color="text.5" mb="4px">
            {section.title}
          </Text>
        ) : null;
      }}
      renderItem={({item, index}) => {
        return <Box mt={index > 0 ? '8px' : undefined}>{item}</Box>;
      }}
    />
  );
};
