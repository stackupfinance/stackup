import React, {useEffect, useState} from 'react';
import {AlertDialog, Button, Input, Box} from 'native-base';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faKey} from '@fortawesome/free-solid-svg-icons/faKey';
import {AppColors} from '../config';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (masterPassword: string) => void;
};

export const RequestMasterPassword = ({isOpen, onClose, onConfirm}: Props) => {
  const [masterPassword, setMasterPassword] = useState('');
  const inputRef = React.useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setMasterPassword('');
    }
  }, [isOpen]);

  const onConfirmPress = () => {
    onConfirm(masterPassword);
  };

  return (
    <AlertDialog
      leastDestructiveRef={inputRef}
      initialFocusRef={inputRef}
      isOpen={isOpen}
      onClose={onClose}>
      <AlertDialog.Content w="100%">
        <AlertDialog.CloseButton />
        <AlertDialog.Header>Password required</AlertDialog.Header>
        <AlertDialog.Body>
          <Input
            autoFocus={true}
            ref={inputRef}
            type="password"
            placeholder="Enter your password..."
            onChangeText={setMasterPassword}
            leftElement={
              <Box ml="13px">
                <FontAwesomeIcon
                  icon={faKey}
                  color={AppColors.text[5]}
                  size={18}
                />
              </Box>
            }
          />
        </AlertDialog.Body>
        <AlertDialog.Footer>
          <Button onPress={onConfirmPress}>Confirm</Button>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
};
