import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import {getVendor} from "../../data/vendor";

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    console.log(JSON.stringify(event));
    const { vendorid } = event.pathParameters
    try {
        const vendor = await getVendor(vendorid);
        const response = {
            statusCode: 200,
            body: JSON.stringify(vendor)
        }

        return response
    } catch (e) {
        return {
            statusCode: 404,
            body: JSON.stringify({})
        }
    }

}