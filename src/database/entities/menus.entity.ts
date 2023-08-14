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

  @Column({ length: 45, nullable: true })
  label?: string;

  @Column({ length: 200, nullable: true })
  api_url?: string;

  @Column({ type: 'tinyint', default: 1 })
  sequence?: number;

  @Column({ nullable: true })
  parent_id?: number;

  @Column({ default: 0 })
  level?: number;

  @Column({ default: true })
  is_active?: boolean;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  created_at?: Date | string;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at?: Date | string;

  @DeleteDateColumn({ type: 'timestamp' })
  deleted_at?: Date | string;

  constructor(init?: Partial<AppmenusDocument>) {
    Object.assign(this, init);
  }
}
