// react
import { useEffect, useState } from 'react';

// react-native
import { Keyboard } from 'react-native';

export function useKeyboardBottomInset(): number {
  const [bottomInset, setBottomInset] = useState(0);

  // Keep screen padding aligned with the software keyboard height.
  useEffect(() => {
    const showEvent =
      process.env.EXPO_OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      process.env.EXPO_OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setBottomInset(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setBottomInset(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return bottomInset;
}
