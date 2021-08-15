import {APIGatewayProxyEvent, APIGatewayProxyHandler} from "aws-lambda"
import {updateVendorLocation} from "../../data/vendor";

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    console.log(event);
    const { vendorid } = event.pathParameters

    const { latitude, longitude } = JSON.parse(event.body)

    try {
        await updateVendorLocation(vendorid, latitude, longitude);
        return {
            statusCode: 200,
            body: JSON.stringify({"messsage": "ok"})
        }
    } catch (e) {
        if (e.code == 'ConditionalCheckFailedException') {
            return {
                statusCode: 409,
                body: JSON.stringify({
                    "message": "Vendor Do Not Exist"
                })
            }
        }
    }
}