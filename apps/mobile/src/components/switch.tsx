/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import ToggleSwitch from 'toggle-switch-react-native';
import {Spinner} from 'native-base';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faGrinHearts} from '@fortawesome/free-solid-svg-icons/faGrinHearts';
import {faFaceSurprise} from '@fortawesome/free-solid-svg-icons/faFaceSurprise';
import {AppColors} from '../config';

type Props = {
  isLoading?: boolean;
  enabled: boolean;
  onValueChange: (value: boolean) => void;
};

export const Switch = ({isLoading, enabled, onValueChange}: Props) => {
  return (
    <ToggleSwitch
      disabled={isLoading}
      isOn={enabled}
      onColor={AppColors.palettes.primary[600]}
      offColor={AppColors.background[2]}
      icon={
        isLoading ? (
          <Spinner color="white" />
        ) : (
          <FontAwesomeIcon
            icon={enabled ? faGrinHearts : faFaceSurprise}
            color="white"
            size={20}
          />
        )
      }
      onToggle={onValueChange}
      size="medium"
      thumbOnStyle={{backgroundColor: 'transparent'}}
      thumbOffStyle={{backgroundColor: 'transparent'}}
    />
  );
};
