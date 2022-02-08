import { useState, useEffect } from 'react';
import {
  Box,
  HStack,
  Image,
  Spacer,
  LinkBox,
  LinkOverlay,
  IconButton,
  InputGroup,
  Input,
  InputLeftElement,
  InputRightElement,
} from '@chakra-ui/react';
import { CloseIcon, SearchIcon } from '@chakra-ui/icons';
import NextLink from 'next/link';
import { Routes } from '../config';

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
          <LinkBox>
            <NextLink href={Routes.HOME} passHref>
              <LinkOverlay>
                <Image
                  src="/mark-blue.png"
                  maxW="32px"
                  maxH="32px"
                  alt="stackup logo"
                  borderRadius="full"
                />
              </LinkOverlay>
            </NextLink>
          </LinkBox>

          <Spacer />

          <InputGroup bg="white" borderRadius="lg">
            {value && (
              <InputLeftElement>
                <IconButton size="xs" onClick={clearHandler} icon={<CloseIcon />} />
              </InputLeftElement>
            )}

            <Input
              pr="88px"
              placeholder="Search for user"
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

          {rightItem && <Spacer />}

          {rightItem && <Box>{rightItem}</Box>}
        </HStack>
      </Box>
    </header>
  );
};
