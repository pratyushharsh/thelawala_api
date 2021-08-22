import {APIGatewayProxyEvent, APIGatewayProxyHandler} from "aws-lambda"
import {createOrder, Order, OrderItem} from "../../data/order";
import {nextSequence, Sequence} from "../../data/sequence";

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    console.log(event);
    const { userid } = event.pathParameters

    const body = JSON.parse(event.body)
    const { vendorId, total, subtotal, tax, orderCurrency, items } = body

    try {
        const seq: Sequence = await nextSequence(new Sequence('ORDER', null));

        const lineItems = items.map((itm) => new OrderItem(
            itm.itemId,
            itm.price,
            itm.itemDesc,
            itm.tax,
            itm.quantity,
            itm.imageUrl),)

        // Build order request
        let order: Order = new Order(
            seq.sequenceValue.toString(),
            userid,
            vendorId,
            new Date().toISOString(),
            total,
            subtotal,
            tax,
            'INR',
            'OPEN',
            lineItems
        );

        console.log(JSON.stringify(order))
        console.log(JSON.stringify(order.toItem()))

        await createOrder(order);

        return {
            statusCode: 200,
            body: JSON.stringify(order)
        }
    } catch (e) {
        console.error(e)
        if (e.code == 'ConditionalCheckFailedException') {
            return {
                statusCode: 409,
                body: JSON.stringify({
                    "message": "Cannot Create New Order"
                })
            }
        }
    }
}