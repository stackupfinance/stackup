import React, {PropsWithChildren, ReactElement} from 'react';
import {Box, SectionList, Text} from 'native-base';

type Sections = {
  title: string;
  data: Array<ReactElement>;
};

type Props = {
  sections: Array<Sections>;
};

export const List = ({sections}: PropsWithChildren<Props>) => {
  return (
    <SectionList
      w="100%"
      sections={sections}
      SectionSeparatorComponent={({leadingItem}) =>
        leadingItem ? <Box mt="21px" /> : null
      }
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
