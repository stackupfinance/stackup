import {
  VStack,
  HStack,
  Image,
  Heading,
  Text,
  Button,
  Box,
  PinInput,
  PinInputField,
} from '@chakra-ui/react';
import { InlineError } from '.';

export const VerifyEmail = ({ isLoading, isDisabled, onComplete, onSendCode, email, error }) => {
  const renderDescription = () => {
    if (email)
      return (
        <Text>
          Enter the 6 digit code we sent to your inbox at{' '}
          <Text as="span" fontWeight="bold">
            {email}
          </Text>
          .
        </Text>
      );

    return <Text>Enter the 6 digit code we sent to your recovery e-mail address.</Text>;
  };

  return (
    <>
      <VStack spacing="32px" w="100%">
        <Image src="/user-blue.png" maxW="128px" maxH="128px" alt="stackup logo" />

        <VStack spacing="16px" w="100%">
          <Box w="100%">
            <Heading size="md" mb="4px">
              Verify your e-mail 🔑
            </Heading>

            {renderDescription()}
          </Box>

          <Box p="16px" borderWidth="1px" borderRadius="lg" w="100%">
            <HStack mb="16px" justifyContent="center">
              <PinInput id="pin-input-1" size="lg" onComplete={onComplete}>
                <PinInputField />
                <PinInputField />
                <PinInputField />
                <PinInputField />
                <PinInputField />
                <PinInputField />
              </PinInput>
            </HStack>

            <Button
              isFullWidth
              isLoading={isLoading}
              isDisabled={isDisabled}
              onClick={onSendCode}
              colorScheme="blue"
              variant="outline"
              size="lg"
            >
              Resend code
            </Button>

            {error && <InlineError message={error} />}
          </Box>
        </VStack>
      </VStack>
    </>
  );
};
