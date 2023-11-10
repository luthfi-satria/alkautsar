import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'omset' })
export class OmsetDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  bln?: number;

  @Column({ nullable: true })
  thn?: number;

  @Column({ type: 'float', default: 0 })
  omset_grosir?: number;

  @Column({ type: 'float', default: 0 })
  omset_kredit?: number;

  @Column({ type: 'float', default: 0 })
  total_omset?: number;

  @CreateDateColumn({
    type: 'timestamp',
    select: true,
  })
  created_at?: Date | string;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
    select: true,
  })
  updated_at?: Date | string;

  constructor(init?: Partial<OmsetDocument>) {
    Object.assign(this, init);
  }
}
