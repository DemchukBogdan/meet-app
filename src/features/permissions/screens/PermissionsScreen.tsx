import { Button, StyleSheet, Text, View } from 'react-native';

// libraries
import { StatusBar } from 'expo-status-bar';

// hooks
import { useMediaPermissions } from '../hooks/useMediaPermissions';

// styles
import { screenStyles } from '@/shared/styles/screenStyles';

type PermissionsScreenPropsType = {
  onContinue: VoidFunction;
};

export function PermissionsScreen({ onContinue }: PermissionsScreenPropsType) {
  const {
    isCameraGranted,
    isMicrophoneGranted,
    needsSettings,
    cameraLabel,
    microphoneLabel,
    primaryButton,
    handleOpenSettings,
  } = useMediaPermissions({ onAllGranted: onContinue });

  const cameraStatusStyle = isCameraGranted
    ? styles.permissionGranted
    : styles.permissionDenied;
  const microphoneStatusStyle = isMicrophoneGranted
    ? styles.permissionGranted
    : styles.permissionDenied;

  return (
    <View style={screenStyles.container}>
      <Text style={screenStyles.title}>Camera and microphone</Text>
      <Text style={screenStyles.hint}>
        Zoom needs camera and microphone access before you can join a meeting.
        Allow both permissions on this screen.
      </Text>
      <View style={styles.permissionRow}>
        <Text style={styles.permissionName}>Camera</Text>
        <Text style={cameraStatusStyle}>{cameraLabel}</Text>
      </View>
      <View style={styles.permissionRow}>
        <Text style={styles.permissionName}>Microphone</Text>
        <Text style={microphoneStatusStyle}>{microphoneLabel}</Text>
      </View>
      <Button
        title={primaryButton.title}
        onPress={primaryButton.onPress}
        disabled={primaryButton.isDisabled}
      />
      {needsSettings ? (
        <Button title="Open Settings" onPress={handleOpenSettings} />
      ) : null}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  permissionRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  permissionName: {
    fontSize: 16,
    fontWeight: '500',
  },
  permissionGranted: {
    color: '#1B7F3A',
  },
  permissionDenied: {
    color: '#B42318',
  },
});
