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

import { CategoryDocuments } from './categories.entities';

@Entity({ name: 'produk' })
export class ProductDocuments {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  kode_produk: string;

  @Column({ nullable: false })
  category_id: number;

  @ManyToOne(() => CategoryDocuments, (category) => category.id, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: CategoryDocuments;

  @Column()
  name?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ type: 'float', default: 0 })
  harga_beli?: number;

  @Column({ type: 'float', default: 0 })
  harga_jual?: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @Column({ type: 'int', default: 1 })
  stok: number;

  @Column({ type: 'int', default: 0 })
  min_stok: number;

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

  constructor(init?: Partial<ProductDocuments>) {
    Object.assign(this, init);
  }
}
