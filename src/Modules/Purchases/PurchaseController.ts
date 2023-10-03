
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

	@Post('create')
	async createPurchase(@Body() body: purchaseBodyData[]) {
		const purchaseData = body;
		const savedPurchases: Purchases[] = [];
		try {
			for (const purchase of purchaseData) {
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

	@Delete('/delete-multiple')
	async deleteMultiplePurchases(@Body() body: { ids: number[] | number }) {
		try {
			let purchaseIds = Array.isArray(body.ids) ? body.ids : [body.ids];

			const results = await Promise.all(
				purchaseIds.map(async id => {
					const purchase = await this.purchaseService.findOne(id);
					const product = purchase.product;
					product.qty -= purchase.purchase_Qty;
					const productUpdate = await this.productService.updateProduc1(product.id, product.qty);

					if (productUpdate.message) {
						const result = await this.purchaseService.deletePurchase(id);
						return result;
					}
					else {
						return {
							error: `${productUpdate.error}`
						}
					}
				}));

			const isSuccess = results.every(result => typeof result === "boolean" && result === true);
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

	@Get('/search/:searchParam')
	async findProductByName(@Param('searchParam') searchParam: any) {
		return await this.purchaseService.filterByBatch(searchParam);
	}

	@Get('/:id')
	async findById(@Param('id') purchaseId: number) {
		return await this.purchaseService.findOne(purchaseId)
	}
}
