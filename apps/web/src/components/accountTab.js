import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  Button,
  Divider,
  useBreakpointValue,
  Stat,
  StatLabel,
  StatNumber,
  IconButton,
  HStack,
  Spacer,
  Skeleton,
} from '@chakra-ui/react';
import { Routes, App } from '../config';
import { ChevronRightIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { displayUSDC } from '../utils/web3';

export const AccountTab = ({
  isEnabled,
  isAccountLoading,
  isWalletLoading,
  onLogout,
  walletBalance,
  walletAddress,
}) => {
  const buttonSize = useBreakpointValue({ base: 'md', sm: 'lg' });
  const [exlorerLink, setExlorerLink] = useState(App.web3.explorer);

  useEffect(() => {
    if (walletAddress) {
      setExlorerLink(`${App.web3.explorer}/address/${walletAddress}`);
    }
  }, [walletAddress]);

  return (
    <Tabs id="home-tabs" isFitted w="100%" variant="soft-rounded" colorScheme="blue" align="center">
      <TabList borderWidth="1px" borderRadius="lg" p="8px" bg="gray.50">
        <Tab borderRadius="lg">Profile</Tab>
        <Tab borderRadius="lg">Wallet</Tab>
      </TabList>

      <TabPanels>
        <TabPanel px="0px">
          <VStack spacing="16px" borderWidth="1px" borderRadius="lg" p="16px" w="100%">
            <NextLink href={Routes.UPDATE_PASSWORD} passHref>
              <Button
                isFullWidth
                isLoading={isAccountLoading}
                as="a"
                mt="16px"
                variant="outline"
                size={buttonSize}
                rightIcon={<ChevronRightIcon />}
              >
                Password
              </Button>
            </NextLink>

            <NextLink href={Routes.UPDATE_EDIT_GUARDIANS} passHref>
              <Button
                isFullWidth
                isLoading={isAccountLoading}
                as="a"
                mt="16px"
                variant="outline"
                size={buttonSize}
                rightIcon={<ChevronRightIcon />}
              >
                Guardians
              </Button>
            </NextLink>

            <Divider />

            <Button
              isFullWidth
              isDisabled={!isEnabled}
              isLoading={isAccountLoading}
              variant="outline"
              size={buttonSize}
              colorScheme="red"
              onClick={onLogout}
            >
              Logout
            </Button>
          </VStack>
        </TabPanel>
        <TabPanel px="0px">
          <Stat borderWidth="1px" borderRadius="lg" bg="white" w="100%" p="16px" textAlign="left">
            <HStack>
              <StatLabel>Total balance</StatLabel>
              <Spacer />
              <IconButton
                as="a"
                href={exlorerLink}
                target="_blank"
                size="xs"
                icon={<ExternalLinkIcon />}
              />
            </HStack>
            <Skeleton isLoaded={!isWalletLoading} mt={isWalletLoading && '8px'}>
              <StatNumber>{displayUSDC(walletBalance)}</StatNumber>
            </Skeleton>
          </Stat>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};
