import {APIGatewayProxyEvent, APIGatewayProxyHandler} from "aws-lambda"
import {createOrder, Order, OrderItem} from "../../data/order";
import {nextSequence, Sequence} from "../../data/sequence";

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    console.log(event);
    const { vendorid } = event.pathParameters

    const { category, name } = JSON.parse(event.body)

    try {

        var seq = new Sequence('ORDER', null);
        const nextSeq = await nextSequence(seq);
        console.log(nextSeq)

        let lineItem = new OrderItem(
            '68769',
            78.99,
            'TEGREYRUJYT',
            78.89,
            8,
            'TRETRTKUKUNU GDVFJJH'
        )

        // Build order request
        let order: Order = new Order(
            nextSeq.sequenceValue.toString(),
            "65y6458o79p8",
            "4565465uiiluygug",
            new Date().toISOString(),
            56.78,
            89.89,
            0.00,
            'INR',
            'OPEN',
            [lineItem]
        );

        // await createOrder(order);

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