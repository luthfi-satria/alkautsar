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

@Entity({ name: 'usergroup' })
export class UsergroupDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name?: string;

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

  constructor(init?: Partial<UsergroupDocument>) {
    Object.assign(this, init);
  }
}
