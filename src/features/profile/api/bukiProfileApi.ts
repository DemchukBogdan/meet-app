// utils
import { getNameInitial } from '../utils/formatProfile';

// types
import type { ClientProfileType } from '../types';

const MOCK_PROFILE_NAME = 'Марія Шевченко';

const MOCK_PROFILE: ClientProfileType = {
  name: MOCK_PROFILE_NAME,
  email: 'maria.shevchenko@example.com',
  phoneFormatted: '+38 (067) 000-00-00',
  initials: getNameInitial(MOCK_PROFILE_NAME),
  balanceHours: 8,
  isAdditionalPhoneLogin: false,
  fillBalanceOrdersCount: 0,
  packages: [
    { orderId: 1, lessonName: 'Англійська мова', totalBalance: 6 },
    { orderId: 2, lessonName: 'Математика', totalBalance: 2 },
  ],
};

export async function getClientProfile(): Promise<ClientProfileType> {
  return MOCK_PROFILE;
}
