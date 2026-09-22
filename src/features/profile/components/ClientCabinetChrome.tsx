// react
import { useCallback, useMemo, type ReactNode } from 'react';

// react-native
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

// constants
import { MEET_APP_GREEN, MEET_APP_LABEL } from '@/features/auth/constants';
import {
  BALANCE_HEADER,
  BOTTOM_NAV_SHADOW,
  HINT_ADDITIONAL_PHONE,
  MENU_BORDER,
  MORE_MENU_ITEMS,
  NAV_CALENDAR_TITLE,
  NAV_CHATS_TITLE,
  NAV_HOME_TITLE,
  NAV_MORE_TITLE,
  NAV_PROFILE_TITLE,
  REPLENISH_TITLE,
} from '../constants';

// utils
import { getHoursLabel } from '../utils/formatProfile';

// types
import type { CabinetTabType } from '../types';

type ProfileBalanceBarPropsType = {
  hours: number;
  canReplenish: boolean;
  isAdditionalPhoneLogin: boolean;
};

type ClientBottomNavPropsType = {
  activeTab: CabinetTabType;
  isMoreOpen: boolean;
  onTabPress: (tab: CabinetTabType) => void;
  onMorePress: VoidFunction;
  onMoreClose: VoidFunction;
  onLogout: VoidFunction;
};

type NavItemPropsType = {
  title: string;
  isActive: boolean;
  onPress?: VoidFunction;
  icon: ReactNode;
};

function HomeIcon({ isActive }: { isActive: boolean }) {
  const color = isActive ? MEET_APP_GREEN : MEET_APP_LABEL;
  return (
    <View style={iconStyles.box}>
      <View style={[iconStyles.roof, { borderBottomColor: color }]} />
      <View style={[iconStyles.house, { borderColor: color }]} />
    </View>
  );
}

function ChatsIcon({ isActive }: { isActive: boolean }) {
  const color = isActive ? MEET_APP_GREEN : MEET_APP_LABEL;
  return (
    <View style={iconStyles.box}>
      <View style={[iconStyles.bubble, { borderColor: color }]} />
      <View style={[iconStyles.bubbleSmall, { borderColor: color }]} />
    </View>
  );
}

function ProfileIcon({ isActive }: { isActive: boolean }) {
  const color = isActive ? MEET_APP_GREEN : MEET_APP_LABEL;
  return (
    <View style={iconStyles.box}>
      <View style={[iconStyles.head, { borderColor: color }]} />
      <View style={[iconStyles.shoulders, { borderColor: color }]} />
    </View>
  );
}

function CalendarIcon({ isActive }: { isActive: boolean }) {
  const color = isActive ? MEET_APP_GREEN : MEET_APP_LABEL;
  return (
    <View style={[iconStyles.calendar, { borderColor: color }]}>
      <View style={[iconStyles.calendarBar, { backgroundColor: color }]} />
    </View>
  );
}

function MoreIcon({ isActive }: { isActive: boolean }) {
  const color = isActive ? MEET_APP_GREEN : '#000';
  return (
    <View style={iconStyles.hamburger}>
      <View style={[iconStyles.hamburgerBar, { backgroundColor: color }]} />
      <View style={[iconStyles.hamburgerBar, { backgroundColor: color }]} />
      <View style={[iconStyles.hamburgerBar, { backgroundColor: color }]} />
    </View>
  );
}

function NavItem({ title, isActive, onPress, icon }: NavItemPropsType) {
  const titleColor = isActive ? '#000' : MEET_APP_LABEL;

  return (
    <Pressable onPress={onPress} style={styles.navItem}>
      {icon}
      <Text style={[styles.navTitle, { color: titleColor }]}>{title}</Text>
    </Pressable>
  );
}

export function ProfileBalanceBar({
  hours,
  canReplenish,
  isAdditionalPhoneLogin,
}: ProfileBalanceBarPropsType) {
  const hoursLabel = getHoursLabel(hours);
  const replenishOpacity = Number(canReplenish) * 0.35 + 0.65;
  const hintView = useMemo(() => {
    if (!isAdditionalPhoneLogin) {
      return null;
    }

    return <Text style={styles.hint}>{HINT_ADDITIONAL_PHONE}</Text>;
  }, [isAdditionalPhoneLogin]);

  return (
    <View style={styles.balanceBar}>
      <Text style={styles.balanceText}>
        {BALANCE_HEADER}: {hours} {hoursLabel}
      </Text>
      <Pressable
        disabled={!canReplenish}
        style={[styles.replenishButton, { opacity: replenishOpacity }]}
      >
        <Text style={styles.replenishLabel}>{REPLENISH_TITLE}</Text>
      </Pressable>
      {hintView}
    </View>
  );
}

export function ClientBottomNav({
  activeTab,
  isMoreOpen,
  onTabPress,
  onMorePress,
  onMoreClose,
  onLogout,
}: ClientBottomNavPropsType) {
  const handleItemPress = useCallback(
    (itemId: string, isLogout: boolean) => {
      if (isLogout) {
        onLogout();
      } else if (itemId === 'profile') {
        onTabPress('profile');
      }
      onMoreClose();
    },
    [onLogout, onMoreClose, onTabPress]
  );
  const handleProfilePress = useCallback(() => {
    onTabPress('profile');
  }, [onTabPress]);

  const handleCalendarPress = useCallback(() => {
    onTabPress('calendar');
  }, [onTabPress]);
  const isProfileActive = activeTab === 'profile' && !isMoreOpen;
  const isCalendarActive = activeTab === 'calendar' && !isMoreOpen;
  const menuItemsView = useMemo(
    () =>
      MORE_MENU_ITEMS.map((item) => {
        const isActive = item.id === 'profile' && activeTab === 'profile';

        return (
          <Pressable
            key={item.id}
            onPress={() => handleItemPress(item.id, item.isLogout)}
            style={styles.menuItem}
          >
            <Text style={[styles.menuItemTitle, isActive && styles.menuItemActive]}>
              {item.title}
            </Text>
            <View style={styles.menuArrow} />
          </Pressable>
        );
      }),
    [activeTab, handleItemPress]
  );

  return (
    <View style={styles.navWrap}>
      <View style={styles.navRow}>
        <NavItem
          title={NAV_HOME_TITLE}
          isActive={false}
          icon={<HomeIcon isActive={false} />}
        />
        <NavItem
          title={NAV_CHATS_TITLE}
          isActive={false}
          icon={<ChatsIcon isActive={false} />}
        />
        <NavItem
          title={NAV_PROFILE_TITLE}
          isActive={isProfileActive}
          onPress={handleProfilePress}
          icon={<ProfileIcon isActive={isProfileActive} />}
        />
        <NavItem
          title={NAV_CALENDAR_TITLE}
          isActive={isCalendarActive}
          onPress={handleCalendarPress}
          icon={<CalendarIcon isActive={isCalendarActive} />}
        />
        <NavItem
          title={NAV_MORE_TITLE}
          isActive={isMoreOpen}
          onPress={onMorePress}
          icon={<MoreIcon isActive={isMoreOpen} />}
        />
      </View>
      <Modal
        visible={isMoreOpen}
        transparent
        animationType="slide"
        onRequestClose={onMoreClose}
      >
        <View style={styles.menuOverlay}>
          <Pressable style={styles.menuBackdrop} onPress={onMoreClose} />
          <View style={styles.menuSheet}>{menuItemsView}</View>
        </View>
      </Modal>
    </View>
  );
}

const iconStyles = StyleSheet.create({
  box: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  roof: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginBottom: -1,
  },
  house: {
    width: 14,
    height: 10,
    borderWidth: 2,
    borderTopWidth: 0,
  },
  bubble: {
    width: 16,
    height: 12,
    borderWidth: 2,
    borderRadius: 6,
    position: 'absolute',
    top: 4,
    left: 2,
  },
  bubbleSmall: {
    width: 12,
    height: 9,
    borderWidth: 2,
    borderRadius: 5,
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  head: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    marginBottom: 2,
  },
  shoulders: {
    width: 16,
    height: 8,
    borderWidth: 2,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 0,
  },
  calendar: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderRadius: 3,
    overflow: 'hidden',
  },
  calendarBar: {
    height: 4,
  },
  hamburger: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    gap: 3,
  },
  hamburgerBar: {
    height: 2,
    borderRadius: 10,
  },
});

const styles = StyleSheet.create({
  balanceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingVertical: 8,
    minHeight: 40,
    backgroundColor: '#fff',
    gap: 8,
  },
  balanceText: {
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '400',
    color: '#000',
    marginRight: 8,
  },
  replenishButton: {
    minWidth: 119,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 30,
    backgroundColor: MEET_APP_GREEN,
    alignItems: 'center',
  },
  replenishLabel: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '700',
  },
  hint: {
    width: '100%',
    fontSize: 12,
    lineHeight: 14,
    color: MEET_APP_LABEL,
  },
  navWrap: {
    backgroundColor: '#fff',
    boxShadow: BOTTOM_NAV_SHADOW,
    paddingTop: 12,
    paddingBottom: process.env.EXPO_OS === 'ios' ? 28 : 16,
    paddingHorizontal: 5,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  navItem: {
    width: '20%',
    maxWidth: 74,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 5,
  },
  navTitle: {
    marginTop: 7,
    fontSize: 12,
    lineHeight: 12,
    textAlign: 'center',
  },
  menuOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  menuBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  menuSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: MENU_BORDER,
  },
  menuItemTitle: {
    fontSize: 16,
    lineHeight: 21,
    color: MEET_APP_LABEL,
  },
  menuItemActive: {
    color: '#000',
  },
  menuArrow: {
    width: 7,
    height: 13,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#000',
    transform: [{ rotate: '45deg' }],
  },
});
