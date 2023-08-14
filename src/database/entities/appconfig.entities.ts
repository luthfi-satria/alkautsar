import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

export enum scopeConfig {
  GLOBAL = 'global',
  SCHEDULLER = 'scheduller',
  PAGINATION = 'pagination',
}

@Entity({ name: 'app_config' })
@Unique('appconfConstraint', ['ref_id'])
export class AppconfigDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  ref_id?: string;

  @Column({ type: 'varchar', length: 20 })
  name?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  desc?: string;

  @Column({
    type: 'enum',
    enum: scopeConfig,
    default: scopeConfig.GLOBAL,
    nullable: true,
  })
  scope?: string;

  @Column({ type: 'json', nullable: true })
  value?: string;

  @Column()
  is_active?: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at?: Date | string;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at?: Date | string;

  @DeleteDateColumn({ type: 'timestamp' })
  deleted_at?: Date | string;

  constructor(init?: Partial<AppconfigDocument>) {
    Object.assign(this, init);
  }
}
