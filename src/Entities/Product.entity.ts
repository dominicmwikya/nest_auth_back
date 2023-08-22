import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Purchases } from './Purchases.entity';
import { Supplier } from './Supplier.entity';
import { UserEntity } from './User.entity';
import { Sale } from './sales.entity';
@Entity()
export class Product extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column()
	name!: string;

	@Column()
	category!: string;

	@Column()
	min_qty!: number;

	@Column({ default: 0 })
	qty!: number;
	@Column({ default: null, nullable: true })
	sku!: string;
	@Column({ default: null, nullable: true })
	description: string;

	@OneToMany(() => Purchases, purchase => purchase.product, { onDelete: 'CASCADE' })
	@JoinColumn()
	purchases!: Purchases[];

	@ManyToOne(() => UserEntity, user => user.products)
	users!: UserEntity

	@Column({ default: 0 })
	flag!: number;

	@OneToMany(() => Sale, sale => sale.products, { onDelete: 'CASCADE' })
	@JoinColumn()
	sales!: Sale[];

	@ManyToOne(() => Supplier, (supplier) => supplier.products, { onDelete: 'CASCADE' })
	@JoinColumn()
	supplier!: Supplier;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	createdAt!: Date;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
	updatedAt!: Date;
}