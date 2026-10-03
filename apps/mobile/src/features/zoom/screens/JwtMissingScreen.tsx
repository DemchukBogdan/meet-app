import { Text, View } from 'react-native';

// libraries
import { StatusBar } from 'expo-status-bar';

// styles
import { screenStyles } from '@/shared/styles/screenStyles';

export function JwtMissingScreen() {
  return (
    <View style={screenStyles.container}>
      <Text style={screenStyles.title}>Zoom JWT missing</Text>
      <Text style={screenStyles.hint}>
        Set ZOOM_CLIENT_ID and ZOOM_CLIENT_SECRET in .env, then restart Metro.
        JWT is signed at config load so the Client Secret never ships in the app
        bundle.
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}
