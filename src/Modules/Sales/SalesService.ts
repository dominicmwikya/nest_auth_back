import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { endOfDay, format, startOfDay, subDays } from 'date-fns';
import { Sale } from "src/Entities/sales.entity";
import { Pagination } from "src/helpers/Pagination";
import { PaginationData, PaginationOptions } from "src/helpers/paginationOptions";
import { EntityManager, Raw, Repository } from "typeorm";
import { ProductService } from "../Products/ProductService";
import { PurchaseService } from "../Purchases/PurchaseService";
import { ReceiptService } from "../Receipts/ReceiptService";
@Injectable()
export class SaleService {
    constructor(@InjectRepository(Sale)
    private salesRepository: Repository<Sale>,
        private productService: ProductService,
        private purchaseService: PurchaseService,
        private readonly entityManager: EntityManager,
        private receiptService: ReceiptService,

    ) { }

    async createSale(data: any) {
        const queryRunner = this.entityManager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const entityManager = queryRunner.manager;
            const { customer_name, cart_items, grantTotal, totalItems, balance, amount } = data;
            const results = [];
            const items = Array.isArray(cart_items) ? cart_items : [cart_items];
            const productQuantityChanges = new Map();
            const receiptData = {
                customer_name,
                grantTotal,
                totalItems,
                balance,
                amount
            };
            const receiptNumber = await this.receiptService.createReceipt(entityManager, receiptData);

            await Promise.all(
                items.map(async (item) => {
                    item.customer_name = customer_name;
                    const batchExists = await this.purchaseService.findOne(item.batchId);

                    if (!batchExists || !batchExists.product) {
                        results.push({ error: 'Batch not found' });
                    } else {
                        let quantityInStock = batchExists.purchase_Qty - batchExists.soldQty;

                        if (quantityInStock < item.quantity) {
                            results.push({ error: `Insufficient Quantity for ${batchExists.product.name}` });
                        } else {
                            let expectedSalePrice = batchExists.sale_Price * parseFloat(item.quantity);
                            let balance = parseFloat(item.total) - expectedSalePrice;

                            const newSale = this.salesRepository.create({
                                price: item.price,
                                total: item.total,
                                quantity: item.quantity,
                                amount: expectedSalePrice,
                                user: item.userId,
                                balance: balance,
                                product: item.productId,
                                receipt: receiptNumber,
                                status: item.balance === '0' ? 'Paid' : 'Due',
                            });

                            await entityManager.save(newSale);

                            const purchaseQtySold = Number(batchExists.soldQty) + Number(item.quantity);

                            if (!productQuantityChanges.has(item.productId)) {
                                productQuantityChanges.set(item.productId, 0);
                            }
                            productQuantityChanges.set(item.productId, productQuantityChanges.get(item.productId) - Number(item.quantity));

                            await this.purchaseService.updatePurchaseQuantity(entityManager, item.batchId, purchaseQtySold);
                            results.push({ message: `Sale record for product ${batchExists.product.name} created successfully!` });
                        }
                    }
                })
            );

            for (const [productId, quantityChange] of productQuantityChanges) {
                const productExists = await this.productService.productById(productId);
                const newProductQty = Number(productExists.qty) + quantityChange;
                await this.productService.updateProductQuantity(entityManager, productId, newProductQty);
            }

            await queryRunner.commitTransaction();
            const hasError = results.some((result) => result.error);

            return { results, hasError };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return { error: 'An unexpected error occurred while creating the sale.' };
        } finally {
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
            // .addSelect('SUM(sale.balance) AS TotalBalance')
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
    async test(productName: string, date: any) {
        const formattedDate = date.replace(/\//g, '-');
        console.log(formattedDate)
        const selection = await this.salesRepository.find({
            relations: {
                product: true
            },
            where: {
                product: {
                    name: `${productName}`
                },
                sell_date: Raw(alias => `DATE(${alias}) = DATE('${formattedDate}')`),
            },
        })
        return selection
    }

}