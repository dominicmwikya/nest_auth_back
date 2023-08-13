import { Module } from '@nestjs/common';
import { ProductModule } from './Modules/Products/ProductModule';
import { DatabaseConnection } from './Database/dbconnection';
import { AuthModule } from './Modules/Auth/AuthModule';
import { UsersModule } from './Modules/Users/UsersModule';
import { PurchaseModule } from './Modules/Purchases/PurchaseModule';
import { BatchModule } from './Modules/Batchs/BatchModule';
import { SalesModule } from './Modules/Sales/SalesModule';
import { SupplierModule } from './Modules/Suppliers/SupplierModule';
@Module({
  imports: [
    ProductModule,
    AuthModule,
    UsersModule,
    PurchaseModule,
    BatchModule,
    SalesModule,
    SupplierModule,
    DatabaseConnection
  ], //other modules that this module depends on
  controllers: [],
  providers: [],
})
export class AppModule { }
