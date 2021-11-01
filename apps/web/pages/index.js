import Head from "next/head";
import Image from "next/image";
import { Login } from "../components/Login";
import styles from "../styles/Home.module.css";
import { ChakraProvider, Center } from "@chakra-ui/react";

export default function Home() {
  return (
    <ChakraProvider>
      <Center>
        <Login />
      </Center>
    </ChakraProvider>
  );
}
