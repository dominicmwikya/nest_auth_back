import { BaseEntity, Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './Product.entity';
import { Profile } from './Profile.entity';
import { Purchases } from './Purchases.entity';
import { Role } from './Role.entity';
import { Sale } from './sales.entity';

@Entity()
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  username!: string;

  @Column({ unique: true })
  email!: string;
  @Column({ default: '0712162619' })
  phone!: number;
  @Column()
  password!: string;

  @Column({ default: 'Active' })
  status!: string;

  @Column({ default: 'user' })
  role!: string;
  @Column()
  code!: string;
  @Column({ default: false })
  activation!: boolean;

  @Column({ default: false })
  codeSent!: boolean

  @OneToOne(() => Profile)
  @JoinColumn()
  profile!: Profile;

  @OneToMany(() => Purchases, purchase => purchase.user)
  purchases!: Purchases[];
  @OneToMany(() => Sale, sales => sales.user)
  sales!: Sale[];


  // Define the many-to-many relationship with the roles table
  @ManyToMany(() => Role, role => role.users)
  @JoinTable()
  roles!: Role[];

  @OneToMany(() => Product, product => product.users)
  products!: Product[]

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}