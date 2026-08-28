import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

const ICON_MAP: Record<string, string> = {
  search: 'https://cdn-icons-png.flaticon.com/512/622/622669.png',
  plus: 'https://cdn-icons-png.flaticon.com/512/992/992651.png',
  chat: 'https://cdn-icons-png.flaticon.com/512/1380/1380370.png',
  user: 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png',
  cat: 'https://cdn-icons-png.flaticon.com/512/616/616430.png',
  dog: 'https://cdn-icons-png.flaticon.com/512/616/616408.png',
  food: 'https://cdn-icons-png.flaticon.com/512/3047/3047928.png',
  shield: 'https://cdn-icons-png.flaticon.com/512/1067/1067357.png',
  flag: 'https://cdn-icons-png.flaticon.com/512/148/148836.png',
  pin: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  camera: 'https://cdn-icons-png.flaticon.com/512/685/685655.png',
  check: 'https://cdn-icons-png.flaticon.com/512/4436/4436481.png',
  back: 'https://cdn-icons-png.flaticon.com/512/271/271220.png',
  eye: 'https://cdn-icons-png.flaticon.com/512/709/709612.png',
  home: 'https://cdn-icons-png.flaticon.com/512/1946/1946488.png',
};

interface FlaticonProps {
  name: string;
  size?: number;
  tintColor?: string;
  style?: StyleProp<ImageStyle>;
}

export const Flaticon: React.FC<FlaticonProps> = ({ name, size = 20, tintColor, style }) => {
  const uri = ICON_MAP[name] || ICON_MAP.search;

  return (
    <Image
      source={{ uri }}
      style={[
        { width: size, height: size },
        tintColor ? { tintColor } : null,
        style,
      ]}
      resizeMode="contain"
    />
  );
};
