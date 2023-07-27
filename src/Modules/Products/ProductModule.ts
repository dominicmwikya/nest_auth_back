import { MiddlewareConsumer, Module, NestModule  } from "@nestjs/common";
import { ProductService } from "./ProductService";
import {ProductController} from './ProductController';
@Module({
 controllers:[ProductController],
 providers:[ProductService],
 exports:[ProductService]
})
export class ProductModule {}