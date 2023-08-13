import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "src/Entities/Product.entity";
import { UserEntity } from "src/Entities/User.entity";
import { Purchases } from "src/Entities/purchases.entity";
import { ILike, Repository } from "typeorm";
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
		const newPurchase = this.purchaseRepository.create(
			{
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
				relations: ['user', 'product', 'supplier'],
			});
		} catch (error) {
			throw new HttpException({ error: `${error} error occured while fetching purchases` },
				HttpStatus.INTERNAL_SERVER_ERROR)
		}
	}
	// getPurchases = async (options: PaginationOptions): Promise<PaginationData<Purchases>> => {
	// 	try {
	// 		const result = await Pagination(this.purchaseRepository, options);
	// 		return result;
	// 	} catch (error) {
	// 		throw new HttpException({ error: `${error} error occured while fetching purchases` },
	// 			HttpStatus.INTERNAL_SERVER_ERROR)
	// 	}
	// }

	async updatePurchase(pId: number, data: Purchases) {
		const purchase = await this.findOne(pId);
		if (purchase instanceof HttpException) {
			throw purchase;
		}
		const { purchase_Price, purchase_Qty, purchase_Total } = data;
		const result = await this.purchaseRepository.update(
			{ id: purchase.id },
			{ purchase_Price, purchase_Qty, purchase_Total });
		return result;
	}

	async deletePurchase<T>(id: T): Promise<boolean> {
		try {
			const update = await this.findOne({ where: id });
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

	async findOne<T>(id: T) {
		const update = await this.purchaseRepository.findOne({ where: id });
		if (!update) {
			throw new HttpException({ error: `purchase ${id} Not Found` }, HttpStatus.NOT_FOUND)
		}
		return update;
	}

	// async filterByBatch(searchParam: string) {
	// 	const response = await this.fetchFilterData(searchParam);

	// 	if (!response) {
	// 		throw new HttpException({ error: `Error occurred while updating qty` },
	// 			HttpStatus.NOT_FOUND);
	// 	}

	// 	const stock = Number(response.purchase_Qty) - Number(response.soldQty);
	// 	return {
	// 		id: response.id,
	// 		name: response.product.name,
	// 		batchNumber: response.batchcode,
	// 		stock: stock,
	// 		sellingPrice: response.sale_Price,
	// 		buyPrice: response.purchase_Price,
	// 		user: response.user
	// 	};
	// }

	// private async fetchFilterData(searchParam: string): Promise<Purchases | null> {
	// 	const searchValue = searchParam.trim();
	// 	const response = await this.purchaseRepository.findOne({
	// 		where: {
	// 			batchcode: ILike(`${searchValue}%`)
	// 		},
	// 		relations: ['product']
	// 	});
	// 	return response || null;



	// }


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
				user: purchase.user
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