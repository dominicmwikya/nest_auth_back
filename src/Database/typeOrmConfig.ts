import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { BatchNumbers } from "src/Entities/BatchNumbers.entity";
import { Product } from "src/Entities/Product.entity";
import { Profile } from "src/Entities/Profile.entity";
import { Purchases } from "src/Entities/Purchases.entity";
import { Role } from "src/Entities/Role.entity";
import { Supplier } from "src/Entities/Supplier.entity";
import { UserEntity } from "src/Entities/User.entity";
import { Sale } from "src/Entities/sales.entity";
export const typeOrmConfig: TypeOrmModuleOptions = {
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '@Devtech@21',
    database: 'nest_js',
    entities: [Product, UserEntity, Purchases, Sale, Supplier, Profile, BatchNumbers, Role],
    synchronize: true,
    logging: true,

}