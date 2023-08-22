import { BaseEntity, Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './Product.entity';
import { Purchases } from './Purchases.entity';

@Entity()
export class Supplier extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  phone!: string;

  @Column()
  address!: string;
  @OneToMany(() => Product, (product) => product.supplier)
  products!: Product[];

  @ManyToMany(() => Purchases, purchase => purchase.supplier)
  purchases!: Purchases[]


  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}