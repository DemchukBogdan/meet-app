// react-native
import { StyleSheet, View } from 'react-native';

type EditIconPropsType = {
  isDisabled?: boolean;
};

export function EditIcon({ isDisabled = false }: EditIconPropsType) {
  return (
    <View style={[styles.wrap, isDisabled && styles.disabled]}>
      <View style={styles.body} />
      <View style={styles.tip} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.35,
  },
  body: {
    width: 11,
    height: 3,
    borderRadius: 1,
    backgroundColor: '#9A9A9A',
    transform: [{ rotate: '-45deg' }, { translateY: 1 }],
  },
  tip: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 1,
    backgroundColor: '#9A9A9A',
    top: 2,
    right: 2,
  },
});
