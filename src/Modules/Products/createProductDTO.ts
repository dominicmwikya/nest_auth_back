
import { IsInt, IsString } from 'class-validator';
import { UserEntity } from "src/Entities/User.entity";
export class ProductInterface {
  id: number;
  name: string;
  category: string;
  min_qty: number;
  qty: number;
  users: UserEntity;

}



export class createProductDTO {
  @IsString()
  name: string;

  description: string;
  @IsString()
  sku: string;

  category: string;

  @IsInt()
  min_qty: number;

  qty: number;

}
