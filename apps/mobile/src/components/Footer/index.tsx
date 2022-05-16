import React from 'react';
import {
  Box,
  Center,
  Text,
  HStack,
  Pressable,
} from "native-base";

const Footer = () => {
  const [selected, setSelected] = React.useState(1);
  return (
    // <Box flex={1} bg="white" safeAreaTop width="100%" maxW="300px" alignSelf="center">
      <Box bg="white" safeAreaTop width="100%" maxW="300px" alignSelf="center">
        <Center flex={1}></Center>
        <HStack bg="indigo.600" alignItems="center" safeAreaBottom shadow={6}>
          <Pressable opacity={selected === 0 ? 1 : 0.5} py="3" flex={1} onPress={() => setSelected(0)}>
            <Center>
              <Text color="white" fontSize="12">
                Assets
              </Text>
            </Center>
          </Pressable>
          <Pressable opacity={selected === 1 ? 1 : 0.5} py="2" flex={1} onPress={() => setSelected(1)}>
            <Center>
              <Text color="white" fontSize="12">
                Earn
              </Text>
            </Center>
          </Pressable>
          <Pressable opacity={selected === 2 ? 1 : 0.6} py="2" flex={1} onPress={() => setSelected(2)}>
            <Center>
              <Text color="white" fontSize="12">
                Swap
              </Text>
            </Center>
          </Pressable>
          <Pressable opacity={selected === 3 ? 1 : 0.5} py="2" flex={1} onPress={() => setSelected(3)}>
            <Center>
              <Text color="white" fontSize="12">
                Activity
              </Text>
            </Center>
          </Pressable>
        </HStack>
      </Box>
  );
}

export default Footer;
