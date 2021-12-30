import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
} from '@chakra-ui/react';
import { LockIcon } from '@chakra-ui/icons';
import { InlineError } from '.';

export const RecoverAccount = ({ isLoading, onConfirmTrasaction }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [error, setError] = useState('');

  const onSubmit = async (data) => {
    try {
      await onConfirmTrasaction(data);
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Unknown error, try again later!');
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
              Guardian approval complete 🤝
            </Heading>
            <Text>
              {`We're almost done! The last step is to confirm the transaction to update your account's credentials.`}
            </Text>
          </Box>

          <Box p="16px" borderWidth="1px" borderRadius="lg" w="100%">
            <form onSubmit={handleSubmit(onSubmit)} onChange={() => setError('')}>
              <InputGroup size="lg" mb="8px">
                <InputLeftElement pointerEvents="none">
                  <LockIcon color="gray.300" />
                </InputLeftElement>

                <Input
                  placeholder="Enter new password"
                  type="password"
                  isInvalid={errors.password}
                  {...register('password', { required: true })}
                />
              </InputGroup>

              <Button isFullWidth isLoading={isLoading} colorScheme="blue" size="lg" type="submit">
                Confirm transaction
              </Button>
            </form>

            {renderError()}
          </Box>
        </VStack>
      </VStack>
    </>
  );
};
