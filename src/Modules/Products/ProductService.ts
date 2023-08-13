import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { createProductDTO } from "./createProductDTO";
import { Repository } from "typeorm";
import { Product } from "src/Entities/Product.entity";
import { InjectRepository } from "@nestjs/typeorm";
@Injectable()
export class ProductService {
	constructor(@InjectRepository(Product) private productRepository: Repository<Product>,

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
		const exists_product = await this.productRepository.findOne({ where: { name: data.name } });
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

	async updateProduct(id: number, data: Product) {
		const product = await this.productRepository.findOne({ where: { id: id } });
		if (!product) {
			throw new HttpException({ error: `product ${id} does not exist in the database` }, HttpStatus.NOT_FOUND)
		}
		try {
			const { name, category, qty, min_qty,sku } = data;
			return this.productRepository.update({ id: product.id }, { name, category, qty, min_qty, sku });
		} catch (error) {
			throw new HttpException({ error: `${error} Error occured while Updating product! Try again` }, HttpStatus.INTERNAL_SERVER_ERROR)
		}
	}

	async deleteProduct(id: number): Promise<boolean> {
		try {
			const result = await this.productRepository.update({ id: id }, { flag: 1 });
			return result.affected !== 0;
		} catch (error: any) {
			throw new HttpException(`Failed to update product: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async productById<T>(id: T) {
		return await this.productRepository.findOne({ where: id });
	}
}
