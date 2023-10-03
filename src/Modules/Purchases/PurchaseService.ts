import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "src/Entities/Product.entity";
import { Purchases } from "src/Entities/Purchases.entity";
import { UserEntity } from "src/Entities/User.entity";
import { EntityManager, ILike, Repository } from "typeorm";
import { BatchService } from "../Batchs/BatchService";
@Injectable()
export class PurchaseService {
	constructor(@InjectRepository(Purchases)
	private purchaseRepository: Repository<Purchases>,
		private batchService: BatchService,
		@InjectRepository(Product) private productRepository: Repository<Product>
	) { }

	async CreatePurchase(product: Product, user: UserEntity, sprice: number, price: number, quantity: number) {
		const batchNumber = await this.batchService.generateBatchNumber();
		const newPurchase = this.purchaseRepository.create({
			product,
			user,
			batchcode: batchNumber,
			purchase_Price: price,
			purchase_Qty: quantity,
			sale_Price: sprice,
			purchase_Total: Number.parseInt(price.toString()) *
				Number.parseInt(quantity.toString()),
		});
		try {
			const savedPurchase = await this.purchaseRepository.save(newPurchase);
			product.qty += Number.parseInt(quantity.toString());
			await this.productRepository.save(product);
			return savedPurchase;
		} catch (error) {
			throw error;
		}
	}

	async getPurchases() {
		try {
			return await this.purchaseRepository.find({
				where: { flag: 0 },
				relations: ['user', 'product', 'supplier'],
			});
		} catch (error) {
			throw new HttpException({ error: `${error} error occured while fetching purchases` },
				HttpStatus.INTERNAL_SERVER_ERROR)
		}
	}

	async updatePurchase1(pId: number, soldQty: any) {
		try {
			const purchase = await this.findOne(pId);

			if (!purchase) {
				throw new HttpException(`Purchase with ID ${pId} not found`, HttpStatus.NOT_FOUND);
			}

			const result = await this.purchaseRepository.update(
				{ id: pId },
				{ soldQty: soldQty }
			);

			if (result.affected === 1) {
				return 1;
			} else {
				throw new HttpException('Error updating purchase', HttpStatus.INTERNAL_SERVER_ERROR);
			}
		} catch (error) {
			if (error instanceof HttpException) {
				return { error: `${error}` }
			} else {
				throw new HttpException('An error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
			}
		}
	}

	async updatePurchaseQuantity(entityManager: EntityManager, pId: number, soldQty: any) {
		return await entityManager.update(Purchases, { id: pId }, { soldQty: soldQty });
	}

	async updatePurchase(id: number, data: any) {
		const purchase = await this.findOne(id);
		if (purchase instanceof HttpException) {
			return { error: `purchase ${id} doesnt exist` };
		}
		const { quantity, price, sprice } = data;
		const updatedTotalQty = Number(quantity) * Number(price);
		const result = await this.purchaseRepository.update({ id: purchase.id },
			{
				purchase_Price: price,
				purchase_Qty: quantity,
				sale_Price: sprice,
				purchase_Total: updatedTotalQty
			});
		if (result.affected === 1) {
			return { message: `purchase record id ${id} updated successfully` };
		}
		else {
			return { error: `Failed to update purchase record ${id} Try gain` };
		}
	}

	async deletePurchase(id: number): Promise<boolean> {
		try {
			const update = await this.findOne(id);
			if (update instanceof HttpException) {
				throw update;
			}
			const response = await this.purchaseRepository.update({ id: update.id }, { flag: 1 });
			return response.affected !== 0;
		} catch (error) {
			throw new HttpException(`Failed to update product: ${error.message}`,
				HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async deletePurchaseByProductId(productId: number): Promise<boolean> {
		try {
			const purchases = await this.purchaseRepository.find({ where: { product: { id: productId } } });

			const updatePromises = purchases.map(async purchase => {
				await this.purchaseRepository.update({ id: purchase.id }, { flag: 1 });
			});
			await Promise.all(updatePromises);
			return true;
		} catch (error) {
			throw new Error(`Failed to update associated purchases: ${error.message}`);
		}
	}
	async findOne(id: number) {
		const update = await this.purchaseRepository.findOne({ where: { id: id }, relations: ['product'] });
		if (!update) {
			throw new HttpException({ error: `purchase ${id} Not Found` }, HttpStatus.NOT_FOUND)
		}
		return update;
	}

	async filterByBatch(searchParam: string) {
		const response = await this.fetchFilterData(searchParam);

		if (response.length === 0) {
			throw new HttpException({ error: `Error occurred while updating qty` },
				HttpStatus.NOT_FOUND);
		}
		const mappedData = response.map((purchase) => {
			const stock = Number(purchase.purchase_Qty) - Number(purchase.soldQty);
			return {
				id: purchase.id,
				name: purchase.product.name,
				batchNumber: purchase.batchcode,
				stock: stock,
				sellingPrice: purchase.sale_Price,
				buyPrice: purchase.purchase_Price,
				user: purchase.user,
				product: purchase.product
			};
		})
		const filteredData = mappedData.filter((item) => item.stock > 0);

		return filteredData;
	}

	private async fetchFilterData(searchParam: string): Promise<Purchases[]> {
		const searchValue = searchParam.trim();
		const response = await this.purchaseRepository.find({
			where: {
				batchcode: ILike(`%${searchValue}%`),

			},
			relations: ['product']
		});
		return response;
	}
}