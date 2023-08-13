import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BatchNumbers } from "src/Entities/BatchNumbers.Entity";
import { Profile } from "src/Entities/Profile.entity";
import { Role } from "src/Entities/Role.entity";
import { Supplier } from "src/Entities/Supplier.entity";
import { UserEntity } from "src/Entities/User.entity";
import { Purchases } from "src/Entities/purchases.entity";
import { Sale } from "src/Entities/sales.entity";
import { Product } from '../Entities/Product.entity';
@Global()
@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: 'localhost',
            port: 3306,
            username: 'root',
            password: '@Devtech@21',
            database: 'nest_js',
            entities: [Product, UserEntity, Purchases, Sale, Supplier, Profile, BatchNumbers, Role],
            synchronize: true,
        })
    ]
})
export class DatabaseConnection { }