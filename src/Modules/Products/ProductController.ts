
import {Controller, Post, Get  }  from '@nestjs/common';
import {ProductService}  from './ProductService';

@Controller('products')

export class ProductController{
    constructor(private productService: ProductService){}


    @Get()
    async getProducts(){
       const result =  this.productService.findAll();
        console.log(result)
       return result;
    }

    @Post()
    async create(){
        const data={
            name:"Product 1",
            qty:500,
            min_qty:20
        }
        const response = this.productService.createProduct(data);

        console.log(response);
    }
}
