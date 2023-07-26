import { MiddlewareConsumer, Module, NestModule  } from "@nestjs/common";
import { ProductService } from "./ProductService";
import {ProductController} from './ProductController';
import { verifyJWTtoken } from 'src/Middlwares/verifyJWTtoken';
@Module({
 controllers:[ProductController],
 providers:[ProductService],
 exports:[ProductService]
})
export class ProductModule implements NestModule{
    configure(consumer: MiddlewareConsumer) {
        consumer
           .apply(verifyJWTtoken)
           .forRoutes('products');
    }
}