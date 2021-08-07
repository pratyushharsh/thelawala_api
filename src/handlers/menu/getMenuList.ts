import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import {getMenuList} from "../../data/menuItem";

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    console.log(event);
    const { vendorid } = event.pathParameters
    const item = await getMenuList(vendorid);
    const response = {
        statusCode: 200,
        body: JSON.stringify(item)
    }

    return response
}