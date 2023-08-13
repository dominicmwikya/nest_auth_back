import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { format } from 'date-fns';
import { BatchNumbers } from "src/Entities/BatchNumbers.Entity";
import { Injectable } from "@nestjs/common";
@Injectable()
export class BatchService {
    constructor(@InjectRepository(BatchNumbers) private batchRepository: Repository<BatchNumbers>) { }
    async generateBatchNumber() {
        const newBatch = await this.batchRepository.save({});
        const currentDate = new Date();
        const formattedDate = format(currentDate, "yyyyMMdd");
        const batchId = newBatch.id;
        const bactNumber = `BATCH${formattedDate}${batchId}`;
        return bactNumber;
    }
}