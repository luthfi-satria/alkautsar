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
import { UserProfileDocuments } from './../../database/entities/profile.entities';
import { ProductDocuments } from '../../database/entities/product.entities';

@Entity({ name: 'cart' })
export class CartDocuments {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  user_id: number;

  @ManyToOne(() => UserProfileDocuments, (profile) => profile.user_id, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserProfileDocuments;

  @Column({ nullable: false })
  product_id: number;

  @ManyToOne(() => ProductDocuments, (product) => product.id, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: ProductDocuments;

  @Column({ default: 1 })
  qty: number;

  @Column({ nullable: true })
  catatan?: string;

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

  constructor(init?: Partial<CartDocuments>) {
    Object.assign(this, init);
  }
}
