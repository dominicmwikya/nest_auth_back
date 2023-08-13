import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, OneToOne, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Profile } from './Profile.entity';
import { Role } from './Role.entity';
import { Product } from './Product.entity';
import { Purchases } from './purchases.entity';

@Entity()
export class UserEntity {
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