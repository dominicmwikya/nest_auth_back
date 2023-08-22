import { Purchases } from "src/Entities/Purchases.entity";
export class CreatePurchaseDTO {
    purchase_Qty: number;
    purchase_Price: number;
    sale_Price: number;
    purchase_Total: number;
    batchcode: string;
    soldQty: number;
    productId: number;
    supplierId: number;
    userId: number;
}

export class purchaseBodyData extends Purchases {
    productId: number;
    userId: number;
    quantity: number;
    price: number;
    supplierId: number;
    sprice: number;
}

