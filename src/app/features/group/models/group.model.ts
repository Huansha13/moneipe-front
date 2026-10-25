export interface GroupMember {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MIEMBRO';
}

export interface Group {
  id: string;
  title: string;
  description: string;
  role: 'ADMIN' | 'MIEMBRO';
  members: GroupMember[];
}
