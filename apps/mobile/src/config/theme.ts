import {Platform} from 'react-native';
import {extendTheme} from 'native-base';
import {DefaultTheme} from '@react-navigation/native';

const HelveticaNeueMediumExtended =
  Platform.OS === 'ios'
    ? 'HelveticaNeue-MediumExt'
    : 'Helvetica-Neue-Medium-Extended';

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
  },
  singletons: {
    good: '#1ed759',
    medium: '#e77f05',
    warning: '#ed4245',
  },
};

export const NativeBaseTheme = extendTheme({
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
        normal: HelveticaNeueMediumExtended,
      },
      200: {
        normal: HelveticaNeueMediumExtended,
      },
      300: {
        normal: HelveticaNeueMediumExtended,
      },
      400: {
        normal: HelveticaNeueMediumExtended,
      },
      500: {
        normal: HelveticaNeueMediumExtended,
      },
      600: {
        normal: HelveticaNeueMediumExtended,
      },
      700: {
        normal: HelveticaNeueMediumExtended,
      },
      800: {
        normal: HelveticaNeueMediumExtended,
      },
      900: {
        normal: HelveticaNeueMediumExtended,
      },
    },
  },
  fonts: {
    heading: 'HelveticaNeueMediumExtended',
    body: 'Inter',
    mono: 'Inter',
  },
  components: {
    Input: {
      baseStyle: {
        _dark: {
          placeholderTextColor: 'text.5',
          borderColor: 'background.3',
        },
      },
      variants: {
        outline: {
          borderWidth: '2px',
        },
      },
      sizes: {
        lg: {
          fontSize: '16px',
        },
        md: {
          fontSize: '16px',
        },
        sm: {
          fontSize: '16px',
        },
        xs: {
          fontSize: '16px',
        },
      },
    },
    Button: {
      baseStyle: {
        borderRadius: '8px',
      },
      sizes: {
        lg: {
          py: '16px',
          px: '16px',
          _text: {
            fontWeight: 700,
          },
        },
        md: {
          py: '16px',
          px: '16px',
          _text: {
            fontWeight: 700,
          },
        },
        sm: {
          py: '16px',
          px: '16px',
          _text: {
            fontWeight: 700,
          },
        },
        xs: {
          py: '16px',
          px: '16px',
          _text: {
            fontWeight: 700,
          },
        },
      },
    },
  },
  config: {
    useSystemColorMode: false,
    initialColorMode: 'dark',
  },
});

export const NavigationTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: AppColors.palettes.primary[600],
    background: AppColors.background[1],
    card: AppColors.background[2],
    text: 'white',
  },
};
