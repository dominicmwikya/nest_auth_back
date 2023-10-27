import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './Product.entity';
import { Purchases } from './Purchases.entity';
import { Receipt } from './Receipt.entity';
import { UserEntity } from './User.entity';
@Entity()
export class Sale extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;
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
  @Column({ default: null })
  status!: string;

  @ManyToOne(() => Product, product => product.sales, { onDelete: 'CASCADE' })
  @JoinColumn()
  product!: Product;

  @ManyToOne(() => UserEntity, user => user.sales, { onDelete: 'CASCADE' })
  @JoinColumn()
  user!: UserEntity[];

  @OneToMany(() => Purchases, purchase => purchase.sale)
  purchases!: Purchases[];

  @ManyToOne(() => Receipt, (receipt) => receipt.sales)
  receipt: Receipt;
}
