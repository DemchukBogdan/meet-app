import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

// libraries
import { StatusBar } from 'expo-status-bar';

// hooks
import { useZoomMeeting } from '../hooks/useZoomMeeting';

// components
import { CreatedMeetingCard } from '../components/CreatedMeetingCard';

// styles
import { screenStyles } from '@/shared/styles/screenStyles';

export function JoinMeetingScreen() {
  const {
    userName,
    setUserName,
    topic,
    setTopic,
    meetingNumber,
    setMeetingNumber,
    password,
    setPassword,
    createdMeeting,
    areActionsDisabled,
    statusLabel,
    createButtonTitle,
    handleJoin,
    handleCreateAndStart,
    handleShareCreatedMeeting,
  } = useZoomMeeting();

  return (
    <View style={screenStyles.container}>
      <Text style={screenStyles.title}>Zoom Meeting</Text>
      <Text style={screenStyles.hint}>{statusLabel}</Text>
      <TextInput
        style={styles.input}
        placeholder="Your name"
        value={userName}
        onChangeText={setUserName}
      />
      <TextInput
        style={styles.input}
        placeholder="Meeting topic"
        value={topic}
        onChangeText={setTopic}
      />
      <Button
        title={createButtonTitle}
        onPress={handleCreateAndStart}
        disabled={areActionsDisabled}
      />
      {createdMeeting ? (
        <CreatedMeetingCard
          meeting={createdMeeting}
          onShare={handleShareCreatedMeeting}
        />
      ) : null}
      <Text style={styles.sectionTitle}>Join an existing meeting</Text>
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
      <Button
        title="Join Meeting"
        onPress={handleJoin}
        disabled={areActionsDisabled}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    width: '100%',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
});
