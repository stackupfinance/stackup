import { VStack, Image, Heading, Text, Button, Divider, Box } from '@chakra-ui/react';
import { CheckIcon, SpinnerIcon } from '@chakra-ui/icons';

export const GuardianStatus = ({
  isLoading,
  isNextDisabled,
  status = [],
  onNextClick = () => {},
}) => {
  const renderStatus = () => {
    return status.map((s, i) => (
      <Button
        key={`guardians-status-item-${i}`}
        isFullWidth
        variant={s.isComplete ? 'solid' : 'outline'}
        colorScheme="blue"
        leftIcon={s.isComplete ? <CheckIcon /> : <SpinnerIcon />}
      >
        {s.username}
      </Button>
    ));
  };

  return (
    <>
      <VStack spacing="32px" w="100%">
        <Image src="/user-blue.png" maxW="128px" maxH="128px" alt="stackup logo" />

        <VStack spacing="16px" w="100%">
          <Box w="100%">
            <Heading size="md" mb="4px">
              {`We've notified your guardians 📫`}
            </Heading>
            <Text>
              {`Let them know you're trying to recover your account and stay on this page to track their approvals.`}
            </Text>
          </Box>
        </VStack>

        <Box p="16px" borderWidth="1px" borderRadius="lg" w="100%">
          <VStack mb="16px">{renderStatus()}</VStack>

          <Divider />

          <Button
            mt="16px"
            isFullWidth
            isLoading={isLoading}
            isDisabled={isNextDisabled}
            colorScheme="blue"
            size="lg"
            onClick={onNextClick}
          >
            Next
          </Button>
        </Box>
      </VStack>
    </>
  );
};
