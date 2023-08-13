
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { Purchases } from 'src/Entities/purchases.entity';
import { ProductService } from '../Products/ProductService';
import { UsersService } from '../Users/UserService';
import { purchaseBodyData } from './CreatePurchase.DTO';
import { PurchaseService } from './PurchaseService';
@Controller('purchases')
export class PurchaseController {
	constructor(
		private purchaseService: PurchaseService,
		private userService: UsersService,
		private productService: ProductService,
	) { }

	@Get()
	async getPurchases() {
		try {
			const response = await fetch('http://localhost:5000/purchases'); // Replace with your endpoint URL
			const data = await response.json();

			if (Array.isArray(data)) {
				return data;
			} else {
				console.error('Data received is not an array:', data);
				throw new Error('Invalid data format');
			}
		} catch (error) {
			throw error;
		}
	}

	@Post('create')
	async createPurchase(@Body() body: purchaseBodyData[]) {
		const purchaseData = body;
		const savedPurchases: Purchases[] = [];
		try {
			for (const purchase of purchaseData) {
				const product = await this.productService.productById(1);
				if (!product) {
					throw new HttpException({ error: 'Product not found' }, HttpStatus.NOT_FOUND);
				}
				const user = await this.userService.findOne(purchase.userId);
				const Result: Purchases = await this.purchaseService.CreatePurchase(product, user, purchase.price, purchase.quantity, purchase.sprice);
				savedPurchases.push(Result);
			}
			return {
				data: savedPurchases,
				message: `${savedPurchases.length} records added successfully`
			};
		} catch (error: any) {
			throw error;
		}
	}

	// @Get('/all')
	// async getProductPurchases(req: Request, res: Response) {
	// 	const { sortBy, orderBy, searchValue, searchColumn, take, skip } = req.query;
	// 	const searchCol = searchColumn as string;
	// 	try {
	// 		let whereClause = {};
	// 		if (searchColumn && searchValue) {
	// 			whereClause = { [searchCol]: Like(`%${searchValue}%`) };
	// 		}
	// 		const options: PaginationOptions = {
	// 			take: Number(take) || 10,
	// 			skip: Number(skip) || 0,
	// 			order: {
	// 				createdAt: 'DESC',
	// 			},
	// 			relations: [
	// 				'user',
	// 				'product',
	// 				'supplier'
	// 			],
	// 			where: whereClause
	// 		};

	// 		const result = await this.purchaseService.getPurchases(options);
	// 		return {
	// 			data: result,
	// 			HttpStatus: HttpStatus.OK
	// 		};
	// 	} catch (error) {
	// 		throw error;
	// 	}
	// }

	@Put('/update/:id')
	async updatePurchase(@Param('id') id: number, @Body() data: Purchases) {
		try {
			const result = await this.purchaseService.updatePurchase(id, data);
			if (result instanceof HttpException) {
				throw result;
			} else {
				return {
					result: result,
					HttpStatus: HttpStatus.OK
				}
			}
		} catch (error) {
			throw new HttpException({ error: `${error} error updating purchase` }, HttpStatus.INTERNAL_SERVER_ERROR)
		}
	}

	@Delete('/delete/:id')
	async deletePurchase(@Param('id') id: number) {
		const result = await this.purchaseService.deletePurchase(id);

		return {
			result: result,
			message: ` purchase id ${id} deleted successfully`,
			HttpStatus: HttpStatus.OK,
		}
	}

	@Get('/search/:searchParam')
	async findProductByName(@Param('searchParam') searchParam: any) {
		return await this.purchaseService.filterByBatch(searchParam);
	}
}
