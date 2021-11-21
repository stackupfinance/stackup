import { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  IconButton,
  Stat,
  StatLabel,
  StatNumber,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  InputGroup,
  Input,
  InputRightElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { InlineError } from '.';

export const Pay = ({ isLoading, toUser, onConfirm, error }) => {
  const [showPay, setShowPay] = useState(false);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const format = (val) => `$` + val.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
  const parse = (val) => val.replace(/^\$|,/, '');

  return (
    <>
      <Box
        bg="gray.50"
        borderWidth="1px"
        borderTopRadius="lg"
        borderBottomRadius={['0', 'lg']}
        p="8px"
        pos="fixed"
        bottom={['0px', '32px']}
        left={['0px', 'auto']}
        maxW="544px"
        w="100%"
      >
        {showPay ? (
          <VStack spacing="8px">
            <IconButton
              icon={<CloseIcon />}
              size="xs"
              onClick={() => setShowPay(false)}
              alignSelf="flex-end"
            />

            <Box borderWidth="1px" borderRadius="lg" bg="white" w="100%" p="16px">
              <Stat>
                <StatLabel>Available balance</StatLabel>
                <StatNumber>$1,000.00</StatNumber>
              </Stat>
            </Box>

            <NumberInput
              onChange={(amount) => setAmount(parse(amount))}
              value={format(amount)}
              min={0}
              max={1000}
              precision={2}
              step={0.2}
              w="100%"
              bg="white"
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>

            <InputGroup>
              <Input
                pr="72px"
                placeholder="message..."
                bg="white"
                value={message}
                onChange={(ev) => setMessage(ev.target.value)}
              />

              <InputRightElement width="64px">
                <Button
                  isLoading={isLoading}
                  size="sm"
                  colorScheme="blue"
                  onClick={() => setShowConfirmModal(true)}
                >
                  Send
                </Button>
              </InputRightElement>
            </InputGroup>
          </VStack>
        ) : (
          <Button
            isFullWidth
            isLoading={isLoading}
            colorScheme="blue"
            onClick={() => setShowPay(true)}
          >
            Pay
          </Button>
        )}
      </Box>

      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm transaction</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="16px">
              <Text>
                You are about to send{' '}
                <Text as="span" fontWeight="bold">
                  {format(amount)}
                </Text>{' '}
                to{' '}
                <Text as="span" fontWeight="bold">
                  {toUser}
                </Text>
                . Enter your password to confirm.
              </Text>
              <Box w="100%">
                <Input
                  placeholder="Password"
                  type="password"
                  onChange={(ev) => setPassword(ev.target.value)}
                />
                {error && <InlineError message={error} />}
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing="8px">
              <Button
                isLoading={isLoading}
                colorScheme="blue"
                isDisabled={!password}
                onClick={() => onConfirm({ amount, message, password })}
              >
                Confirm
              </Button>
              <Button
                isLoading={isLoading}
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
