import { Progress } from '@chakra-ui/react';
import zxcvbn from 'zxcvbn';

export const PasswordStrength = ({ password = '' }) => {
  const value = password ? 20 * (zxcvbn(password).score + 1) : 0;
  let colorScheme;
  switch (value) {
    case 20:
      colorScheme = 'red';
      break;

    case 40:
      colorScheme = 'red';
      break;

    case 60:
      colorScheme = 'yellow';
      break;

    case 80:
      colorScheme = 'green';
      break;

    case 100:
      colorScheme = 'blue';
      break;

    default:
      colorScheme = 'red';
      break;
  }

  return <Progress value={value} colorScheme={colorScheme} borderRadius="sm" />;
};
