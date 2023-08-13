import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BatchNumbers } from "src/Entities/BatchNumbers.Entity";
import { Product } from "src/Entities/Product.entity";
import { Supplier } from "src/Entities/Supplier.entity";
import { Purchases } from "src/Entities/purchases.entity";
import { BatchModule } from "../Batchs/BatchModule";
import { BatchService } from "../Batchs/BatchService";
import { ProductModule } from "../Products/ProductModule";
import { ProductService } from "../Products/ProductService";
import { UsersModule } from "../Users/UsersModule";
import { PurchaseController } from "./PurchaseController";
import { PurchaseService } from "./PurchaseService";
@Module({
    imports: [ProductModule, UsersModule, BatchModule, TypeOrmModule.forFeature([Purchases, Product, Supplier, BatchNumbers])],
    controllers: [PurchaseController],
    providers: [PurchaseService, ProductService, BatchService],
    exports: [PurchaseModule, PurchaseService]
})
export class PurchaseModule { }