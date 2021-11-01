import { useForm } from "react-hook-form";
import React from "react";
import {
  FormErrorMessage,
  FormLabel,
  FormControl,
  Input,
  Button,
  Box,
  Center,
} from "@chakra-ui/react";

export const Form = (props) => {
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
            {...register("user", {
              required: "This is required",
              minLength: { value: 4, message: "Minimum length should be 4" },
            })}
          />
          <Input
            marginTop={4}
            id="password"
            placeholder="Password"
            type={show ? "text" : "password"}
            {...register("password", {
              required: "This is required",
              minLength: { value: 4, message: "Minimum length should be 4" },
            })}
          />
          <FormErrorMessage>
            {errors.name && errors.name.message}
          </FormErrorMessage>
        </FormControl>
        <Center>
          <Button
            mt={4}
            colorScheme="teal"
            isLoading={isSubmitting}
            size={"lg"}
            type="submit"
            backgroundColor={"#1679EF"}
            _hover={"#1679EF"}
            w={279}
          >
            Submit
          </Button>
        </Center>
      </form>
    </Box>
  );
};
