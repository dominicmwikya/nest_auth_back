import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { Sale } from "src/Entities/sales.entity";
import { Repository } from "typeorm";
import { Product } from "src/Entities/Product.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { PaginationOptions } from "src/helpers/paginationOptions";
import { PaginationData } from "src/helpers/paginationOptions";
import { Pagination } from "src/helpers/Pagination";
import { ProductService } from "../Products/ProductService";
@Injectable()
export class SaleService {
    constructor(@InjectRepository(Sale)
    private salesRepository: Repository<Sale>,
        private productService: ProductService
    ) { }
    async createSale(customer_name: string, quantity: number,
        price: number, subTotal: number, sell_date: Date,
        payment_mode: string, id: Product) {
        try {
            const newSale = this.salesRepository.create({
                customer_name: customer_name,
                quantity: quantity,
                price: price,
                subTotal: subTotal,
                sell_date: sell_date,
                payment_mode: payment_mode,
                products: id
            })
            return await this.salesRepository.save(newSale);
        } catch (error) {
            throw new HttpException({ error: `${error} error creating sale record` }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async fetchSales(options: PaginationOptions): Promise<PaginationData<Sale>> {
        const Result = await Pagination(this.salesRepository, options);
        return Result;
    }

    async groupSalesByDay(threshold: number) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const products = await this.productService.findAll();
        const salesPerDayPromises = products.map(async (product) => {
            const salesPerDay = await this.salesRepository
                .createQueryBuilder('sale')
                .select('DATE(sale.sell_date)', 'day')
                .addSelect('COUNT(*)', 'count')
                .where('sale.productsId = :productId', { productId: product.id })
                .andWhere('sale.sell_Date >= :today', { today })
                .groupBy('day')
                .having('COUNT(*) > :threshold', { threshold })
                .getRawMany();

            return {
                product,
                salesPerDay
            };
        });
        const productsSalesPerDay = await Promise.all(salesPerDayPromises);
        return productsSalesPerDay
    }

    async findOneById(id: number) {
        return this.salesRepository.findOne({ where: { id: id } });
    }

    async dailySales(startDate: Date, endDate: Date) {
        try {
            const queryBuilder = this.salesRepository.createQueryBuilder('sale')
                .select("DATE_FORMAT(sale.sell_date, '%Y-%m-%d')", 'saleDay')
                .addSelect('product.name', 'productName')
                .addSelect('SUM(sale.quantity)', 'totalQuantity')
                .addSelect('SUM(sale.price * sale.quantity)', 'totalRevenue')
                .innerJoin('sale.products', 'product')
                .groupBy('saleDay, productName')
                .orderBy('saleDay', 'DESC');

            if (startDate) {
                queryBuilder.andWhere('sale.sell_date >= :startDate', { startDate });
            }

            if (endDate) {
                queryBuilder.andWhere('sale.sell_date <= :endDate', { endDate });
            }
            const sales = await queryBuilder.getRawMany();
            const totalRevenue = sales.reduce((totalinit, sale) => totalinit + parseFloat(sale.totalRevenue || 0), 0);
            return {
                data: sales,
                totalDailyRevenue: totalRevenue.toFixed(2)
            }
        } catch (error) {
            return error;
        }
    }
}