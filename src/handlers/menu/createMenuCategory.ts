import {APIGatewayProxyEvent, APIGatewayProxyHandler} from "aws-lambda"
import {createMenuCategory, MenuCategory} from "../../data/menuCategory";

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    console.log(event);
    const { vendorid } = event.pathParameters

    const { category, name } = JSON.parse(event.body)

    try {
        const menuCategory = new MenuCategory(vendorid, category.toUpperCase(), name);
        await createMenuCategory(menuCategory);
        return {
            statusCode: 200,
            body: JSON.stringify(menuCategory)
        }
    } catch (e) {
        if (e.code == 'ConditionalCheckFailedException') {
            return {
                statusCode: 409,
                body: JSON.stringify({
                    "message": "Category Already Exist"
                })
            }
        }
    }
}