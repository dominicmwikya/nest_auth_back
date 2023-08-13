import { Module } from "@nestjs/common"
import { Supplier } from "src/Entities/Supplier.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SupplierController } from "./SupplierController";
import { SupplierService } from "./SupplierService";

@Module({
    imports: [TypeOrmModule.forFeature([Supplier])],
    controllers: [SupplierController],
    providers: [SupplierService],
    exports: [SupplierService]
})
export class SupplierModule { }