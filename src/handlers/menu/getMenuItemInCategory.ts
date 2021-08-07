import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import {getMenuCategoryList} from "../../data/menuItem";

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    console.log(event);
    const { vendorid, category } = event.pathParameters
    const item = await getMenuCategoryList(vendorid, category);
    const response = {
        statusCode: 200,
        body: JSON.stringify(item)
    }

    return response
}