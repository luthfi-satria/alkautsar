import { UsergroupDocument } from '../../../database/entities/usergroup.entity';

export enum UserType {
  Owner = 'owner',
  Organisasi = 'organisasi',
  User = 'public',
}

export interface User {
  id: string;
  user_type: UserType;
  usergroup: UsergroupDocument;
}
