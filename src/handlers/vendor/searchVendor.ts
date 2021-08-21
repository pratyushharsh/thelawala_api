import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import {getVendorsWithinLocation} from "../../data/vendor";

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    console.log(event);

    try {
        const vendors = await getVendorsWithinLocation()
        return {
            statusCode: 200,
            body: JSON.stringify(vendors)
        }
    } catch (e) {
        console.error(e)
        return {
            statusCode: 500,
            body: JSON.stringify({"message": "unable to fetch vendors"})
        }
    }
}