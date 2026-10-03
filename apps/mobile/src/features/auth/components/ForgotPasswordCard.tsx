// react-native
import { StyleSheet, Text, View } from 'react-native';

// constants
import { FORGOT_PASSWORD_TITLE, SMS_LOGIN_TITLE } from '../constants';

// components
import { OutlineButton } from './LoginExtras';

// styles
import { loginChromeStyles } from '../styles/loginChromeStyles';

type ForgotPasswordCardPropsType = {
  onSmsPress: VoidFunction;
  onEmailPress: VoidFunction;
};

export function ForgotPasswordCard({
  onSmsPress,
  onEmailPress,
}: ForgotPasswordCardPropsType) {
  return (
    <View style={[loginChromeStyles.card, styles.cardOffset]}>
      <Text style={loginChromeStyles.forgotTitle}>{FORGOT_PASSWORD_TITLE}</Text>
      <View style={styles.buttons}>
        <OutlineButton title={SMS_LOGIN_TITLE} onPress={onSmsPress} />
        <OutlineButton title={FORGOT_PASSWORD_TITLE} onPress={onEmailPress} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardOffset: {
    marginTop: 20,
  },
  buttons: {
    marginTop: 25,
  },
});
