require('node-libs-react-native/globals.js');

import 'react-native-get-random-values';
import '@ethersproject/shims';

import {scrypt} from 'react-native-fast-crypto';
import {wallet} from '@stackupfinance/walletjs';
wallet._overrideScryptFn(scrypt);

import {Buffer} from 'buffer';
global.Buffer = global.Buffer || Buffer;
