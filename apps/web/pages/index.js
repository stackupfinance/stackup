import Head from 'next/head';
import Image from 'next/image';
import { Register } from '../components/Register';
import styles from '../styles/Home.module.css';
import { ChakraProvider, Center } from '@chakra-ui/react';

export default function Home() {
  return (
    <ChakraProvider>
      <Center>
        <Register />
      </Center>
    </ChakraProvider>
  );
}
