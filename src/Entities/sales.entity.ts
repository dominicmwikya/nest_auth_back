import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './Product.entity';

@Entity()
export class Sale {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  customer_name!: string;
  @Column()
   quantity!:number;
 
   @Column({type: 'decimal', precision: 10, scale: 2})
   price!:number;

   @Column({type: 'decimal', precision: 10, scale: 2})
    subTotal!:number;

    @Column({type:'date'})
    sell_date!:Date;
    @Column()
    payment_mode!:string;
    
  @ManyToOne(() => Product, product => product.sales, {onDelete:'CASCADE'})
  @JoinColumn()
  products!: Product;
}
