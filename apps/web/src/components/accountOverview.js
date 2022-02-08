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
  useToast,
  Box,
} from '@chakra-ui/react';
import { Routes, App } from '../config';
import { CopyIcon, ChevronRightIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { MdOutlineMoreHoriz } from 'react-icons/md';
import { displayUSDC } from '../utils/web3';

export const AccountOverview = ({
  isEnabled,
  isAccountLoading,
  isWalletLoading,
  onLogout,
  walletBalance,
  walletAddress,
  username,
  transactionsContent,
}) => {
  const toast = useToast();
  const buttonSize = useBreakpointValue({ base: 'md', sm: 'lg' });
  const [explorerLink, setExplorerLink] = useState(App.web3.explorer);

  useEffect(() => {
    if (walletAddress) {
      setExplorerLink(`${App.web3.explorer}/address/${walletAddress}`);
    }
  }, [walletAddress]);

  const onCopy = async () => {
    await navigator.clipboard.writeText(walletAddress);
    toast({
      title: 'Wallet address copied.',
      status: 'success',
      position: 'top-right',
      duration: 5000,
      isClosable: true,
    });
  };

  const onMore = async () => {
    toast({
      title: 'Wallet breakdown coming soon.',
      status: 'info',
      position: 'top-right',
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <Tabs id="home-tabs" isFitted w="100%" variant="soft-rounded" colorScheme="blue" align="center">
      <TabList borderWidth="1px" borderRadius="lg" p="4px" bg="gray.50">
        <Tab borderRadius="lg" fontSize="sm">
          Wallet
        </Tab>

        <Tab borderRadius="lg" fontSize="sm">
          Preferences
        </Tab>
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
            <Skeleton
              width={isAccountLoading && '144px'}
              isLoaded={!isAccountLoading}
              borderRadius="lg"
              startColor="blue.500"
              endColor="blue.50"
            >
              Gm, {username} ☀️
            </Skeleton>
          </Heading>
          <Stat
            mb="16px"
            borderWidth="1px"
            borderTopWidth="0px"
            borderBottomRadius="lg"
            bg="white"
            w="100%"
            p="16px"
            textAlign="left"
          >
            <HStack mb="8px">
              <StatLabel fontSize="md">Available</StatLabel>

              <Spacer />

              <IconButton size="xs" icon={<CopyIcon />} onClick={onCopy} />
              <IconButton
                as="a"
                href={explorerLink}
                target="_blank"
                size="xs"
                icon={<ExternalLinkIcon />}
              />
              <IconButton size="xs" icon={<MdOutlineMoreHoriz />} onClick={onMore} />
            </HStack>
            <Skeleton isLoaded={!isWalletLoading} borderRadius="lg">
              <StatNumber>{displayUSDC(walletBalance)}</StatNumber>
            </Skeleton>
          </Stat>

          <Heading
            borderWidth="1px"
            borderBottomWidth="0px"
            borderTopRadius="lg"
            bg="blue.50"
            textAlign="left"
            p="16px"
            size="md"
          >
            Transactions
          </Heading>
          <Box borderWidth="1px" borderTopWidth="0px" borderBottomRadius="lg" bg="white" w="100%">
            {transactionsContent}
          </Box>
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
