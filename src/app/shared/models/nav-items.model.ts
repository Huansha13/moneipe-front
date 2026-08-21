export interface NavItem {
  id: number,
  icon: string;
  label?: string;
  labelKey?: string;
  route: string;
  badge?: string;
  roles?: string[];
}

export const NAV_ITEMS: NavItem[] = [
  {id: 1, icon: 'dashboard', labelKey: 'NAV.DASHBOARD', route: '/dashboard' },
  {id: 2, icon: 'account_balance', labelKey: 'NAV.ACCOUNTS', route: '/accounts' },
  {id: 3, icon: 'trending_up', labelKey: 'NAV.INVESTMENTS', route: '/investments' },
  {id: 4, icon: 'supervised_user_circle', labelKey: 'NAV.MY_GROUPS', badge: '3', route: '/groups' },
  {id: 5, icon: 'manage_accounts', labelKey: 'NAV.USERS', route: '/users', roles: ['manage-users'] },
];
