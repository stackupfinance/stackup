import {extendTheme} from 'native-base';

export const AppColors = {
  palettes: {
    primary: {
      50: '#c1c0ff',
      100: '#b2b0ff',
      200: '#a3a0ff',
      300: '#9390ff',
      400: '#8481ff',
      500: '#7471ff',
      600: '#6561ff',
      700: '#5b57e6',
      800: '#514ecc',
      900: '#4744b3',
    },
    secondary: {
      50: '#d9b9f9',
      100: '#d0a8f8',
      200: '#c796f7',
      300: '#bd85f5',
      400: '#b473f4',
      500: '#aa62f2',
      600: '#a150f1',
      700: '#9148d9',
      800: '#8140c1',
      900: '#7138a9',
    },
    tertiary: {
      50: '#f8b3b5',
      100: '#f6a1a2',
      200: '#f48e8f',
      300: '#f27b7d',
      400: '#f1686a',
      500: '#ef5558',
      600: '#ed4245',
      700: '#d53b3e',
      800: '#be3537',
      900: '#a62e30',
    },
  },
  background: {
    1: '#0f0f14',
    2: '#15151c',
    3: '#20222b',
    4: '#303247',
  },
  text: {
    1: '#f1f3f6',
    2: '#b8c1cf',
    3: '#aab3c4',
    4: '#7d829c',
    5: '#636882',
    6: '#1ED759',
  },
};

export const NativeBaseTheme = extendTheme({
  useSystemColorMode: false,
  initialColorMode: 'dark',
  colors: {
    primary: AppColors.palettes.primary,
    secondary: AppColors.palettes.secondary,
    tertiary: AppColors.palettes.tertiary,
    background: AppColors.background,
    text: AppColors.text,
  },
  fontConfig: {
    Inter: {
      100: {
        normal: 'Inter-Thin',
      },
      200: {
        normal: 'Inter-ExtraLight',
      },
      300: {
        normal: 'Inter-Light',
      },
      400: {
        normal: 'Inter-Regular',
      },
      500: {
        normal: 'Inter-Medium',
      },
      600: {
        normal: 'Inter-SemiBold',
      },
      700: {
        normal: 'Inter-Bold',
      },
      800: {
        normal: 'Inter-ExtraBold',
      },
      900: {
        normal: 'Inter-Black',
      },
    },
    HelveticaNeueMediumExtended: {
      100: {
        normal: 'Helvetica Neue Medium Extended',
      },
      200: {
        normal: 'Helvetica Neue Medium Extended',
      },
      300: {
        normal: 'Helvetica Neue Medium Extended',
      },
      400: {
        normal: 'Helvetica Neue Medium Extended',
      },
      500: {
        normal: 'Helvetica Neue Medium Extended',
      },
      600: {
        normal: 'Helvetica Neue Medium Extended',
      },
      700: {
        normal: 'Helvetica Neue Medium Extended',
      },
      800: {
        normal: 'Helvetica Neue Medium Extended',
      },
      900: {
        normal: 'Helvetica Neue Medium Extended',
      },
    },
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter',
    mono: 'Inter',
    Inter: 'Inter',
    HelveticaNeueMediumExtended: 'HelveticaNeueMediumExtended',
  },
});
