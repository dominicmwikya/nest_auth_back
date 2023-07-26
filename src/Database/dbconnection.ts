import { TypeOrmModule } from "@nestjs/typeorm";
import { Module , Global} from "@nestjs/common";
import {Product} from '../Entities/Product';
@Global()
@Module({
    imports:[
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: 'localhost',
            port: 3306,
            username: 'root',
            password: '@Devtech@21',
            database: 'nest_js',
            entities: [Product],
            synchronize: true,
        })
    ]
})
export class DatabaseConnection{}