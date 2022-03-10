import { useState } from 'react';
import {
  VStack,
  Image,
  Heading,
  Text,
  Button,
  Box,
  InputGroup,
  InputLeftElement,
  Input,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { LockIcon } from '@chakra-ui/icons';
import { useForm } from 'react-hook-form';
import { InlineError } from '.';

export const ConfirmGuardians = ({ isLoading, onConfirm, guardianMap, email }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [error, setError] = useState('');
  const [loadingForm, setLoadingForm] = useState(false);

  const guardianLength = Object.values(guardianMap).length;

  const guardianMapToString = () => {
    const { defaultGuardian: _, ...rest } = guardianMap;
    const otherGuardians = Object.keys(rest);

    return guardianMap.defaultGuardian
      ? ['Stackup', ...otherGuardians].join(', ')
      : otherGuardians.join(', ');
  };

  const onSubmit = async (data) => {
    setLoadingForm(true);

    try {
      await onConfirm(data);
      setLoadingForm(false);
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Unknown error, try again later!');
      setLoadingForm(false);
    }
  };

  const renderError = () => {
    if (errors.password) {
      return <InlineError message="Password is required" />;
    }
    if (error) {
      return <InlineError message={error} />;
    }
    return null;
  };

  return (
    <>
      <VStack spacing="32px" w="100%">
        <Image src="/user-blue.png" maxW="128px" maxH="128px" alt="stackup logo" />

        <VStack spacing="16px" w="100%">
          <Box w="100%">
            <Heading size="md" mb="4px">
              Confirm your selection ✅
            </Heading>
            <Text>
              {`You're almost done! You've set `}
              <Text as="span" fontWeight="bold">
                {guardianLength} {guardianLength === 1 ? 'guardian' : 'guardians'}
              </Text>{' '}
              for your account. Enter your password to confirm.
            </Text>
          </Box>

          <Box p="16px" borderWidth="1px" borderRadius="lg" w="100%">
            {guardianLength > 0 && (
              <Accordion allowToggle mb="16px">
                <AccordionItem
                  id="accordion-item-1"
                  borderWidth="1px"
                  borderTopRadius="lg"
                  borderBottomRadius={email ? '0' : 'lg'}
                >
                  <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="500">
                      Show my guardians
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>

                  <AccordionPanel>{guardianMapToString()}</AccordionPanel>
                </AccordionItem>

                {email && (
                  <AccordionItem
                    id="accordion-item-2"
                    borderWidth="0 1px 1px 1px"
                    borderBottomRadius="lg"
                  >
                    <AccordionButton>
                      <Box flex="1" textAlign="left" fontWeight="500">
                        Show my recovery email
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>

                    <AccordionPanel>{email}</AccordionPanel>
                  </AccordionItem>
                )}
              </Accordion>
            )}

            <form onSubmit={handleSubmit(onSubmit)} onChange={() => setError('')}>
              <InputGroup size="lg" mb="16px">
                <InputLeftElement pointerEvents="none">
                  <LockIcon color="gray.300" />
                </InputLeftElement>

                <Input
                  placeholder="Enter your password"
                  type="password"
                  {...register('password', { required: true })}
                />
              </InputGroup>

              <Button
                isFullWidth
                isLoading={loadingForm || isLoading}
                colorScheme="blue"
                size="lg"
                type="submit"
              >
                Confirm
              </Button>
            </form>

            {renderError()}
          </Box>
        </VStack>
      </VStack>
    </>
  );
};
