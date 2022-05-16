import {PixelRatio} from 'react-native';

export const px2dp = (px: number): number => {
  return px / PixelRatio.get();
};
