import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './Product.entity';
import { Supplier } from './Supplier.entity';
import { UserEntity } from './User.entity';
import { Sale } from './sales.entity';
@Entity()
export class Purchases extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@ManyToOne(() => Product, product => product.purchases, { onDelete: 'CASCADE' })
	@JoinColumn()
	product!: Product;

	@ManyToOne(() => Supplier, supplier => supplier.purchases)
	supplier!: Supplier;

	@ManyToOne(() => UserEntity, user => user.purchases)
	user!: UserEntity;

	@ManyToOne(() => Sale, sale => sale.purchases)
	@JoinColumn()
	sale!: Sale;

	@Column({ type: 'int' })
	purchase_Qty!: number;

	@Column({ type: 'decimal', precision: 10, scale: 2 })
	purchase_Price!: number;

	@Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
	sale_Price!: number;

	@Column()
	purchase_Total!: number;

	@Column({ default: 0 })
	soldQty!: number;

	@Column()
	batchcode!: string;
	@Column({ default: 0 })
	flag!: number;
	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	createdAt!: Date;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
	updatedAt!: Date;
}