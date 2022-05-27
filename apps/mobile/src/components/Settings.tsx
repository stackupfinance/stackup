import React from 'react';
import {Actionsheet} from 'native-base';

type SettingsProps = {
  isOpen: boolean;
  onClose: () => void;
};

const Settings = (props: SettingsProps) => {
  const {isOpen, onClose} = props;
  return (
    <>
      <Actionsheet isOpen={isOpen} onClose={onClose}>
        <Actionsheet.Content>
          <Actionsheet.Item>Currency</Actionsheet.Item>
          <Actionsheet.Item>Help &amp; Support</Actionsheet.Item>
          <Actionsheet.Item>Join Stackup community</Actionsheet.Item>
        </Actionsheet.Content>
      </Actionsheet>
    </>
  );
};

export default Settings;
