import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserType } from '../../hash/guard/interface/user.interface';
import { UsergroupDocument } from './usergroup.entity';

@Entity({ name: 'users' })
export class UserDocuments {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name?: string;

  @Column()
  username?: string;

  @Column()
  email?: string;

  @Column()
  phone?: string;

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

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  verify_at?: Date | string;

  @CreateDateColumn({
    type: 'timestamp',
  })
  created_at?: Date | string;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  updated_at?: Date | string;

  @DeleteDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  deleted_at?: Date | string;

  constructor(init?: Partial<UserDocuments>) {
    Object.assign(this, init);
  }
}
