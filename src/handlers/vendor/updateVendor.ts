import {APIGatewayProxyEvent, APIGatewayProxyHandler} from "aws-lambda"
import {createVendor, Vendor} from "../../data/vendor";
import {CreateUpdateVendor} from "../../model/createUpdateVendor";

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {

    const response = {
        statusCode: 200,
        body: JSON.stringify('')
    }

    return response
}