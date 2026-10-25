export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  firstNameShort: string;
  lastNameShort: string;
  fullName: string;
  initials: string;
  emailVerified: boolean;
  roles: string[];
}

export const EMPTY_PROFILE: UserProfile = {
  userId: '',
  username: '',
  email: '',
  firstName: '',
  lastName: '',
  firstNameShort: '',
  lastNameShort: '',
  fullName: '',
  initials: '',
  emailVerified: false,
  roles: [],
};
