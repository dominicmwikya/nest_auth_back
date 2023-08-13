import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm'

@Entity()
export class Profile{
    @PrimaryGeneratedColumn()
     id!:number;
    @Column()
     first_name!:string;
    @Column()
     last_name!:string;
    @Column()
     avator!:string;
    @Column()
     gender!:string;
    @Column({type:'text'})
      bio!:string;
    
}