export interface NavItem {
  icon: string;
  label?: string;
  labelKey?: string;
  route: string;
  badge?: string;
  roles?: string[];
}

export const NAV_ITEMS: NavItem[] = [
  { icon: 'dashboard', labelKey: 'NAV.DASHBOARD', route: '/dashboard' },
  { icon: 'account_balance', labelKey: 'NAV.ACCOUNTS', route: '/accounts' },
  { icon: 'trending_up', labelKey: 'NAV.INVESTMENTS', route: '/investments' },
  { icon: 'supervised_user_circle', labelKey: 'NAV.MY_GROUPS', badge: '3', route: '/groups' },
  { icon: 'manage_accounts', labelKey: 'NAV.USERS', route: '/users', roles: ['manage-users'] },
];
