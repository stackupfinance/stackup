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
  isUpdateFlow,
  username,
  isLoading,
  isDefaultGuardianSelected,
  additionalGuardians,
  onDefaultGuardian = () => {},
  onAddGuardian = () => {},
  onNext = () => {},
  onSkip = () => {},
  onSkipConfirm = () => {},
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
          <Box w="100%">
            <Heading size="md" mb="4px">
              {isUpdateFlow ? `Update your guardians 🔐` : `Welcome to Stackup, ${username}! 👋`}
            </Heading>
            <Text>
              {isUpdateFlow
                ? `This will submit a transaction to update your guardians on-chain incase you ever need to recover your account.`
                : `Let's get started by quickly setting up your guardians incase you ever need to recover
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
                isDisabled={isLoading}
                variant={isDefaultGuardianSelected ? 'solid' : 'outline'}
                colorScheme="blue"
                onClick={onDefaultGuardianClick}
                leftIcon={isDefaultGuardianSelected ? <CheckIcon /> : <AddIcon />}
              >
                Stackup
              </Button>

              {additionalGuardians}

              <Button
                isFullWidth
                isDisabled={isLoading}
                variant="outline"
                onClick={onAddGuardianClick}
                leftIcon={<AddIcon />}
              >
                Add guardian
              </Button>
            </VStack>

            <Divider />

            <VStack mt="16px">
              <Button
                isFullWidth
                isLoading={isLoading}
                colorScheme="blue"
                size="lg"
                onClick={onNextClick}
              >
                Next
              </Button>

              {isUpdateFlow ? undefined : (
                <Button
                  isFullWidth
                  isLoading={isLoading}
                  variant="outline"
                  size="lg"
                  onClick={onSkipClick}
                >
                  Skip
                </Button>
              )}
            </VStack>
          </Box>
        </VStack>
      </VStack>

      {isUpdateFlow ? undefined : (
        <Modal isOpen={showSkipConfirm} onClose={onSkipCancelClick}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Are you sure?</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              Setting this up now will enable account recovery right away. You can still add
              guardians later by submitting a transaction on-chain.
            </ModalBody>

            <ModalFooter>
              <Button isLoading={isLoading} colorScheme="blue" onClick={onSkipCancelClick}>
                Do it now
              </Button>
              <Button isLoading={isLoading} variant="outline" ml="8px" onClick={onSkipConfirmClick}>
                Skip
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};
