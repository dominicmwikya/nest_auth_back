import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './Product.entity';
import { Purchases } from './Purchases.entity';
import { UserEntity } from './User.entity';
@Entity()
export class Sale extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  customer_name!: string;
  @Column()
  quantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balance!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  sell_date!: Date;
  // @Column()
  // payment_mode!: string;

  @ManyToOne(() => Product, product => product.sales, { onDelete: 'CASCADE' })
  @JoinColumn()
  products!: Product;

  @ManyToOne(() => UserEntity, user => user.sales, { onDelete: 'CASCADE' })
  @JoinColumn()
  user!: UserEntity[];

  @OneToMany(() => Purchases, purchase => purchase.sale)
  purchases!: Purchases[];
}
