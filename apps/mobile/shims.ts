import 'react-native-get-random-values';
import '@ethersproject/shims';

import {scrypt} from 'react-native-fast-crypto';
global.scrypt = scrypt;

import {Buffer} from 'buffer';
global.Buffer = global.Buffer || Buffer;
