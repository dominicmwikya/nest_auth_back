import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { endOfDay, format, startOfDay, subDays } from 'date-fns';
import { Sale } from "src/Entities/sales.entity";
import { Pagination } from "src/helpers/Pagination";
import { PaginationData, PaginationOptions } from "src/helpers/paginationOptions";
import { EntityManager, Repository } from "typeorm";
import { ProductService } from "../Products/ProductService";
import { PurchaseService } from "../Purchases/PurchaseService";
@Injectable()
export class SaleService {
    constructor(@InjectRepository(Sale)
    private salesRepository: Repository<Sale>,
        private productService: ProductService,
        private purchaseService: PurchaseService,
        private readonly entityManager: EntityManager,
    ) { }
    async createSale(data: any) {
        const queryRunner = this.entityManager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const entityManager = queryRunner.manager;
            const { customer_name, userId, productId, price, total, quantity, amount, balance, editId } = data;
            const productExists = await this.productService.productById(productId);
            if (!productExists) {
                throw new HttpException(`Product with ID ${productId} not found`, HttpStatus.NOT_FOUND);
            }
            if (quantity <= productExists.qty) {
                const purchaseExists = await this.purchaseService.findOne(editId);
                const purchaseBalance = purchaseExists.purchase_Qty - purchaseExists.soldQty;

                if (purchaseExists.purchase_Qty === purchaseExists.soldQty || quantity > purchaseBalance) {
                    return { error: `Not enough quantity for ${productExists.name}` };
                } else {
                    const newSale = this.salesRepository.create({
                        customer_name: customer_name,
                        price: price,
                        total: total,
                        quantity: quantity,
                        amount: amount,
                        balance: balance,
                        user: userId,
                        product: productId,
                        status: balance === '0.00' ? 'Paid' : 'Due'
                    });
                    await entityManager.save(newSale);

                    const newProductQty = Number(productExists.qty) - Number(quantity);
                    productExists.qty = newProductQty;

                    await this.productService.updateProductQuantity(entityManager, productId, productExists.qty);
                    const purchaseQtySold = Number(purchaseExists.soldQty) + Number(quantity);
                    purchaseExists.soldQty = purchaseQtySold;

                    await this.purchaseService.updatePurchaseQuantity(entityManager, editId, purchaseExists.soldQty);
                    await queryRunner.commitTransaction();
                    return { message: "Sale record created successfully!" }
                }
            } else {
                return { error: `Insufficient quantity of product: ${productExists.name}`};
            }
        } catch (error) {
            await queryRunner.rollbackTransaction()
            return { error: `Error occured while creating sale ` }
        }
        finally {
            await queryRunner.release();
        }
    }
    //backend pagination when fetching sales
    async fetchSales(options: PaginationOptions): Promise<PaginationData<Sale>> {
        const Result = await Pagination(this.salesRepository, options);
        return Result;
    }

    async findOneById(id: number) {
        return this.salesRepository.findOne({ where: { id: id } });
    }

    async groupSalesByDay(threshold: number) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const products = await this.productService.findAll();
        const salesPerDayPromises = products.map(async (product) => {
            const salesPerDay = await this.salesRepository
                .createQueryBuilder('sale')
                .select('DATE(sale.sell_date) AS date')
                .addSelect('COUNT(*) AS count')
                .where('sale.productId = :productId', { productId: product.id })
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

    //filter by start and end date
    async dailySales(startDate: Date, endDate: Date) {
        try {
            const queryBuilder = this.salesRepository.createQueryBuilder('sale')
                .select("DATE(sale.sell_date, '%Y-%m-%d')", '')
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

    async monthlyProductSales() {
        const today = new Date();
        const endDateFormatted = subDays(today, 30);
        const startDateFormatted = format(endDateFormatted, 'yyyy-MM-dd 00:00:00');
        const lastDayOfToday = format(today, 'yyyy-MM-dd 23:59:59');
        const saleByDate = await this.salesRepository
            .createQueryBuilder('sale')
            .select('DATE(sale.sell_date) AS date')
            .addSelect('product.name AS productName')
            .addSelect('SUM(sale.total) AS TotalRevenue')
            .addSelect('SUM(sale.quantity) AS TotalQuantity')
            .addSelect('SUM(sale.amount) AS TotalAmount')
            .addSelect('SUM(sale.balance) AS TotalBalance')
            .innerJoin('sale.product', 'product')
            .where(`DATE(sale.sell_date) BETWEEN :startDate AND :endDate`, {
                startDate: startDateFormatted,
                endDate: lastDayOfToday
            })
            .groupBy('DATE(sale.sell_date), product.name')
            .orderBy('date', 'DESC')
            .getRawMany();

        const salesMap = new Map<string, number>();
        saleByDate.forEach((sale) => {
            let saleDate = format(sale.date, 'yyyy/MM/dd');
            let total = Number(sale.TotalRevenue);
            if (salesMap.has(saleDate)) {
                salesMap.set(saleDate, salesMap.get(saleDate) + total);
            } else {
                salesMap.set(saleDate, total);
            }
        })
        const salesm = Array.from(salesMap).map(([date, total]) => ({
            date,
            total,
        }));
        const formattedResults = saleByDate.map((result) => ({
            date: format(result.date, 'yyyy/MM/dd'),
            productName: result.productName,
            TotalRevenue: result.TotalRevenue,
            TotalQuantity: result.TotalQuantity,
            TotalAmount: result.TotalAmount,
            TotalBalance: result.TotalBalance,
            status: result.TotalBalance === '0.00' ? 'Paid' : 'Due'
        }));
        return {
            results: formattedResults,
            chartDt: salesm
        };
    }

    //fetch all daily sailes
    async getSales() {
        const today = new Date();
        const startOfToday = startOfDay(today);
        const endOfToday = endOfDay(today);
        const startDateFormatted = format(startOfToday, 'yyyy-MM-dd 00:00:00');
        const endtoday = format(endOfToday, 'yyyy-MM-dd 23:59:59');

        // Fetch sales records for today using a date range query
        const todaysales = await this.salesRepository
            .createQueryBuilder('sale')
            .leftJoinAndSelect('sale.product', 'product')
            .where('sale.sell_date BETWEEN :start AND :end', {
                start: startDateFormatted,
                end: endtoday,
            })
            .orderBy('sale.sell_date', 'DESC')
            .getMany();

        // Calculate total sales for today and group them by product name
        const productMap = new Map<string, number>();

        todaysales.forEach((sale) => {
            const productName = sale.product.name;
            const total = Number(sale.total);

            if (productMap.has(productName)) {
                productMap.set(productName, productMap.get(productName) + total);
            } else {
                productMap.set(productName, total);
            }
        });

        const productTotalsToday = Array.from(productMap).map(([name, total]) => ({
            name,
            total,
        }));
        // Fetch all sales records
        const allSales = await this.salesRepository
            .createQueryBuilder('sale')
            .leftJoinAndSelect('sale.product', 'product')
            .orderBy('sale.sell_date', 'DESC')
            .getMany();

        // Calculate total sales for all sales
        let totalSumAll = 0;
        allSales.forEach((sale) => {
            totalSumAll += Number(sale.total);
        });
        return {
            todays: productTotalsToday,
            sales: allSales,
            TotalRevenue: totalSumAll,
        };
    }


}