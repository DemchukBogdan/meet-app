import { Pressable, Text } from 'react-native';

import {
  buttonContainerStyle,
  buttonLabelStyle,
} from '../styles/variant-styles';

import type { ButtonVariantProps } from '@meet/ui';
import type { ReactNode } from 'react';

type AppButtonProps = ButtonVariantProps & {
  children: ReactNode;
  isDisabled?: boolean;
  onPress: () => void;
};

export function AppButton({
  children,
  intent,
  isDisabled = false,
  onPress,
  size,
}: AppButtonProps) {
  return (
    <Pressable
      disabled={isDisabled}
      style={[
        buttonContainerStyle(intent, size),
        isDisabled ? { opacity: 0.5 } : null,
      ]}
      onPress={onPress}
    >
      <Text style={buttonLabelStyle(intent)}>{children}</Text>
    </Pressable>
  );
}
