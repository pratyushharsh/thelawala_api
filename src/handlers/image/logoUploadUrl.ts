import {APIGatewayEvent, APIGatewayProxyEvent, APIGatewayProxyHandler} from 'aws-lambda';
const AWS = require("aws-sdk");

const s3 = new AWS.S3()

const URL_EXPIRATION_SECONDS = process.env.URL_EXPIRATION_TIME || 300
const URL_TYPE = process.env.URL_TYPE

/*
<vendor_id>/<type>/*_logo.jpg
<vendor_id>/<type>/*_banner.jpg
<vendor_id>/<type>/<image_id>_menu.jpg
 */

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {

    const { vendorid } = event.pathParameters
    const Key = `${vendorid}/${URL_TYPE}/${vendorid}_logo.jpg`

    // Get signed URL from S3
    const s3Params = {
        Bucket: process.env.BUCKET,
        Key,
        Expires: URL_EXPIRATION_SECONDS,
        ContentType: 'image/jpeg',

        // This ACL makes the uploaded object publicly readable. You must also uncomment
        // the extra permission for the Lambda function in the SAM template.

        ACL: 'public-read'
    }
    console.log(s3Params);
    try {
        const uploadURL = await s3.getSignedUrlPromise('putObject', s3Params)

        return {
            statusCode: 200,
            body: JSON.stringify({
                uploadURL: uploadURL,
                filename: Key
            })
        }
    } catch (e) {
        console.error(e);
        return {
            statusCode: 500,
            body: JSON.stringify({
                "message": "Unable to generate Url"
            })
        }
    }
}