export type ClientProfileType = {
  name: string;
  email: string;
  phoneFormatted: string;
  initials: string;
  balanceHours: number;
  isAdditionalPhoneLogin: boolean;
  fillBalanceOrdersCount: number;
  packages: ProfilePackageType[];
};

export type ProfilePackageType = {
  orderId: number;
  lessonName: string;
  totalBalance: number;
};

export type ClientProfileScreenPropsType = {
  onLogout: VoidFunction;
};

export type MoreMenuItemType = {
  id: string;
  title: string;
  isLogout: boolean;
};

export type CabinetTabType = 'profile' | 'calendar';
