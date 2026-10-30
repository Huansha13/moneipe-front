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
  {id: 2, icon: 'receipt_long', labelKey: 'NAV.CONTROLS', route: '/controls' },
/*
  {id: 4, icon: 'supervised_user_circle', labelKey: 'NAV.MY_GROUPS', badge: 'groups', route: '/groups' },
*/
  {id: 5, icon: 'manage_accounts', labelKey: 'NAV.USERS', route: '/users', roles: ['manage-users'] },
];
