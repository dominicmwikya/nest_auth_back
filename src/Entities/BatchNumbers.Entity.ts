import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BatchNumbers {
    @PrimaryGeneratedColumn()
    id!: number;
}