import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import {getMenuCategoryList} from "../../data/menuCategory";

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    console.log(event);
    const { vendorid } = event.pathParameters
    const item = await getMenuCategoryList(vendorid);
    const response = {
        statusCode: 200,
        body: JSON.stringify(item)
    }

    return response
}