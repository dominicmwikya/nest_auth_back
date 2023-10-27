import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ProductService } from '../Products/ProductService';
import { PurchaseService } from '../Purchases/PurchaseService';
import { SaleService } from './SalesService';
@Controller('sales')
export class SalesController {
    constructor(private productService: ProductService,
        private salesService: SaleService,
        private purchaseService: PurchaseService,

    ) { }
    @Post('/create')
    async createSale(@Body() data: any) {
        try {
            const result = await this.salesService.createSale(data);

            if (result.hasError) {
                return { error: 'One or more errors occurred during sale creation', results: result.results };
            } else {
                return { message: 'Sale records created successfully!', results: result.results };
            }
        } catch (error) {
            return { error: `Error occurred while creating sale: ${error.error}` };
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
            return error;
        }
    }
    //
    @Get('/product/records')
    async getProductRecords(@Query('productName') productName: string, @Query('date') date: Date,) {
        const result = await this.salesService.test(productName, date);
        return result;
    }
}