import { useState, useRef } from 'react';
import {
  HStack,
  VStack,
  IconButton,
  Text,
  Image,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Skeleton,
  Spacer,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { BsLightningChargeFill } from 'react-icons/bs';
import { QRCodeScanner } from '.';

export const Apps = ({
  isLoading,
  sessions = {},
  onAppConnect = () => {},
  onAppDisconnect = () => {},
}) => {
  const [wcModal, setWcModal] = useState(false);
  const [wcUri, setWcUri] = useState('');
  const initialRef = useRef();
  const items = Object.entries(sessions);

  const onDeleteHandler = (sessionId) => (ev) => {
    ev.stopPropagation();
    onAppDisconnect(sessionId);
  };

  const renderItems = () => {
    return items.map(([key, value]) => (
      <MenuItem as="div" key={`apps-menu-item-${key}`} minH="48px" maxW={['xs', 'sm']}>
        <HStack w="100%">
          <Image
            boxSize="24px"
            borderRadius="md"
            src={value.peerMeta.icons[value.peerMeta.icons.length - 1]}
            alt="app logo"
          />

          <Text fontWeight={500} textOverflow="ellipsis" noOfLines={1}>
            {value.peerMeta.name}
          </Text>

          <Spacer />

          <IconButton
            isDisabled={isLoading}
            size="xs"
            icon={<CloseIcon />}
            onClick={onDeleteHandler(key)}
          />
        </HStack>
      </MenuItem>
    ));
  };

  const renderEmpty = () => {
    return (
      <Skeleton isLoaded={!isLoading}>
        <MenuItem minH="48px">
          <Text>{`No apps connected yet!`}</Text>
          <Text ml="8px">⚡️</Text>
        </MenuItem>
      </Skeleton>
    );
  };

  const onWalletConnectOpen = () => {
    setWcModal(true);
  };

  const onWalletConnectClose = () => {
    setWcModal(false);
  };

  const walletConnectScanHandler = (uri) => {
    onWalletConnectClose();
    onAppConnect(uri);
  };

  const walletConnectButtonHandler = () => {
    onWalletConnectClose();
    onAppConnect(wcUri);
  };

  return (
    <>
      <Menu id="apps-menu" isLazy autoSelect={false} closeOnSelect={false}>
        <MenuButton
          as={IconButton}
          isLoading={isLoading}
          icon={
            <>
              <Icon as={BsLightningChargeFill} />
              {items.length ? (
                <Badge
                  colorScheme="blue"
                  borderRadius="lg"
                  position="absolute"
                  bottom="-2px"
                  right="-2px"
                >
                  {items.length}
                </Badge>
              ) : undefined}
            </>
          }
        />

        <MenuList>
          {!items.length ? renderEmpty() : renderItems()}

          <MenuDivider />

          <MenuItem onClick={onWalletConnectOpen}>
            <Image
              boxSize="24px"
              borderRadius="md"
              src="/walletconnect-square-blue.svg"
              alt="WalletConnect logo"
              mr="4px"
            />
            <Text as="span" fontWeight={500}>
              Get connected
            </Text>
          </MenuItem>
        </MenuList>
      </Menu>

      <Modal initialFocusRef={initialRef} isOpen={wcModal} onClose={onWalletConnectClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Connect to an app 🔌</ModalHeader>

          <ModalCloseButton />

          <ModalBody>
            <Tabs
              id="wallet-connect-tabs"
              isFitted
              w="100%"
              variant="soft-rounded"
              colorScheme="blue"
              align="center"
            >
              <TabList borderWidth="1px" borderRadius="lg" p="4px" bg="gray.50">
                <Tab borderRadius="lg" fontSize="xs">
                  Scan QR code
                </Tab>
                <Tab borderRadius="lg" fontSize="xs">
                  Paste from clipboard
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel px="0px">
                  <QRCodeScanner onSuccess={walletConnectScanHandler} />
                </TabPanel>
                <TabPanel px="0px">
                  <VStack spacing="16px">
                    <Text align="left">
                      Click on{' '}
                      <Text as="span" fontWeight="bold">
                        {`"copy to clipboard"`}
                      </Text>{' '}
                      underneath the WalletConnect QR code and paste it below.
                    </Text>

                    <Input
                      ref={initialRef}
                      placeholder="Paste code here!"
                      onChange={(ev) => setWcUri(ev.target.value)}
                    />
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>

          <ModalFooter>
            <HStack spacing="8px">
              <Button isDisabled={!wcUri} colorScheme="blue" onClick={walletConnectButtonHandler}>
                Connect
              </Button>
              <Button onClick={onWalletConnectClose}>Cancel</Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
