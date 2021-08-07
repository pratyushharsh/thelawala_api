import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    console.log(event);
    const { username } = event.pathParameters
    
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            "user": username
        })
    }

    return response
}