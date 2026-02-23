import React from 'react';
import { View, Text, ViewStyle } from 'react-native';

type Props = {
  number: number;
  text: string;
  color: string;
  icon: React.ReactNode;
  className?: string;
  style?: ViewStyle;
};

export const Card = ({
  number,
  text,
  color,
  icon,
  className = '',
  style = {}
}: Props) => {
  return (
    <View
      className={`p-4 rounded-2xl   ${className}`}
      style={[{ backgroundColor: color, shadowOffset: { width: 0, height: 2 }, shadowColor: '#000', elevation: 4 }, style]}
    >
      <View className="mb-2">
        {React.cloneElement(icon as React.ReactElement, {
          size: 20,
          color: 'white',
        })}
      </View>

      <Text className="text-2xl font-bold text-white mb-1">{number}</Text>

      <Text className="text-white text-opacity-90 text-xs font-normal">
        {text}
      </Text>
    </View>
  );
};
