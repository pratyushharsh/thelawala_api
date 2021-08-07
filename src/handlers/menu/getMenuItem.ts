import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import {getMenuById} from "../../data/menuItem";

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    console.log(event);
    const { vendorid, category, itemid } = event.pathParameters
    const item = await getMenuById(vendorid, category, itemid);
    const response = {
        statusCode: 200,
        body: JSON.stringify(item)
    }

    return response
}