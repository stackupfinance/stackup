import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  VStack,
  Image,
  Heading,
  Divider,
  Button,
  Box,
  InputGroup,
  InputLeftElement,
  Input,
} from '@chakra-ui/react';
import { LockIcon } from '@chakra-ui/icons';
import { InlineError, PasswordStrength } from '.';

export const UpdatePassword = ({ isLoading, onConfirm = () => {} }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [error, setError] = useState('');

  const onSubmit = async (data) => {
    try {
      await onConfirm(data);
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Unknown error, try again later!');
    }
  };

  const renderError = () => {
    if (errors.password) {
      return <InlineError message="Password is required" />;
    }
    if (errors.newPassword) {
      return <InlineError message="New password is required" />;
    }
    if (errors.confirmPassword?.type === 'required') {
      return <InlineError message="Confirm password is required" />;
    }
    if (errors.confirmPassword?.type === 'validate') {
      return <InlineError message="Password does not match" />;
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
              Update your password 🔒
            </Heading>
          </Box>

          <Box p="16px" borderWidth="1px" borderRadius="lg" w="100%">
            <form onSubmit={handleSubmit(onSubmit)} onChange={() => setError('')}>
              <InputGroup size="lg" mb="8px">
                <InputLeftElement pointerEvents="none">
                  <LockIcon color="gray.300" />
                </InputLeftElement>

                <Input
                  placeholder="Current password"
                  type="password"
                  isInvalid={errors.password}
                  {...register('password', { required: true })}
                />
              </InputGroup>

              <Divider mb="8px" />

              <Input
                size="lg"
                mb="4px"
                placeholder="New password"
                type="password"
                isInvalid={errors.newPassword}
                {...register('newPassword', { required: true })}
              />
              <PasswordStrength password={watch('newPassword')} />

              <Input
                size="lg"
                my="8px"
                placeholder="Confirm password"
                type="password"
                isInvalid={errors.confirmPassword}
                {...register('confirmPassword', {
                  required: true,
                  validate: (value) => value === watch('newPassword'),
                })}
              />

              <Button isFullWidth isLoading={isLoading} colorScheme="blue" size="lg" type="submit">
                Update
              </Button>
            </form>

            {renderError()}
          </Box>
        </VStack>
      </VStack>
    </>
  );
};
