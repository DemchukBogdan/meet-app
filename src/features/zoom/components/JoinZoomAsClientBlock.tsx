// react
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

// react-native
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

// constants
import {
  MEET_APP_FIELD_BG,
  MEET_APP_GREEN,
  MEET_APP_LABEL,
} from '@/features/auth/constants';
import {
  JOIN_AS_CLIENT_BUTTON,
  JOIN_AS_CLIENT_HINT,
  JOIN_AS_CLIENT_LOADING,
  JOIN_AS_CLIENT_MEETING_LABEL,
  JOIN_AS_CLIENT_NAME_LABEL,
  JOIN_AS_CLIENT_PASSWORD_LABEL,
  JOIN_AS_CLIENT_TITLE,
  JWT_MISSING_MESSAGE,
  JWT_MISSING_TITLE,
  PLATE_SHADOW,
} from '../constants';

// hooks
import { useJoinZoomAsClient } from '../hooks/useJoinZoomAsClient';

// types
import type { JoinMeetingParamsType } from '../types';

type JoinClientApiType = {
  isJoining: boolean;
  isSdkReady: boolean;
  joinAsClient: (params: JoinMeetingParamsType) => Promise<void>;
};

type JoinZoomAsClientBlockPropsType = {
  displayName: string;
  canUseZoomSdk: boolean;
};

type JoinFieldPropsType = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'number-pad';
  autoCapitalize?: 'none' | 'words';
};

function JoinField({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  autoCapitalize = 'none',
}: JoinFieldPropsType) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldHeader}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
      />
    </View>
  );
}

function JoinZoomSdkBridge({
  children,
}: {
  children: (joinClient: JoinClientApiType) => ReactNode;
}) {
  const joinClient = useJoinZoomAsClient({ canUseZoomSdk: true });
  return children(joinClient);
}

function JoinZoomAsClientCard({
  displayName,
  joinClient,
}: {
  displayName: string;
  joinClient: JoinClientApiType | null;
}) {
  const [userName, setUserName] = useState(displayName);
  const [meetingValue, setMeetingValue] = useState('');
  const [password, setPassword] = useState('');

  // Keep the join name in sync with the logged-in student.
  useEffect(() => {
    if (!displayName) {
      return;
    }

    setUserName(displayName);
  }, [displayName]);

  const isSubmitDisabled = useMemo(
    () =>
      Boolean(joinClient?.isJoining) ||
      userName.trim().length === 0 ||
      meetingValue.trim().length === 0,
    [joinClient?.isJoining, meetingValue, userName]
  );
  const submitOpacity = Number(!isSubmitDisabled) * 0.4 + 0.6;
  const submitTitle = joinClient?.isJoining
    ? JOIN_AS_CLIENT_LOADING
    : JOIN_AS_CLIENT_BUTTON;

  const handleJoinPress = useCallback(() => {
    if (isSubmitDisabled) {
      return;
    }

    if (!joinClient) {
      Alert.alert(JWT_MISSING_TITLE, JWT_MISSING_MESSAGE);
      return;
    }

    void joinClient.joinAsClient({
      userName: userName.trim(),
      meetingNumber: meetingValue.trim(),
      password,
    });
  }, [isSubmitDisabled, joinClient, meetingValue, password, userName]);

  return (
    <View style={styles.plate}>
      <Text style={styles.title}>{JOIN_AS_CLIENT_TITLE}</Text>
      <Text style={styles.hint}>{JOIN_AS_CLIENT_HINT}</Text>
      <JoinField
        label={JOIN_AS_CLIENT_NAME_LABEL}
        value={userName}
        onChangeText={setUserName}
        autoCapitalize="words"
      />
      <JoinField
        label={JOIN_AS_CLIENT_MEETING_LABEL}
        value={meetingValue}
        onChangeText={setMeetingValue}
      />
      <JoinField
        label={JOIN_AS_CLIENT_PASSWORD_LABEL}
        value={password}
        onChangeText={setPassword}
      />
      <Pressable
        onPress={handleJoinPress}
        disabled={isSubmitDisabled}
        style={[styles.button, { opacity: submitOpacity }]}
      >
        <Text style={styles.buttonLabel}>{submitTitle}</Text>
      </Pressable>
    </View>
  );
}

export function JoinZoomAsClientBlock({
  displayName,
  canUseZoomSdk,
}: JoinZoomAsClientBlockPropsType) {
  if (!canUseZoomSdk) {
    return (
      <JoinZoomAsClientCard displayName={displayName} joinClient={null} />
    );
  }

  return (
    <JoinZoomSdkBridge>
      {(joinClient) => (
        <JoinZoomAsClientCard
          displayName={displayName}
          joinClient={joinClient}
        />
      )}
    </JoinZoomSdkBridge>
  );
}

const styles = StyleSheet.create({
  plate: {
    marginTop: 15,
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderCurve: 'continuous',
    backgroundColor: '#fff',
    boxShadow: PLATE_SHADOW,
    gap: 12,
  },
  title: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    color: '#000',
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    color: MEET_APP_LABEL,
  },
  field: {
    position: 'relative',
    minHeight: 61,
    justifyContent: 'flex-end',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 10,
    backgroundColor: MEET_APP_FIELD_BG,
  },
  fieldHeader: {
    position: 'absolute',
    top: 8,
    left: 25,
    fontSize: 12,
    lineHeight: 14,
    color: MEET_APP_LABEL,
  },
  fieldInput: {
    padding: 0,
    margin: 0,
    fontSize: 16,
    lineHeight: 19,
    color: '#000',
  },
  button: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    backgroundColor: MEET_APP_GREEN,
    alignItems: 'center',
  },
  buttonLabel: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    color: '#fff',
  },
});
