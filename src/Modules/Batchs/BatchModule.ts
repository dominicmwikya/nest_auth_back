import { Module } from "@nestjs/common";
import { BatchController } from "./BatchController";
import { BatchService } from "./BatchService";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BatchNumbers } from "src/Entities/BatchNumbers.Entity";
@Module({
    imports: [TypeOrmModule.forFeature([BatchNumbers])],
    controllers: [BatchController],
    providers: [BatchService],
    exports: [BatchService, BatchModule]
})

export class BatchModule { }