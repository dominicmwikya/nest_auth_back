import { Module } from '@nestjs/common';
import { ProductModule } from './Modules/Products/ProductModule';
import { DatabaseConnection } from './Database/dbconnection';
import { AuthModule } from './Modules/Auth/AuthModule';
@Module({
  imports: [
    ProductModule,
    AuthModule,
    DatabaseConnection
  ], //other modules that this module depends on
  controllers: [],
  providers: [],
})
export class AppModule {}
