import { Button, StyleSheet, Text, View } from 'react-native';

// styles
import { screenStyles } from '@/shared/styles/screenStyles';

// types
import type { CreatedZoomMeetingType } from '../types';

type CreatedMeetingCardPropsType = {
  meeting: CreatedZoomMeetingType;
  onShare: VoidFunction;
};

export function CreatedMeetingCard({
  meeting,
  onShare,
}: CreatedMeetingCardPropsType) {
  return (
    <View style={styles.createdMeeting}>
      <Text style={styles.createdMeetingTitle}>Created meeting</Text>
      <Text style={screenStyles.hint}>ID: {meeting.meetingNumber}</Text>
      {meeting.password ? (
        <Text style={screenStyles.hint}>Password: {meeting.password}</Text>
      ) : null}
      <Button title="Share join link" onPress={onShare} />
    </View>
  );
}

const styles = StyleSheet.create({
  createdMeeting: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  createdMeetingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
});
