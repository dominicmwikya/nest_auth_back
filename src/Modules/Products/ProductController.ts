
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, ParseIntPipe, Post, Put, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Product } from 'src/Entities/Product.entity';
import { AuthGuard } from '../Auth/authGuard';
import { ProductService } from './ProductService';
import { createProductDTO } from './createProductDTO';

@Controller('products')
export class ProductController {
	constructor(private productService: ProductService) { }

	@UseGuards(AuthGuard)
	@Get()
	async getProducts() {
		const result = await this.productService.findAll();

		return result;
	}

	@UseGuards(AuthGuard)
	@UsePipes(new ValidationPipe())
	@Post('/create')
	async create(@Body(new ParseIntPipe()) product: createProductDTO) {
		try {
			// const productExists = await this.productService.findOne()
			await this.productService.createProduct(product);
			return { message: 'Product created successfully' };
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			} else {
				throw new HttpException(
					{ error: 'An error occurred while creating the product' },
					HttpStatus.INTERNAL_SERVER_ERROR,
				);
			}
		}
	}

	@Delete('/:id')
	async deleteProduct(@Param('id') id: number) {
		try {
			await this.productService.deleteProduct(id);
			return {
				message: `product id ${id} deleted succesfully`
			}
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			} else {
				throw new HttpException({ error: `Error occured while deleted product id.  ${id}` },
					HttpStatus.INTERNAL_SERVER_ERROR)
			}
		}
	}

	@Put('/:id')
	async updateProduct(@Param('id') id: number, @Body() data: Product) {
		try {
			await this.productService.updateProduct(id, data);
			return {
				message: ` producted id ${id} Updated successfuly`
			}
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			} else {
				throw new HttpException({ error: `${error} Error occured while updating qty` },
					HttpStatus.INTERNAL_SERVER_ERROR);
			}
		}
	}
}
