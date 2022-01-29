import { useEffect, useState } from 'react';
import {
  Button,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

export const SearchModal = ({
  bodyRef,
  isOpen,
  isLoading,
  onSearch,
  onClear,
  onClose,
  children,
}) => {
  const [value, setValue] = useState('');
  const [debounce, setDebounce] = useState(false);

  useEffect(() => {
    if (!value) {
      debounce && onClear?.();
      !debounce && setDebounce(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const closeHandler = () => {
    setValue('');
    onClose?.();
  };

  const searchHandler = () => {
    value && onSearch?.(value);
  };

  const onChangeHandler = (ev) => {
    setValue(ev.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      searchHandler();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeHandler} scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalBody
          id={bodyRef}
          p="8px"
          css={{
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            scrollbarWidth: 'none',
          }}
        >
          <InputGroup size="lg" mb="8px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>

            <Input
              pr="88px"
              placeholder="Search for user"
              onChange={onChangeHandler}
              onKeyDown={handleKeyDown}
              value={value}
            />

            <InputRightElement width="80px" mr="4px">
              <Button isLoading={isLoading} colorScheme="blue" onClick={searchHandler}>
                Search
              </Button>
            </InputRightElement>
          </InputGroup>

          {children}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
