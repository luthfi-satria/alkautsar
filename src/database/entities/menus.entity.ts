import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'appmenus' })
export class AppmenusDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 45 })
  name?: string;

  @Column({ length: 45 })
  label?: string;

  @Column({ length: 200 })
  api_url?: string;

  @Column({ type: 'tinyint' })
  sequence?: number;

  @Column()
  parent_id?: number;

  @Column()
  level?: number;

  @Column()
  is_active?: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at?: Date | string;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at?: Date | string;

  @DeleteDateColumn({ type: 'timestamp' })
  deleted_at?: Date | string;

  constructor(init?: Partial<AppmenusDocument>) {
    Object.assign(this, init);
  }
}
