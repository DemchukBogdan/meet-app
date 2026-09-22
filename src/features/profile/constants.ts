import type { MoreMenuItemType } from './types';

export const PROFILE_PAGE_TITLE = 'Профіль клієнта';
export const PHONE_FIELD_HEADER = 'Телефон';
export const EMAIL_FIELD_HEADER = 'E-mail';
export const PASSWORD_FIELD_HEADER = 'Пароль';
export const PASSWORD_PLACEHOLDER = '•••••••••';
export const BALANCE_HEADER = 'Баланс';
export const REPLENISH_TITLE = 'Поповнити';
export const YOUR_PACKAGES_TITLE = 'Ваші пакети';
export const PACKAGES_BALANCE_LABEL = 'баланс';
export const HINT_ADDITIONAL_PHONE =
  'Ця дія доступна лише з основного номера телефону';
export const PROFILE_LOAD_ERROR =
  'Не вдалося завантажити профіль. Перевірте інтернет і спробуйте ще раз.';
export const PROFILE_RETRY_TITLE = 'Спробувати ще раз';
export const LOGOUT_TITLE = 'Вийти';

export const NAV_HOME_TITLE = 'Головна';
export const NAV_CHATS_TITLE = 'Чати';
export const NAV_PROFILE_TITLE = 'Профіль';
export const NAV_CALENDAR_TITLE = 'Календар';
export const NAV_MORE_TITLE = 'Інше';

export const MORE_MENU_ITEMS: MoreMenuItemType[] = [
  { id: 'profile', title: NAV_PROFILE_TITLE, isLogout: false },
  { id: 'awards', title: 'Мої нагороди', isLogout: false },
  { id: 'club', title: 'Розмовний клуб з англійської', isLogout: false },
  { id: 'payments', title: 'Історія платежів', isLogout: false },
  { id: 'faq', title: 'FAQ / Питання та відповіді', isLogout: false },
  { id: 'settings', title: 'Налаштування', isLogout: false },
  { id: 'logout', title: LOGOUT_TITLE, isLogout: true },
];

export const AVATAR_SIZE = 100;
export const AVATAR_FONT_SIZE = 50;
export const AVATAR_BG = '#F5F5F5';
export const AVATAR_COLOR = '#353535';
export const PLATE_SHADOW = '0 0 12px 2px rgba(0, 0, 0, 0.1)';
export const BOTTOM_NAV_SHADOW = '0 0 12px 4px rgba(0, 0, 0, 0.15)';
export const MENU_BORDER = '#E3E3E3';
export const HOURS_COUNTS: [string, string, string] = [
  'година',
  'години',
  'годин',
];
