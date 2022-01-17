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
  Heading,
} from '@chakra-ui/react';
import { Routes, App } from '../config';
import { CopyIcon, ChevronRightIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { displayUSDC } from '../utils/web3';

export const AccountTab = ({
  isEnabled,
  isAccountLoading,
  isWalletLoading,
  onLogout,
  walletBalance,
  walletAddress,
  username,
}) => {
  const buttonSize = useBreakpointValue({ base: 'md', sm: 'lg' });
  const [explorerLink, setExplorerLink] = useState(App.web3.explorer);

  useEffect(() => {
    if (walletAddress) {
      setExplorerLink(`${App.web3.explorer}/address/${walletAddress}`);
    }
  }, [walletAddress]);

  return (
    <Tabs id="home-tabs" isFitted w="100%" variant="soft-rounded" colorScheme="blue" align="center">
      <TabList borderWidth="1px" borderRadius="lg" p="8px" bg="gray.50">
        <Tab borderRadius="lg">Wallet</Tab>
        <Tab borderRadius="lg">Account</Tab>
      </TabList>

      <TabPanels>
        <TabPanel px="0px">
          <Heading
            borderWidth="1px"
            borderBottomWidth="0px"
            borderTopRadius="lg"
            bg="blue.50"
            textAlign="left"
            p="16px"
            size="md"
          >
            gm, {username} ☀️
          </Heading>
          <Stat
            borderWidth="1px"
            borderTopWidth="0px"
            borderBottomRadius="lg"
            bg="white"
            w="100%"
            p="16px"
            textAlign="left"
          >
            <HStack>
              <StatLabel fontSize="md">Total balance</StatLabel>
              <Spacer />
              <IconButton size="xs" icon={<CopyIcon />} />
              1
              <IconButton
                as="a"
                href={explorerLink}
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
      </TabPanels>
    </Tabs>
  );
};
