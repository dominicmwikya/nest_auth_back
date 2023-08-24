import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BatchNumbers } from "src/Entities/BatchNumbers";
import { Product } from "src/Entities/Product.entity";
import { Purchases } from "src/Entities/Purchases.entity";
import { BatchModule } from "../Batchs/BatchModule";
import { PurchaseService } from "../Purchases/PurchaseService";
import { ProductController } from './ProductController';
import { ProductService } from "./ProductService";
@Module({
    imports: [TypeOrmModule.forFeature([Product, Purchases, BatchNumbers]), BatchModule],
    controllers: [ProductController],
    providers: [ProductService, PurchaseService],
    exports: [ProductService]
})
export class ProductModule { }