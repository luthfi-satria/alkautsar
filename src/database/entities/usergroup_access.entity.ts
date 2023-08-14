import { UsergroupDocument } from './usergroup.entity';
import { AppmenusDocument } from './menus.entity';
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

@Entity({ name: 'user_access' })
export class AccessDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  usergroup_id: number;

  @ManyToOne(() => UsergroupDocument, (group) => group.id)
  @JoinColumn({ name: 'usergroup_id' })
  usergroups?: UsergroupDocument;

  @Column()
  level?: string;

  @Column()
  menu_id?: number;

  @ManyToOne(() => AppmenusDocument, (appmenu) => appmenu.id)
  @JoinColumn({ name: 'menu_id' })
  menus?: AppmenusDocument;

  @Column({ type: 'json' })
  permissions?: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at?: Date | string;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at?: Date | string;

  @DeleteDateColumn({ type: 'timestamp' })
  deleted_at?: Date | string;

  constructor(init?: Partial<AccessDocument>) {
    Object.assign(this, init);
  }
}
