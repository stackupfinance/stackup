import { useState, useEffect } from 'react';
import {
  Box,
  HStack,
  IconButton,
  InputGroup,
  Input,
  InputLeftElement,
  InputRightElement,
} from '@chakra-ui/react';
import { CloseIcon, SearchIcon } from '@chakra-ui/icons';
import { AppDrawer } from '.';

export const Search = ({ onSearch, onClear, rightItem }) => {
  const [value, setValue] = useState('');
  const [debounce, setDebounce] = useState(false);

  useEffect(() => {
    if (!value) {
      debounce && onClear?.();
      !debounce && setDebounce(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const clearHandler = () => {
    setValue('');
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
    <header>
      <Box borderBottomWidth="1px" bg="gray.50">
        <HStack spacing="8px" py="16px" px="16px" maxW="xl" margin="0 auto">
          <AppDrawer />

          <InputGroup bg="white" borderRadius="lg">
            {value && (
              <InputLeftElement>
                <IconButton size="xs" onClick={clearHandler} icon={<CloseIcon />} />
              </InputLeftElement>
            )}

            <Input
              placeholder="Lookup account"
              onChange={onChangeHandler}
              onKeyDown={handleKeyDown}
              value={value}
            />

            <InputRightElement>
              <IconButton
                size="sm"
                colorScheme="blue"
                onClick={searchHandler}
                icon={<SearchIcon />}
              />
            </InputRightElement>
          </InputGroup>

          {rightItem}
        </HStack>
      </Box>
    </header>
  );
};
