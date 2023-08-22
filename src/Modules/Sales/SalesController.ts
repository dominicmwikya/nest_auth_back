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
            const response = await this.salesService.createSale(data);
            if (response.message) {
                return { message: 'Product created successfully' };
            } else {
                return { error: `${response.error}` }
            }
        } catch (error) {
            return { error: `${error}` }
        }
    }


    @Get()
    async fetchSales() {
        return this.salesService.getSales();
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