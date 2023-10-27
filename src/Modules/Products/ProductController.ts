
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { Product } from 'src/Entities/Product.entity';
import { AuthGuard } from '../Auth/authGuard';
import { Roles } from '../Auth/role.decorator';
import { ProductService } from './ProductService';
import { createProductDTO } from './createProductDTO';

@Controller('products')
export class ProductController {
	constructor(private productService: ProductService) { }

	@UseGuards(AuthGuard)
	@Roles('DEFAULT USER', 'Admin1', 'Admin')
	@Get()
	async getProducts() {
		const result = await this.productService.findAll();
		return result;
	}

	@UseGuards(AuthGuard)
	@Roles('DEFAULT USER', 'Admin')
	@Post('/create')
	async create(@Body() product: createProductDTO) {
		try {
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

	@Roles('DEFAULT USER', 'Admin1', 'Admin')
	@Delete('/remove')
	async productDelete(@Body() body: { ids: number[] | number }) {
		try {
			const idBody = body.ids;
			const idArray = Array.isArray(idBody) ? idBody : [idBody];
			const result = await Promise.all(
				idArray.map(async id => {
					return await this.productService.deleteProduct(id);
				})
			);
			const isSuccess = result.every(result => typeof result === "boolean" && result === true);
			if (isSuccess) {
				return {
					message: " products deleted successfully"
				};
			}
			else {
				return {
					error: "Some products could not be deleted"
				};
			}
		} catch (error) {
			return {
				error: error
			}
		}
	}

	@Roles('DEFAULT USER', 'Admin1', 'Admin')
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
