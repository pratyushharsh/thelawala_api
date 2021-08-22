import {DynamoDB} from "aws-sdk";
import {getClient} from "./client";

export class Order {
    orderId: string
    userId: string
    vendorId: string
    orderDate: string
    total: number
    subtotal: number
    tax: number
    orderCurrency: string
    status: string
    lineItems: OrderItem[]

    constructor(orderId: string, userId: string, vendorId, orderDate: string,
                total: number, subtotal: number, tax: number, orderCurrency: string, status: string,
                lineItems: OrderItem[]) {
        this.orderId = orderId
        this.userId = userId
        this.vendorId = vendorId
        this.orderDate = orderDate
        this.total = total
        this.subtotal = subtotal
        this.tax = tax
        this.orderCurrency = orderCurrency
        this.status = status
        this.lineItems = lineItems
    }

    static fromItem(item?: DynamoDB.AttributeMap): Order {

        const lineItems = item.lineItems.L.map((e) => OrderItem.fromItem(e.M))
        return new Order(
            item.orderId.S,
            item.userId.S,
            item.vendorId.S,
            item.orderDate.S,
            Number(item.total.N),
            Number(item.subtotal.N),
            Number(item.tax.N),
            item.orderCurrency.S,
            item.status.S,
            lineItems
        );
    }




    toItem(): Record<string, unknown> {
        return {
            orderId: {S: this.orderId},
            userId: {S: this.userId},
            vendorId: {S: this.vendorId},
            orderDate: {S: this.orderDate},
            statusHash: {S: `${this.status}#${new Date().toISOString()}`},
            total: {N: this.total.toString()},
            subtotal: {N: this.subtotal.toString()},
            tax: {N: this.tax.toString()},
            orderCurrency: {S: this.orderCurrency},
            status: {S: this.status},
            lineItems: {L: this.lineItems.map((e) => e.toItem())}
        }
    }

}

export class OrderItem {
    itemId: string
    price: number
    itemDesc: string
    tax: number
    quantity: number
    imageUrl: string

    constructor(itemId: string, price: number, itemDesc: string, tax: number, quantity: number, imageUrl: string) {
        this.itemId = itemId
        this.price = price
        this.itemDesc = itemDesc
        this.tax = tax
        this.quantity = quantity
        this.imageUrl = imageUrl
    }

    toItem(): Record<string, unknown> {
        return {
            M: {
                itemId: {S: this.itemId},
                price: {N: this.price.toString()},
                itemDesc: {S: this.itemDesc},
                tax: {N: this.tax.toString()},
                quantity: {N: this.quantity.toString()},
                imageUrl: this.imageUrl != null ? {S: this.imageUrl} : null
            }
        }
    }

    static fromItem(item?: DynamoDB.AttributeMap): OrderItem {
        return new OrderItem(item.itemId.S, Number(item.price.N),
            item.itemDesc.S, Number(item.tax.N), Number(item.quantity.N),
            item.imageUrl?.S)
    }
}

export const createOrder = async (order: Order): Promise<Order> => {
    const client = getClient();

    try {
        await client.putItem({
            TableName: process.env.ORDER_TABLE_NAME,
            Item: order.toItem()
        }).promise()
        return order;
    } catch (e) {
        console.error(e)
        throw e
    }
}