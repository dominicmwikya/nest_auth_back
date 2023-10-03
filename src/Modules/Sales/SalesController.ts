import { Body, Controller, Get, HttpException, HttpStatus, Post, Query } from '@nestjs/common';
import { PaginationOptions } from 'src/helpers/paginationOptions';
import { Like } from 'typeorm';
import { ProductService } from '../Products/ProductService';
import { PurchaseService } from '../Purchases/PurchaseService';
import { SaleService } from './SalesService';

@Controller('sales')
export class SalesController {
    constructor(private productService: ProductService,
        private salesService: SaleService,
        private purchaseService: PurchaseService
    ) { }
    @Post('/create')
    async createSale(@Body() data) {
        try {
            let results = [];
            let items = Array.isArray(data.items) ? data.items : [data]
            await Promise.all(
                items.map(async (item: any) => {
                    const response = await this.salesService.createSale(item);
                    if (response.message) {
                        results.push({ message: 'Sale record created successfully' });
                    } else {
                        results.push({ error: `${response.error}` });
                    }
                })
            );
            const hasError = results.some((result) => result.error);
            if (hasError) {
                console.log(results[0].error);
                return { error: `${results[0].error}` }
            }
            else {
                return { message: `${results[0].message} ` }
            }
        } catch (error) {
            return { error: `${error}` };
        }
    }
    //All daily sales
    @Get()
    fetchSales() {
        return this.salesService.getSales();
    }
    //monthly sales per product per day
    @Get('/monthly')
    async getMonthProductSales() {
        try {
            return await this.salesService.monthlyProductSales();
        } catch (error) {
            console.log(error)
            return error;
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

}