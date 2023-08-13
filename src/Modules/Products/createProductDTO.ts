
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
  name: string;
  description: string;
  min_qty: number;
  category: string;
  qty: number;
  sku: string;
}
