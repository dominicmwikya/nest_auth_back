import { Injectable } from "@nestjs/common";
import { createProductDTO } from "./createProductDTO";
@Injectable()
export class ProductService{
  
     findAll(){
        const message = "find product results";
        const products = {
           product1:{
               name:"Product1",
               qty:100
           }, 
           product2:{
            name:"product2",
            qty:70
           }
        }
          return {products, message};
    }

    createProduct(data: createProductDTO){
        return {
            data
        }
    }
}
