import { Module } from "@nestjs/common";
import { ProductService } from "./ProductService";
import {ProductController} from './ProductController';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "src/Entities/Product.entity";
@Module({
    imports:[TypeOrmModule.forFeature([Product])],
 controllers:[ProductController],
 providers:[ProductService],
 exports:[ProductService]
})
export class ProductModule {}