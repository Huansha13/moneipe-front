export interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: string;
}


export interface PerfilItem {
  navItem: NavItem;
  email: string;
}
