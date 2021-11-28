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
  Skeleton,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { InlineError } from '.';
import { balanceToString, displayUSDC } from '../utils/wallets';

export const Pay = ({
  isLoading,
  toUser,
  toWalletAddress,
  onPay,
  onSend,
  onConfirm,
  onCancel,
  error,
  walletBalance,
}) => {
  const [showPay, setShowPay] = useState(false);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sendError, setSendError] = useState('');

  const format = (val) => {
    const parts = val.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `$${parts.join('.')}`;
  };
  const parse = (val) => val.replace(/^\$|,/, '');

  const onClose = () => {
    setShowConfirmModal(false);
    onCancel();
  };

  const onPayClick = () => {
    onPay();
    setShowPay(true);
  };

  const onSendClick = () => {
    if (!amount) {
      setSendError('Amount must be more than 0.');
      return;
    } else if (!message) {
      setSendError('A message is required.');
      return;
    }

    setSendError('');
    onSend();
    setShowConfirmModal(true);
  };

  const onConfirmClick = async () => {
    try {
      await onConfirm({ amount, message, password, toWalletAddress });
      onClose();
      setShowPay(false);
    } catch (error) {
      console.error(error);
    }
  };

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

            <Stat borderWidth="1px" borderRadius="lg" bg="white" w="100%" p="16px">
              <StatLabel>Available balance</StatLabel>
              <Skeleton isLoaded={!isLoading}>
                <StatNumber>{displayUSDC(walletBalance)}</StatNumber>
              </Skeleton>
            </Stat>

            <NumberInput
              onChange={(amount) => setAmount(parse(amount))}
              value={format(amount)}
              min={0}
              max={balanceToString(walletBalance)}
              precision={2}
              step={0.2}
              name="amount"
              w="100%"
              bg="white"
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>

            <Box w="100%">
              <InputGroup>
                <Input
                  pr="72px"
                  placeholder="message..."
                  bg="white"
                  name="message"
                  value={message}
                  onChange={(ev) => setMessage(ev.target.value)}
                />

                <InputRightElement width="64px">
                  <Button isLoading={isLoading} size="sm" colorScheme="blue" onClick={onSendClick}>
                    Send
                  </Button>
                </InputRightElement>
              </InputGroup>
              {sendError && <InlineError message={sendError} />}
            </Box>
          </VStack>
        ) : (
          <Button isFullWidth isLoading={isLoading} colorScheme="blue" onClick={onPayClick}>
            Pay
          </Button>
        )}
      </Box>

      <Modal isOpen={showConfirmModal} onClose={onClose}>
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
                  name="password"
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
                onClick={onConfirmClick}
              >
                Confirm
              </Button>
              <Button isLoading={isLoading} variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
