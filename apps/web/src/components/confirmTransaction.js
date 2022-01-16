import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box,
  Button,
  VStack,
  HStack,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { InlineError } from '.';

export const ConfirmTransaction = ({ isOpen, isLoading, onConfirm, onClose, children }) => {
  const {
    register,
    handleSubmit,
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
    if (error) {
      return <InlineError message={error} />;
    }
    return null;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />

      <form onSubmit={handleSubmit(onSubmit)} onChange={() => setError('')}>
        <ModalContent>
          <ModalHeader>Confirm transaction</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="16px">
              {children}

              <Box w="100%">
                <Input
                  placeholder="Password"
                  type="password"
                  isInvalid={errors.password}
                  {...register('password', { required: true })}
                />
                {renderError()}
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing="8px">
              <Button isLoading={isLoading} colorScheme="blue" type="submit">
                Confirm
              </Button>

              <Button isLoading={isLoading} variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  );
};
