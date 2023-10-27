
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { Purchases } from 'src/Entities/Purchases.entity';
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
			const response = await this.purchaseService.getPurchases();
			return response;
		} catch (error) {
			throw error;
		}
	}

	@Get('/fastsales')
	async getFastSales() {
		try {
			const result = await this.purchaseService.fetchFastSellingBatches();
			return result;
		} catch (error) {

			return error
		}
	}
	@Post('create')
	async createPurchase(@Body() body: purchaseBodyData[]) {
		const purchaseData = body;
		const savedPurchases: Purchases[] = [];
		try {
			for (const purchase of purchaseData) {
				console.log(purchase)
				const product = await this.productService.productById(purchase.productId);
				if (!product) {
					throw new HttpException({ error: 'Product not found' }, HttpStatus.NOT_FOUND);
				}
				const user = await this.userService.findOne(purchase.userId);
				const Result: Purchases = await this.purchaseService.CreatePurchase(product, user, purchase.price, purchase.quantity, purchase.sprice);
				savedPurchases.push(Result);
			}
			return {
				message: `${savedPurchases.length} records added successfully`
			};
		} catch (error: any) {
			throw error;
		}
	}
	@Put('/update/:id')
	async updatePurchase(@Param('id') id: number, @Body() data: Purchases) {
		try {
			const result = await this.purchaseService.updatePurchase(id, data);
			return result;
		} catch (error) {
			throw new HttpException({ error: `${error} error updating purchase` }, HttpStatus.INTERNAL_SERVER_ERROR)
		}
	}
	@Delete('/delete/:id')
	async deletePurchase(@Param('id') id: number) {
		try {
			const result = await this.purchaseService.deletePurchase(id);
			return result;
		} catch (error) {
			return error;
		}
	}

	@Put('/delete-multiple')
	async deleteMultiplePurchases(@Body() body: { ids: number[] | number }) {
		try {
			let response = [];
			let errorIds = [];
			let purchaseIds = Array.isArray(body.ids) ? body.ids : [body.ids];
			await Promise.all(
				purchaseIds.map(async id => {
					const result = await this.purchaseService.testDeletePurchase(id);
					response.push(result);
					if (result.error) {
						errorIds.push(id); // Track the IDs where errors occurred
					}
					return result;
				}));

			if (errorIds.length > 0) {
				return { error: 'Deletion failed for IDs: ' + errorIds.join(', ') };
			} else {
				return { message: 'All deletions were successful.' };
			}
		} catch (error) {
			return {
				error: error
			}
		}
	}

	@Get('/search/:searchParam')
	async findProductByName(@Param('searchParam') searchParam: any) {
		return await this.purchaseService.filterByBatch(searchParam);
	}

	@Get('/:id')
	async findById(@Param('id') purchaseId: number) {
		return await this.purchaseService.findOne(purchaseId)
	}


}
