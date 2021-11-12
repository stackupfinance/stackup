import { useForm } from 'react-hook-form';
import React from 'react';
import {
  FormErrorMessage,
  FormControl,
  Input,
  Button,
  Box,
  Center,
  Wrap,
  Avatar,
  WrapItem,
  Progress,
  Grid,
  GridItem,
  Text,
} from '@chakra-ui/react';

export const Register = (props) => {
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
            <Progress colorscheme={'green'} value={64} size="sm" marginTop={1} />
            <Grid templateColumns="repeat(5, 1fr)" gap={4}>
              <GridItem colSpan={2} h="10">
                <Text fontSize="xs" color={'blackAlpha.500'}>
                  Weak
                </Text>
              </GridItem>
              <GridItem colStart={5} colEnd={6} h="10">
                <Text fontSize="xs" color={'blackAlpha.500'}>
                  Strong
                </Text>
              </GridItem>
            </Grid>
            <Input
              marginTop={2}
              id="confirmPassword"
              placeholder="Confirm Password"
              type={show ? 'text' : 'confirmPassword'}
              {...register('confirmPassword', {
                required: 'This is required',
                minLength: { value: 4, message: 'Minimum length should be 4' },
              })}
            />
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
              Next
            </Button>
          </Center>
        </form>
      </Box>
    </Box>
  );
};
