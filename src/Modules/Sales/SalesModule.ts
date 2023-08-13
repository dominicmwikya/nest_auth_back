import { Module } from "@nestjs/common";
import { SaleService } from "./SalesService";
import { SalesController } from "./SalesController";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Sale } from "src/Entities/sales.entity";
import { ProductModule } from "../Products/ProductModule";
import { PurchaseModule } from "../Purchases/PurchaseModule";

@Module({
    imports: [ProductModule, PurchaseModule, TypeOrmModule.forFeature([Sale])],
    controllers: [SalesController],
    providers: [SaleService],
    exports: [SaleService],
})
export class SalesModule { }
