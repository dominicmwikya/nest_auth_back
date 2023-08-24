import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchNumbers } from './Entities/BatchNumbers';
import { Product } from './Entities/Product.entity';
import { Profile } from './Entities/Profile.entity';
import { Purchases } from './Entities/Purchases.entity';
import { Role } from './Entities/Role.entity';
import { Supplier } from './Entities/Supplier.entity';
import { UserEntity } from './Entities/User.entity';
import { Sale } from './Entities/sales.entity';
import { AuthModule } from './Modules/Auth/AuthModule';
import { BatchModule } from './Modules/Batchs/BatchModule';
import { EmailModule } from './Modules/Email/Email.Module';
import { ProductModule } from './Modules/Products/ProductModule';
import { PurchaseModule } from './Modules/Purchases/PurchaseModule';
import { SalesModule } from './Modules/Sales/SalesModule';
import { SupplierModule } from './Modules/Suppliers/SupplierModule';
import { UsersModule } from './Modules/Users/UsersModule';
@Module({
  imports: [
    ProductModule,
    AuthModule,
    UsersModule,
    PurchaseModule,
    BatchModule,
    SalesModule,
    SupplierModule,
    EmailModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        return {
          type: 'mysql',
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT) || 3306,
          username: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          entities: [UserEntity, Profile, Product, Purchases, Sale, Role, Supplier, BatchNumbers], // Use the resolved path
          synchronize: true
        };
      }
    })
  ],
})
export class AppModule { }
