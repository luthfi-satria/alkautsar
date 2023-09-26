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
import { UsergroupDocument } from './usergroup.entity';
import { UserProfileDocuments } from './profile.entities';

@Entity({ name: 'users' })
export class UserDocuments {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  username?: string;

  @Column({ type: 'int' })
  usergroup_id?: number;

  @ManyToOne(() => UsergroupDocument, (usergroup) => usergroup.users, {
    eager: true,
  })
  @JoinColumn({ name: 'usergroup_id' })
  usergroup?: UsergroupDocument;

  @Column({ type: 'varchar', length: 200 })
  password?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  token_reset_password?: string;

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

  @OneToOne(() => UserProfileDocuments, (profile) => profile.login_account)
  profile?: UserProfileDocuments;

  constructor(init?: Partial<UserDocuments>) {
    Object.assign(this, init);
  }
}
