import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserType } from '../../hash/guard/interface/user.interface';
import { UsergroupDocument } from './usergroup.entity';
import { UserProfileDocuments } from './profile.entities';

@Entity({ name: 'users' })
export class UserDocuments {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username?: string;

  @Column({ type: 'enum', enum: UserType, default: UserType.User })
  user_type?: UserType;

  @Column()
  usergroup_id?: number;

  @ManyToOne(() => UsergroupDocument, (usergroup) => usergroup.users, {
    eager: true,
  })
  @JoinColumn({ name: 'usergroup_id' })
  usergroup: UsergroupDocument;

  @Column()
  password?: string;

  @Column({ nullable: true })
  token_reset_password: string;

  @OneToOne(() => UserProfileDocuments, (profile) => profile.login_account)
  profile?: UserProfileDocuments;

  @Column({
    type: 'timestamp',
    nullable: true,
    select: false,
  })
  verify_at?: Date | string;

  @CreateDateColumn({
    type: 'timestamp',
    select: false,
  })
  created_at?: Date | string;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
    select: false,
  })
  updated_at?: Date | string;

  @DeleteDateColumn({
    type: 'timestamp',
    nullable: true,
    select: false,
  })
  deleted_at?: Date | string;

  constructor(init?: Partial<UserDocuments>) {
    Object.assign(this, init);
  }
}
