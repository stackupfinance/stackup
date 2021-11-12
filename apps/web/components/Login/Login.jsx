import { useForm } from 'react-hook-form';
import React from 'react';
import {
  FormErrorMessage,
  FormLabel,
  FormControl,
  Input,
  Button,
  Box,
  Center,
  Image,
  Wrap,
  Avatar,
  WrapItem,
} from '@chakra-ui/react';

export const Login = (props) => {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm();

  const [show, setShow] = React.useState(false);

  function onSubmit(values) {
    return new Promise((resolve) => {
      setTimeout(() => {
        alert(JSON.stringify(values, null, 2));
        resolve();
      }, 3000);
    });
  }

  return (
    <Box>
      <Center>
        <Wrap>
          <WrapItem>
            <Avatar size="2xl" name="Dan Abrahmov" src="https://bit.ly/dan-abramov" top={250} />
          </WrapItem>
        </Wrap>
      </Center>

      <Box
        w={311}
        h={337}
        marginTop="290"
        left="32"
        borderRadius="md"
        boxShadow="xs"
        p="6"
        rounded="md"
        bg="white"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormControl isInvalid={errors.name}>
            <Input
              id="username"
              placeholder="Username"
              {...register('user', {
                required: 'This is required',
                minLength: { value: 4, message: 'Minimum length should be 4' },
              })}
            />
            <Input
              marginTop={4}
              id="password"
              placeholder="Password"
              type={show ? 'text' : 'password'}
              {...register('password', {
                required: 'This is required',
                minLength: { value: 4, message: 'Minimum length should be 4' },
              })}
            />
            <FormErrorMessage>{errors.name && errors.name.message}</FormErrorMessage>
          </FormControl>
          <Center>
            <Button
              mt={4}
              colorScheme="teal"
              isLoading={isSubmitting}
              size={'lg'}
              type="submit"
              backgroundColor={'#1679EF'}
              _hover={'#1679EF'}
              w={279}
            >
              Log in
            </Button>
          </Center>
          <Center>
            <Button
              mt={4}
              isLoading={isSubmitting}
              size={'lg'}
              type="submit"
              backgroundColor={'white'}
              boxShadow="xs"
              p="6"
              rounded="md"
              bg="white"
              _hover={'#1679EF'}
              w={279}
            >
              Recover account
            </Button>
          </Center>
          <Center>
            <Button
              mt={4}
              isLoading={isSubmitting}
              size={'lg'}
              type="submit"
              backgroundColor={'white'}
              _hover={'#1679EF'}
              w={279}
              boxShadow="xs"
              p="6"
              rounded="md"
              bg="white"
            >
              Create profile
            </Button>
          </Center>
        </form>
      </Box>
    </Box>
  );
};
