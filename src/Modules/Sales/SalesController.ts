import { Controller, Query, Post, Get, Body, HttpCode, HttpException, HttpStatus } from '@nestjs/common';
import { ProductService } from '../Products/ProductService';
import { SaleService } from './SalesService';
import { PurchaseService } from '../Purchases/PurchaseService';
import { Like } from 'typeorm';
import { PaginationOptions } from 'src/helpers/paginationOptions';
@Controller('sales')
export class SalesController {
    constructor(private productService: ProductService,
        private salesService: SaleService,
        private purchaseService: PurchaseService
    ) { }
    @Post('/create')
    async createSale(@Body() data) {
        const productsInfo = data;
        const { sell_date, customer_name, payment_mode } = data;
        try {
            for (const product of productsInfo.products) {
                const productId = product.id;
                const productName = product.name;
                for (const purchase of product.purchase) {
                    const quantity = purchase.quantity;
                    const price = purchase.price;
                    const subTotal = purchase.subTotal;
                    const p_id = purchase.purchaseId;

                    const productExists = await this.productService.productById(productId);
                    if (productExists) {
                        if (quantity <= productExists.qty) {
                            const purchaseExists = await this.purchaseService.findOne(p_id);
                            if (purchaseExists) {
                                const purchaseBalance = purchaseExists.purchase_Qty - purchaseExists.soldQty;
                                if (purchaseExists.purchase_Qty === purchaseExists.soldQty || quantity > purchaseBalance) {
                                    return {
                                        error: `Not enough qty for ${productName} to sale ${quantity} items`,
                                        code: HttpCode(404)
                                    }
                                } else {
                                    const saleSucess = await this.salesService.createSale(
                                        customer_name,
                                        quantity,
                                        price,
                                        subTotal,
                                        sell_date,
                                        productId,
                                        payment_mode
                                    );
                                    if (saleSucess) {
                                        const newProductQty = productExists.qty - quantity;
                                        product.qty = newProductQty;   // check errors later.
                                        await this.productService.updateProduct(productId, product.qty);

                                        const purchaseQtySold = purchaseExists.soldQty + quantity;
                                        try {
                                            const response = await this.purchaseService.updatePurchase(p_id, purchaseQtySold);
                                            return {
                                                data: response,
                                                status: HttpStatus.ACCEPTED,
                                                message: 'Sale record Created successfully'

                                            }
                                        } catch (error) {
                                            throw new HttpException({ error: `${error}` }, HttpStatus.INTERNAL_SERVER_ERROR)
                                        }
                                    } else {
                                        return {
                                            error: `Failed to create sale record`,
                                            status: HttpStatus.INTERNAL_SERVER_ERROR
                                        }
                                    }
                                }

                            } else {
                                return {
                                    error: `${p_id} does not exist in purchase records`,
                                    status: HttpStatus.NOT_FOUND
                                }
                            }
                        } else {
                            return {
                                error: `${productName} has not enough items to sell ${quantity} units  `
                            }
                        }
                    } else {
                        return {
                            error: `${productName} Not Found`,
                            status: HttpStatus.NOT_FOUND
                        }
                    }
                }
            }
        } catch (error) {
            return {
                error: `${error}`,
                status: HttpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

    @Get()
    async sales(@Query() params: any) {
        const { sortBy, orderBy, searchValue, searchColumn, take, skip } = params;
        const searchCol = searchColumn as string;
        try {
            let whereClause = {};
            if (searchColumn && searchValue) {
                whereClause = {
                    [searchCol]: Like(`%${searchValue}%`),
                    flag: 0,
                };
            }
            const options: PaginationOptions = {
                take: Number(take) || 10,
                skip: Number(skip) || 0,
                order: {
                    [sortBy as string]: orderBy
                },
                relations: ['products'],

                where: whereClause
            };

            const paginationResult = await this.salesService.fetchSales(options);
            return {
                data: paginationResult,
                status: HttpStatus.OK
            }

        } catch (error) {
            throw new HttpException({ error: `${error} error fetching sales` }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @Get('/dailysales')
    async groupSalesByDay() {
        try {
            const threshold = 0;
            const groupDailySales = await this.salesService.groupSalesByDay(threshold);
            return groupDailySales;
        } catch (error) {
            return error;
        }
    }

    @Get('/daily')
    async getDailySales(@Query() params) {
        const { startDate, endDate } = params;
        try {
            return this.salesService.dailySales(startDate, endDate);
        } catch (error) {
            throw new HttpException({ error: `${error} failed to fetch sales` }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

}