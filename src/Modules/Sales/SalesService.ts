import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Sale } from "src/Entities/sales.entity";
import { Pagination } from "src/helpers/Pagination";
import { PaginationData, PaginationOptions } from "src/helpers/paginationOptions";
import { Repository } from "typeorm";
import { ProductService } from "../Products/ProductService";
import { PurchaseService } from "../Purchases/PurchaseService";
@Injectable()
export class SaleService {
    constructor(@InjectRepository(Sale)
    private salesRepository: Repository<Sale>,
        private productService: ProductService,
        private purchaseService: PurchaseService
    ) { }
    async createSale(data: any) {
        try {
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
                        products: productId
                    });

                    await this.salesRepository.save(newSale);

                    const newProductQty = Number(productExists.qty) - Number(quantity);
                    productExists.qty = newProductQty;

                    const result = await this.productService.updateProduc1(productId, productExists.qty);

                    if (result.message) {
                        const purchaseQtySold = Number(purchaseExists.soldQty) + Number(quantity);
                        purchaseExists.soldQty = purchaseQtySold;

                        const response = await this.purchaseService.updatePurchase1(editId, purchaseExists.soldQty);

                        if (typeof response === 'number') {
                            return {
                                status: HttpStatus.ACCEPTED,
                                message: 'Sale record created successfully'
                            };
                        } else if (typeof result === 'string') {
                            return {
                                error: result
                            };
                        } else {
                            throw new HttpException('Error occurred when updating purchases', HttpStatus.INTERNAL_SERVER_ERROR);
                        }
                    } else {
                        return {
                            error: result.error
                        };
                    }
                }
            } else {
                return {
                    error: `Insufficient quantity of product: ${productExists.name}`
                };
            }
        } catch (error) {
            console.error('Failed to create sales:', error);
            throw new HttpException('Error creating sale record', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getSales() {
        return await this.salesRepository.find();
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