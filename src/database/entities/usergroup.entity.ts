import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserDocuments } from './users.entity';
import { UserType } from '../../hash/guard/interface/user.interface';
import { AccessDocument } from './usergroup_access.entity';

@Entity({ name: 'usergroup' })
export class UsergroupDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name?: string;

  @Column({ type: 'enum', enum: UserType, default: UserType.User })
  level?: UserType;

  @Column()
  is_default?: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at?: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at?: Date;

  @OneToMany(() => UserDocuments, (users) => users.usergroup)
  users: UserDocuments[];

  @OneToMany(() => AccessDocument, (accessmenus) => accessmenus.usergroup)
  accessmenus: AccessDocument[];

  constructor(init?: Partial<UsergroupDocument>) {
    Object.assign(this, init);
  }
}
