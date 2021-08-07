import {APIGatewayProxyEvent, APIGatewayProxyHandler} from "aws-lambda"
import {MenuItemCreateRequest} from "../../model/menuItemCreateRequest";
import {createMenuItem, MenuItem, ModifierGroup, ModifierItem} from "../../data/menuItem";
import {ulid} from "ulid";

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    console.log(event);
    const { vendorid, category } = event.pathParameters

    const req: MenuItemCreateRequest = JSON.parse(event.body)

    try {
        const modifiers: ModifierGroup[] = req.modifiers?.map(e => {
            const modItems: ModifierItem[] = e.item_list?.map((tmp) => new ModifierItem(tmp.modifier_name, tmp.price)) || []
            return new ModifierGroup(e.group_name, e.must_select, e.multiple_selection_allowed, modItems)
        }) || []
        const menuItem = new MenuItem(vendorid, category, ulid(), req.item_name, req.item_price, req.description, req.tags, req.active, modifiers)
        console.log(JSON.stringify(menuItem))
        console.log(JSON.stringify(menuItem.toItem()))
        await createMenuItem(menuItem)
        return {
            statusCode: 200,
            body: JSON.stringify(menuItem)
        }
    } catch (e) {
        if (e.code == 'TransactionCanceledException') {
            const error = []
            if (e.cancellationReasons[0].Code == 'ConditionalCheckFailed'){
                error.push('Item Already Exist')
            }

            if (e.cancellationReasons[1].Code == 'ConditionalCheckFailed'){
                error.push('Category Does Not Exist')
            }

            return {
                statusCode: 409,
                body: JSON.stringify({
                    "message": error
                })
            }
        }
    }
}