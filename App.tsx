import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ZoomSDKProvider, useZoom } from '@zoom/meetingsdk-react-native';

// TODO: replace with a signed JWT from your backend.
// Never hardcode a real token/secret in the client — generate it
// server-side per Zoom's auth docs: https://developers.zoom.us/docs/meeting-sdk/auth/
const ZOOM_JWT_TOKEN = '';

function JoinMeetingScreen() {
  const zoom = useZoom();
  const [meetingNumber, setMeetingNumber] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');

  const handleJoin = async () => {
    try {
      await zoom.joinMeeting({
        userName: userName || 'Guest',
        meetingNumber,
        password,
        userType: 1,
      });
    } catch (error) {
      Alert.alert('Failed to join meeting', String(error));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join a Zoom Meeting</Text>
      <TextInput
        style={styles.input}
        placeholder="Meeting number"
        keyboardType="number-pad"
        value={meetingNumber}
        onChangeText={setMeetingNumber}
      />
      <TextInput
        style={styles.input}
        placeholder="Password (optional)"
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Your name"
        value={userName}
        onChangeText={setUserName}
      />
      <Button title="Join Meeting" onPress={handleJoin} />
      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  return (
    <ZoomSDKProvider
      config={{
        jwtToken: ZOOM_JWT_TOKEN,
        domain: 'zoom.us',
        enableLog: true,
        logSize: 5,
      }}
    >
      <JoinMeetingScreen />
    </ZoomSDKProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
});
