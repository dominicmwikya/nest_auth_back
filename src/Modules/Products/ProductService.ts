import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "src/Entities/Product.entity";
import { EntityManager, Repository } from "typeorm";
import { PurchaseService } from "../Purchases/PurchaseService";
import { createProductDTO } from "./createProductDTO";
@Injectable()
export class ProductService {
	constructor(@InjectRepository(Product) private productRepository: Repository<Product>,
		private readonly purchaseService: PurchaseService,
	) { }

	async findAll(): Promise<Product[]> {
		try {
			const products = await this.productRepository.find({ where: { flag: 0 } });
			return products;
		} catch (error) {
			throw new HttpException(
				{ error: error + " error occurred while fetching data" },
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}

	async createProduct(data: createProductDTO) {
		const exists_product = await this.productRepository.findOne(
			{ where: { name: data.name, flag: 0 } });
		if (!exists_product) {
			try {
				const { name, category, min_qty, qty, sku, description } = data;
				const newProduct = this.productRepository.create({
					name,
					category,
					min_qty,
					qty,
					description,
					sku
				});
				return this.productRepository.save(newProduct);
			} catch (error) {
				throw new HttpException({ error: "Error occured while creating product! Try again" }, HttpStatus.INTERNAL_SERVER_ERROR);
			}
		} else {
			throw new HttpException({ error: `${exists_product.name} already exists` }, HttpStatus.FOUND);
		}
	}

	async updateProduc1(productId: number, newQty: number) {
		try {
			// Fetch the product from the database
			const productToUpdate = await this.productRepository.findOne({ where: { id: productId } });
			if (productToUpdate) {
				// Update the product's quantity
				productToUpdate.qty = newQty;
				// Save the updated product to the database
				await this.productRepository.save(productToUpdate);

				return { message: 'Product updated successfully' };
			} else {
				return { error: 'Product not found' };
			}
		} catch (error) {
			return {
				error: `Error occured ${productId}`
			}
		}
	}

	async updateProductQuantity(entityManager: EntityManager, productId: number, newQty: number) {
		return await entityManager.update(Product, { id: productId }, { qty: newQty });
	}

	async updateProduct(id: number, data: any) {
		const product = await this.productRepository.findOne({ where: { id: id } });
		if (!product) {
			throw new HttpException({ error: `product ${id} does not exist in the database` }, HttpStatus.NOT_FOUND)
		}
		try {
			const { name, category, qty, min_qty, sku } = data;
			return this.productRepository.update({ id: product.id }, { name, category, qty, min_qty, sku });
		} catch (error) {
			throw new HttpException({ error: `${error} Error occured while Updating product! Try again` }, HttpStatus.INTERNAL_SERVER_ERROR)
		}
	}

	async deleteProduct(id: number): Promise<boolean | {}> {
		try {
			const product = await this.findOne(id);
			const result = await this.productRepository.update({ id: product.id }, { flag: 1 });
			if (result.affected !== 0) {
				const deleteAssociatedPurchases = await this.purchaseService.deletePurchaseByProductId(product.id);
				if (deleteAssociatedPurchases) {
					return true;
				}
				else {
					return {
						error: `Error deleting purchases with id ${id}`
					}
				}

			} else {
				return {
					error: `Error deleting ${id}`
				}
			}

		} catch (error: any) {
			throw new HttpException(`Failed to update product: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async productById(id: number) {
		return await this.productRepository.findOne({ where: { id: id } });
	}

	async findOne(id: number) {
		return await this.productRepository.findOne({
			where: { id: id, flag: 0 },
			relations: ['purchases', 'sales', 'users']
		});
	}
}
