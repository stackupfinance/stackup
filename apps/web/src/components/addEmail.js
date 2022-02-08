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
import { EmailIcon } from '@chakra-ui/icons';
import { InlineError } from '.';

export const AddEmail = ({ isLoading, onNext }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [error, setError] = useState('');

  const onSubmit = async (data) => {
    try {
      await onNext(data);
    } catch (error) {
      setError(error.response?.data?.message || 'Unknown error, try again later!');
    }
  };

  const renderError = () => {
    if (errors.email) {
      return <InlineError message="E-mail is required" />;
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
              Add your e-mail 📧
            </Heading>
            <Text>
              {`Since you've selected us to be one of your guardians, we'll use this e-mail to confirm your identity incase you ever need to recover your account.`}
            </Text>
          </Box>

          <Box p="16px" borderWidth="1px" borderRadius="lg" w="100%">
            <form onSubmit={handleSubmit(onSubmit)} onChange={() => setError('')}>
              <InputGroup size="lg" mb="8px">
                <InputLeftElement pointerEvents="none">
                  <EmailIcon color="gray.300" />
                </InputLeftElement>

                <Input placeholder="Enter your e-mail" {...register('email', { required: true })} />
              </InputGroup>

              <Button isFullWidth isLoading={isLoading} colorScheme="blue" size="lg" type="submit">
                Next
              </Button>
            </form>

            {renderError()}
          </Box>
        </VStack>
      </VStack>
    </>
  );
};
