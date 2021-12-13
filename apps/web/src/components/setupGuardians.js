import { useState } from 'react';
import {
  VStack,
  Image,
  Heading,
  Text,
  Button,
  Divider,
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { CheckIcon, AddIcon } from '@chakra-ui/icons';

export const SetupGuardians = ({
  username,
  defaultGuardianSelected,
  additionalGuardians,
  onDefaultGuardian,
  onAddGuardian,
  onNext,
  onSkip,
  onSkipConfirm,
}) => {
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  const onDefaultGuardianClick = () => {
    onDefaultGuardian();
  };

  const onAddGuardianClick = () => {
    onAddGuardian();
  };

  const onNextClick = () => {
    onNext();
  };

  const onSkipClick = () => {
    setShowSkipConfirm(true);
    onSkip();
  };

  const onSkipConfirmClick = () => {
    onSkipConfirm();
  };

  const onSkipCancelClick = () => {
    setShowSkipConfirm(false);
  };

  return (
    <>
      <VStack spacing="32px" w="100%">
        <Image src="/user-blue.png" maxW="128px" maxH="128px" alt="stackup logo" />

        <VStack spacing="16px" w="100%">
          <Box>
            <Heading size="md" mb="4px">
              Welcome to Stackup, {username}! 👋
            </Heading>
            <Text>
              {`Let's get started by quickly setting up your guardians incase you ever need to recover
              your account.`}
            </Text>
          </Box>

          <Box p="16px" borderWidth="1px" borderRadius="lg" w="100%">
            <Accordion allowToggle mb="16px">
              <AccordionItem id="accordion-item-1" borderWidth="1px" borderRadius="lg">
                <AccordionButton>
                  <Box flex="1" textAlign="left" fontWeight="500">
                    {`What's a guardian?`}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>

                <AccordionPanel>
                  Your guardians are a group of wallets that can help recover your account through
                  majority consensus. You can read more about how it works{' '}
                  <Link href="#" fontWeight="bold" isExternal>
                    here
                  </Link>
                  .
                </AccordionPanel>
              </AccordionItem>
            </Accordion>

            <VStack mb="16px">
              <Button
                isFullWidth
                variant={defaultGuardianSelected ? 'solid' : 'outline'}
                colorScheme="blue"
                onClick={onDefaultGuardianClick}
                leftIcon={defaultGuardianSelected ? <CheckIcon /> : <AddIcon />}
              >
                Stackup
              </Button>

              {additionalGuardians}

              <Button
                isFullWidth
                variant="outline"
                onClick={onAddGuardianClick}
                leftIcon={<AddIcon />}
              >
                Add guardian
              </Button>
            </VStack>

            <Divider />

            <VStack mt="16px">
              <Button isFullWidth colorScheme="blue" size="lg" onClick={onNextClick}>
                Next
              </Button>

              <Button isFullWidth variant="outline" size="lg" onClick={onSkipClick}>
                Skip
              </Button>
            </VStack>
          </Box>
        </VStack>
      </VStack>

      <Modal isOpen={showSkipConfirm} onClose={onSkipCancelClick}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Are you sure?</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Setting this up now will enable account recovery right away. You can still add guardians
            later by submitting a transaction on-chain.
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" onClick={onSkipCancelClick}>
              Do it now
            </Button>
            <Button variant="outline" ml="8px" onClick={onSkipConfirmClick}>
              Skip
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
