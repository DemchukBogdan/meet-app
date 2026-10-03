import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useCreateMeetingViewModel } from '@meet/meetings';

import { AppButton } from '../components/AppButton';
import { meetingsPalette } from '../styles/variant-styles';

type CreateMeetingScreenProps = {
  onBack: () => void;
  onCreated: (meetingId: string) => void;
};

export function CreateMeetingScreen({
  onBack,
  onCreated,
}: CreateMeetingScreenProps) {
  const viewModel = useCreateMeetingViewModel({ onCreated });

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{viewModel.screenTitle}</Text>
      <Text style={styles.label}>{viewModel.nameLabel}</Text>
      <TextInput
        style={styles.input}
        value={viewModel.title}
        onChangeText={viewModel.handleChangeTitle}
      />
      <FieldMessage message={viewModel.titleError} />
      <Text style={styles.label}>{viewModel.startsAtLabel}</Text>
      <TextInput
        style={styles.input}
        value={viewModel.startsAtLocal}
        onChangeText={viewModel.handleChangeStartsAt}
      />
      <FieldMessage message={viewModel.startsAtError} />
      <Text style={styles.label}>{viewModel.durationLabel}</Text>
      <TextInput
        keyboardType="number-pad"
        style={styles.input}
        value={viewModel.durationMin}
        onChangeText={viewModel.handleChangeDuration}
      />
      <FieldMessage message={viewModel.durationError} />
      {viewModel.requestErrorMessage ? (
        <Text style={styles.error}>{viewModel.requestErrorMessage}</Text>
      ) : null}
      <AppButton
        isDisabled={viewModel.isSubmitting}
        onPress={viewModel.handleSubmit}
      >
        {viewModel.submitLabel}
      </AppButton>
      <AppButton intent="secondary" onPress={onBack}>
        {viewModel.backLabel}
      </AppButton>
    </View>
  );
}

function FieldMessage({ message }: { message: string | undefined }) {
  if (!message) {
    return null;
  }

  return <Text style={styles.error}>{message}</Text>;
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: meetingsPalette.background,
    flex: 1,
    gap: 8,
    padding: 16,
    paddingTop: 56,
  },
  title: {
    color: meetingsPalette.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  label: {
    color: meetingsPalette.text,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: meetingsPalette.surface,
    borderColor: '#d6d3d1',
    borderRadius: 10,
    borderWidth: 1,
    color: meetingsPalette.text,
    padding: 12,
  },
  error: {
    color: '#b91c1c',
  },
});
