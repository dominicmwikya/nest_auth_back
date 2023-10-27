
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Sale } from './sales.entity';

@Entity()
export class Receipt {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    customer_name: string;
    @Column({ default: 0.00 })
    grantTotal: number;
    @Column()
    totalItems: number;
    @Column()
    amount: number;
    @Column()
    balance: number;
    @Column({ nullable: true })
    receiptNumber: string;
    @Column()
    status: string;

    @OneToMany(() => Sale, sales => sales.receipt)
    sales: Sale[];
}
