import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './User.entity';
import { Supplier } from './Supplier.entity';
import { Purchases } from './purchases.entity';
import { Sale } from './sales.entity';
@Entity()
export class Product {
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