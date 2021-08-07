import {APIGatewayProxyEvent, APIGatewayProxyHandler} from "aws-lambda"
import {createVendor, Vendor} from "../../data/vendor";
import {CreateUpdateVendor} from "../../model/createUpdateVendor";

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    console.log(JSON.stringify(event));
    const { vendorid } = event.pathParameters

    const body: CreateUpdateVendor = JSON.parse(event.body);

    const vendor = new Vendor(vendorid, body.name, body.email, body.phone,
        body.introduction, body.tagline,
        body.website, body.facebook, body.instagram, body.youtube,
       body.twitter, ['Mexican']);
    await createVendor(vendor);
    const response = {
        statusCode: 200,
        body: JSON.stringify(vendor)
    }

    return response
}