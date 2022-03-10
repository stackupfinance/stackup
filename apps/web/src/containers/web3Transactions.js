import { useState, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  IconButton,
  Text,
  Image,
  useToast,
  InputGroup,
  Input,
  InputRightElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Code,
  Divider,
  Link,
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { ethers } from 'ethers';
import { InlineError } from '../components';
import {
  useAccountStore,
  accountWeb3TransactionsSelector,
  useAppsStore,
  appsWeb3TransactionsSelector,
  useWalletStore,
  walletWeb3TransactionsSelector,
} from '../state';
import { App } from '../config';
import { getNameFromAddress } from '../utils/addressNames';
import { txType, txStatus } from '../utils/transaction';
import { useAuthChannel } from '../hooks';
import { EVENTS, logEvent } from '../utils/analytics';

const RPC_METHODS = {
  personalSign: 'personal_sign',
  ethSendTransaction: 'eth_sendTransaction',
};

export const Web3Transactions = ({ children }) => {
  const toast = useToast();
  const { wallet, accessToken, user } = useAccountStore(accountWeb3TransactionsSelector);
  const {
    loading: loadingApps,
    sessions,
    connectors,
    callRequestQueue,
    removeLastInCallRequestQueue,
    signMessage,
  } = useAppsStore(appsWeb3TransactionsSelector);
  const { loading: walletLoading, sendUserOpFromWalletConnect } = useWalletStore(
    walletWeb3TransactionsSelector,
  );
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isTransactionLoading, setIsTransactionLoading] = useState(false);
  const payload = useRef();
  const connector = useRef();
  const initialRef = useRef();

  const onApprove = async () => {
    try {
      if (payload.current.method === RPC_METHODS.personalSign) {
        connector.current.approveRequest({
          id: payload.current.id,
          result: await signMessage(wallet, payload.current.params[0], user.username, password),
        });
        logEvent(EVENTS.WALLET_CONNECT_APPROVE_PERSONAL_SIGN);
        removeLastInCallRequestQueue();
      } else if (payload.current.method === RPC_METHODS.ethSendTransaction) {
        await sendUserOpFromWalletConnect(
          wallet,
          user.username,
          password,
          payload.current.params[0],
          {
            userId: user.id,
            accessToken: accessToken.token,
          },
        );
        setIsTransactionLoading(true);
        logEvent(EVENTS.WALLET_CONNECT_APPROVE_ETH_SEND_TRANSACTION);
        toast({
          title: 'Transaction initiated',
          description: 'This might take a minute. Stay on this page for updates...',
          status: 'info',
          position: 'top-right',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Unknown error, try again later!');
    }
  };

  const onReject = () => {
    connector.current.rejectRequest({
      id: payload.current.id,
      error: {
        message: 'USER_REJECTED',
      },
    });
    logEvent(EVENTS.WALLET_CONNECT_REJECT_CALL_REQUEST);
    removeLastInCallRequestQueue();
  };

  const getHeading = () => {
    if (payload.current?.method === RPC_METHODS.personalSign)
      return `Signature for ${session?.peerMeta.name} ✍️`;

    if (payload.current?.method === RPC_METHODS.ethSendTransaction)
      return `Transaction from ${session?.peerMeta.name} ⛓`;
  };

  const isTransaction = () => {
    if (payload.current?.method === RPC_METHODS.ethSendTransaction) return true;

    return false;
  };

  const getTransactionDescription = () => {
    const tx = payload.current.params[0];
    const value = ethers.BigNumber.from(payload.current.params[0].value ?? 0);

    return (
      <>
        <Box>
          <Text>You are about to make a transaction to:</Text>
          <Link href={`${App.web3.explorer}/address/${tx.to}`} isExternal>
            <Code wordBreak="break-word" fontWeight="bold" borderRadius="md">
              {getNameFromAddress(tx.to)}
              <ExternalLinkIcon mx="2px" />
            </Code>
          </Link>
        </Box>

        {!value.eq(ethers.constants.Zero) && (
          <Box>
            <Text>This transaction will also send:</Text>
            <Code fontWeight="bold" borderRadius="md">{`${ethers.utils.formatEther(value)} ${
              App.web3.nativeSymbol
            }`}</Code>
          </Box>
        )}

        <Divider />

        <Text>
          Check{' '}
          <Code wordBreak="break-word" wordBreak="break-word" fontWeight="bold" borderRadius="md">
            {session.peerMeta.name}
          </Code>{' '}
          for more details.
        </Text>
      </>
    );
  };

  let sessionId, session;
  payload.current = undefined;
  connector.current = undefined;
  let showModal = false;
  if (callRequestQueue?.length && connectors) {
    const callRequest = callRequestQueue[callRequestQueue.length - 1];
    sessionId = callRequest.sessionId;
    session = sessions[sessionId];
    payload.current = callRequest.payload;
    connector.current = connectors[sessionId];

    switch (payload.current.method) {
      case RPC_METHODS.personalSign:
      case RPC_METHODS.ethSendTransaction: {
        showModal = true;
        break;
      }

      default:
        // setTimeout required to prevent the initial duplication.
        setTimeout(() => {
          !toast.isActive(payload.current.id) &&
            (() => {
              toast({
                id: payload.current.id,
                title: `${session.peerMeta.name} sent a request we can't handle`,
                description: `Drop us a support message and we'll try sort you out!`,
                status: 'error',
                duration: null,
                position: 'top-right',
                isClosable: true,
                onCloseComplete: onReject,
              });
              logEvent(EVENTS.WALLET_CONNECT_UNSUPPORTED_CALL_REQUEST);
            })();
        }, 1);
    }
  }

  useAuthChannel((event, data) => {
    if (event === txType.genericRelay && connector.current) {
      connector.current.approveRequest({
        id: payload.current.id,
        result: data.transactionHash,
      });
      setIsTransactionLoading(false);
      removeLastInCallRequestQueue();

      toast({
        title: data.status === txStatus.success ? 'Transaction success' : 'Transaction fail',
        description: (
          <Text>
            See transaction details{' '}
            <Link
              fontWeight="bold"
              href={`${App.web3.explorer}/tx/${data.transactionHash}`}
              isExternal
            >
              here
            </Link>
            .
          </Text>
        ),
        status: data.status === txStatus.success ? 'success' : 'error',
        position: 'top-right',
        duration: 5000,
        isClosable: true,
      });
    }
  });

  return (
    <Box>
      {children}

      <Modal initialFocusRef={initialRef} isOpen={showModal}>
        <ModalOverlay />

        <ModalContent bg="gray.50">
          <ModalHeader>
            <HStack spacing="8px">
              <Image
                boxSize="24px"
                borderRadius="md"
                bg="white"
                src={session?.peerMeta.icons[session?.peerMeta.icons.length - 1]}
                alt="app logo"
              />
              <Text fontWeight="bold" textOverflow="ellipsis" noOfLines={1} w="100%">
                {getHeading()}
              </Text>
            </HStack>
          </ModalHeader>

          <ModalBody>
            <VStack spacing="8px" align="left">
              {!isTransaction() && <Text>{`Don't worry, this action is free!`}</Text>}

              <Box>
                <Text
                  textAlign="left"
                  fontWeight="bold"
                  bg="blue.50"
                  borderTopRadius="lg"
                  borderWidth="1px"
                  borderBottomWidth="0px"
                  p="8px"
                >
                  {isTransaction() ? 'Transaction summary' : 'Message'}
                </Text>
                <VStack
                  spacing={isTransaction() ? '16px' : '8px'}
                  p="8px"
                  w="100%"
                  align="left"
                  bg="white"
                  borderBottomRadius="lg"
                  borderWidth="1px"
                  borderTopWidth="0px"
                >
                  {showModal
                    ? isTransaction()
                      ? getTransactionDescription()
                      : ethers.utils
                          .toUtf8String(payload.current.params[0])
                          .split('\n')
                          .map((str, i) => <Text key={`personal-sign-message-${i}`}>{str}</Text>)
                    : undefined}
                </VStack>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <VStack spacing="4px" w="100%" align="left">
              <HStack spacing="8px" w="100%">
                <InputGroup bg="white" borderRadius="lg">
                  <Input
                    ref={initialRef}
                    placeholder="Enter your password to sign"
                    type="password"
                    onChange={(ev) => {
                      setError('');
                      setPassword(ev.target.value);
                    }}
                  />

                  <InputRightElement>
                    <IconButton
                      isLoading={loadingApps || walletLoading || isTransactionLoading}
                      size="sm"
                      colorScheme="blue"
                      icon={<CheckIcon />}
                      onClick={onApprove}
                    />
                  </InputRightElement>
                </InputGroup>

                <IconButton
                  isLoading={loadingApps || walletLoading || isTransactionLoading}
                  size="sm"
                  colorScheme="red"
                  variant="outline"
                  icon={<CloseIcon />}
                  onClick={onReject}
                />
              </HStack>
              {error && <InlineError message={error} />}
            </VStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
