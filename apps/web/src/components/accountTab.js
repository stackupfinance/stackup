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
} from '@chakra-ui/react';
import { Routes } from '../config';
import { ChevronRightIcon } from '@chakra-ui/icons';

export const AccountTab = ({ isEnabled, isLoading, onLogout }) => {
  const buttonSize = useBreakpointValue({ base: 'md', sm: 'lg' });

  return (
    <Tabs id="home-tabs" isFitted w="100%" variant="soft-rounded" colorScheme="blue" align="center">
      <TabList borderWidth="1px" borderRadius="lg" p="8px">
        <Tab borderRadius="lg">Profile</Tab>
        <Tab borderRadius="lg">Wallet</Tab>
      </TabList>

      <TabPanels>
        <TabPanel px="0px">
          <VStack spacing="16px" borderWidth="1px" borderRadius="lg" p="16px" w="100%">
            <NextLink href={Routes.EDIT_PROFILE} passHref>
              <Button
                isFullWidth
                isLoading={isLoading}
                as="a"
                mt="16px"
                variant="outline"
                size={buttonSize}
                rightIcon={<ChevronRightIcon />}
              >
                Profile
              </Button>
            </NextLink>

            <NextLink href={Routes.EDIT_PASSWORD} passHref>
              <Button
                isFullWidth
                isLoading={isLoading}
                as="a"
                mt="16px"
                variant="outline"
                size={buttonSize}
                rightIcon={<ChevronRightIcon />}
              >
                Password
              </Button>
            </NextLink>

            <NextLink href={Routes.EDIT_EMAIL} passHref>
              <Button
                isFullWidth
                isLoading={isLoading}
                as="a"
                mt="16px"
                variant="outline"
                size={buttonSize}
                rightIcon={<ChevronRightIcon />}
              >
                Email
              </Button>
            </NextLink>

            <Divider />

            <Button
              isFullWidth
              isDisabled={!isEnabled}
              isLoading={isLoading}
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
          <p>Wallet placeholder</p>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};
