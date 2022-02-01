import { useState, useRef } from 'react';
import {
  HStack,
  VStack,
  IconButton,
  Text,
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
import { UnlockIcon, CloseIcon, AddIcon } from '@chakra-ui/icons';
import { BsLightningChargeFill } from 'react-icons/bs';
import { QRCodeScanner } from '.';

export const Apps = ({
  isLoading,
  items = [],
  onItemClick = () => {},
  onDeleteItem = () => {},
}) => {
  const [wcModal, setWcModal] = useState(false);
  const initialRef = useRef();

  const onItemHandler = (item) => (_ev) => {
    onItemClick(item);
  };

  const onDeleteHandler = (item) => (ev) => {
    ev.stopPropagation();
    onDeleteItem(item);
  };

  const renderItems = () => {
    return items.map((item, i) => (
      <MenuItem
        as="div"
        key={`notifications-menu-item-${i}`}
        minH="48px"
        maxW={['xs', 'sm']}
        onClick={onItemHandler(item)}
        icon={<IconButton size="xs" icon={<CloseIcon onClick={onDeleteHandler(item)} />} />}
      >
        <HStack>
          <Text fontWeight={500}>{item.preview}</Text>

          <Spacer />

          <UnlockIcon />
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

  const onWalletConnectScanSuccess = (decodedText, decodedResult) => {
    console.log(decodedText);
    console.log(decodedResult);
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

          <MenuItem icon={<AddIcon />} onClick={onWalletConnectOpen}>
            WalletConnect
          </MenuItem>
        </MenuList>
      </Menu>

      <Modal isL initialFocusRef={initialRef} isOpen={wcModal} onClose={onWalletConnectClose}>
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
                  <QRCodeScanner onSuccess={onWalletConnectScanSuccess} />
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

                    <Input ref={initialRef} placeholder="Paste code here!" />
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>

          <ModalFooter>
            <HStack spacing="8px">
              <Button colorScheme="blue">Connect</Button>
              <Button onClick={onWalletConnectClose}>Cancel</Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
