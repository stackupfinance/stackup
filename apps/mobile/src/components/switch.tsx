/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import ToggleSwitch from 'toggle-switch-react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faGrinHearts} from '@fortawesome/free-solid-svg-icons/faGrinHearts';
import {faFaceSurprise} from '@fortawesome/free-solid-svg-icons/faFaceSurprise';
import {AppColors} from '../config';

type Props = {
  enabled: boolean;
  onValueChange: (value: boolean) => void;
};

export const Switch = ({enabled, onValueChange}: Props) => {
  return (
    <ToggleSwitch
      isOn={enabled}
      onColor={AppColors.palettes.primary[600]}
      offColor={AppColors.background[2]}
      icon={
        enabled ? (
          <FontAwesomeIcon icon={faGrinHearts} color="white" size={20} />
        ) : (
          <FontAwesomeIcon icon={faFaceSurprise} color="white" size={20} />
        )
      }
      onToggle={onValueChange}
      size="medium"
      thumbOnStyle={{backgroundColor: 'transparent'}}
      thumbOffStyle={{backgroundColor: 'transparent'}}
    />
  );
};
