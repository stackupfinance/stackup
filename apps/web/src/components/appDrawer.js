import { useRef } from 'react';
import { useIntercom } from 'react-use-intercom';
import {
  IconButton,
  Image,
  Text,
  VStack,
  Divider,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Link,
  Button,
} from '@chakra-ui/react';
import { HamburgerIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { FaTwitter, FaDiscord } from 'react-icons/fa';

export const AppDrawer = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef();
  const { show } = useIntercom();

  const onChatHandler = () => {
    show();
  };

  return (
    <>
      <IconButton size="sm" icon={<HamburgerIcon />} ref={btnRef} onClick={onOpen} />
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <Image src="/logotype-blue-navy-32x142.png" maxH="24px" alt="stackup logo" />
          </DrawerHeader>

          <DrawerBody>
            <VStack spacing="8px">
              <Button
                as={Link}
                _hover={{ textDecoration: 'none' }}
                isFullWidth
                isExternal
                href="https://intercom.help/stackup/en/collections/3354082-getting-started"
                size="sm"
                variant="outline"
                colorScheme="blue"
                justifyContent="space-between"
              >
                <Text>📖</Text>
                <Text>Getting started</Text>
                <ChevronRightIcon />
              </Button>

              <Divider />

              <Button
                as={Link}
                _hover={{ textDecoration: 'none' }}
                isFullWidth
                isExternal
                href="https://stackup.sh"
                size="sm"
                variant="outline"
                justifyContent="space-between"
              >
                <Text>🌐</Text>
                <Text>Website</Text>
                <ChevronRightIcon />
              </Button>

              <Button
                as={Link}
                _hover={{ textDecoration: 'none' }}
                isFullWidth
                isExternal
                href="mailto:founders@stackup.sh"
                size="sm"
                variant="outline"
                justifyContent="space-between"
              >
                <Text>📧</Text>
                <Text>E-mail</Text>
                <ChevronRightIcon />
              </Button>

              <Button
                as={Link}
                _hover={{ textDecoration: 'none' }}
                isFullWidth
                isExternal
                href="https://twitter.com/stackup_fi"
                size="sm"
                variant="outline"
                justifyContent="space-between"
              >
                <FaTwitter color="#1DA1F2" />
                <Text>Twitter</Text>
                <ChevronRightIcon />
              </Button>

              <Button
                as={Link}
                _hover={{ textDecoration: 'none' }}
                isFullWidth
                isExternal
                href="https://discord.gg/FpXmvKrNed"
                size="sm"
                variant="outline"
                justifyContent="space-between"
              >
                <FaDiscord color="#7289da" />
                <Text>Discord</Text>
                <ChevronRightIcon />
              </Button>
            </VStack>
          </DrawerBody>

          <DrawerFooter>
            <Button
              isFullWidth
              colorScheme="blue"
              justifyContent="space-between"
              onClick={onChatHandler}
            >
              <Text>💬</Text>
              <Text>Chat with us!</Text>
              <ChevronRightIcon />
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};
