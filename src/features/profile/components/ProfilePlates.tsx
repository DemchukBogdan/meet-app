// react
import { useMemo } from 'react';

// react-native
import { Pressable, StyleSheet, Text, View } from 'react-native';

// constants
import {
  MEET_APP_FIELD_BG,
  MEET_APP_GREEN,
  MEET_APP_LABEL,
} from '@/features/auth/constants';
import {
  AVATAR_BG,
  AVATAR_COLOR,
  AVATAR_FONT_SIZE,
  AVATAR_SIZE,
  EMAIL_FIELD_HEADER,
  PACKAGES_BALANCE_LABEL,
  PASSWORD_FIELD_HEADER,
  PASSWORD_PLACEHOLDER,
  PHONE_FIELD_HEADER,
  PLATE_SHADOW,
  REPLENISH_TITLE,
  YOUR_PACKAGES_TITLE,
} from '../constants';

// utils
import { getHoursLabel } from '../utils/formatProfile';

// components
import { EditIcon } from './EditIcon';

// types
import type { ClientProfileType } from '../types';

type ProfilePlatesPropsType = {
  profile: ClientProfileType;
};

type ContactFieldPropsType = {
  header: string;
  value: string;
  isDisabled: boolean;
};

function ContactField({ header, value, isDisabled }: ContactFieldPropsType) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldHeader}>{header}</Text>
      <Text style={styles.fieldValue} numberOfLines={1}>
        {value}
      </Text>
      <View style={styles.fieldEdit}>
        <EditIcon isDisabled={isDisabled} />
      </View>
    </View>
  );
}

export function ProfilePlates({ profile }: ProfilePlatesPropsType) {
  const canReplenish = useMemo(
    () =>
      !profile.isAdditionalPhoneLogin && profile.fillBalanceOrdersCount > 0,
    [profile.fillBalanceOrdersCount, profile.isAdditionalPhoneLogin]
  );
  const packagesView = useMemo(() => {
    if (profile.packages.length === 0) {
      return null;
    }

    return (
      <View style={styles.packages}>
        <Text style={styles.packagesHeading}>{YOUR_PACKAGES_TITLE}</Text>
        {profile.packages.map((item) => {
          const hoursLabel = getHoursLabel(item.totalBalance);
          const replenishOpacity = Number(canReplenish) * 0.4 + 0.6;

          return (
            <View key={`${item.orderId}-${item.lessonName}`} style={styles.packagePlate}>
              <Text style={styles.packageTitle}>
                ({item.lessonName}) {PACKAGES_BALANCE_LABEL}: {item.totalBalance}{' '}
                {hoursLabel}
              </Text>
              <Pressable
                disabled={!canReplenish}
                style={[styles.replenishButton, { opacity: replenishOpacity }]}
              >
                <Text style={styles.replenishLabel}>{REPLENISH_TITLE}</Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    );
  }, [canReplenish, profile.packages]);

  return (
    <View style={styles.profile}>
      <View style={[styles.plate, styles.avatarPlate]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>{profile.initials}</Text>
        </View>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{profile.name}</Text>
          <EditIcon isDisabled={profile.isAdditionalPhoneLogin} />
        </View>
      </View>
      <View style={[styles.plate, styles.contactsPlate]}>
        <ContactField
          header={PHONE_FIELD_HEADER}
          value={profile.phoneFormatted}
          isDisabled={profile.isAdditionalPhoneLogin}
        />
        <ContactField
          header={EMAIL_FIELD_HEADER}
          value={profile.email}
          isDisabled={profile.isAdditionalPhoneLogin}
        />
        <ContactField
          header={PASSWORD_FIELD_HEADER}
          value={PASSWORD_PLACEHOLDER}
          isDisabled={profile.isAdditionalPhoneLogin}
        />
      </View>
      {packagesView}
    </View>
  );
}

const styles = StyleSheet.create({
  profile: {
    marginHorizontal: -15,
  },
  plate: {
    margin: 15,
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderCurve: 'continuous',
    backgroundColor: '#fff',
    boxShadow: PLATE_SHADOW,
  },
  avatarPlate: {
    alignItems: 'center',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: AVATAR_BG,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarLetter: {
    fontSize: AVATAR_FONT_SIZE,
    lineHeight: AVATAR_FONT_SIZE,
    fontWeight: '700',
    color: AVATAR_COLOR,
  },
  nameRow: {
    width: '100%',
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  name: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '600',
    color: '#000',
  },
  contactsPlate: {
    gap: 15,
  },
  field: {
    position: 'relative',
    minHeight: 61,
    justifyContent: 'flex-end',
    paddingVertical: 14,
    paddingHorizontal: 25,
    paddingRight: 44,
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
  fieldValue: {
    fontSize: 16,
    lineHeight: 19,
    color: '#000',
  },
  fieldEdit: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packages: {
    width: '94%',
    alignSelf: 'center',
    marginTop: 10,
  },
  packagesHeading: {
    marginLeft: 15,
    marginBottom: 5,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '600',
    color: '#000',
    textAlign: 'left',
  },
  packagePlate: {
    marginHorizontal: 15,
    marginVertical: 5,
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderCurve: 'continuous',
    backgroundColor: '#fff',
    boxShadow: PLATE_SHADOW,
    alignItems: 'center',
  },
  packageTitle: {
    fontSize: 16,
    lineHeight: 20,
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
  },
  replenishButton: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 65,
    borderRadius: 25,
    backgroundColor: MEET_APP_GREEN,
  },
  replenishLabel: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    color: '#fff',
  },
});
