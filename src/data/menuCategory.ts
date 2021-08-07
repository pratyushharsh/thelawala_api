import {Item} from "./base";
import {getClient} from "./client";
import {DynamoDB} from "aws-sdk";

export class MenuCategory extends Item {
    vendorid: string
    category: string
    name: string
    description: string
    itemCount: number

    constructor(vendorid: string, category: string, name: string, description?: string, itemCount?: number) {
        super();
        this.vendorid = vendorid
        this.category = category
        this.name = name
        this.description = description || ""
        this.itemCount = itemCount || 0
    }

    get pk(): string {
        return `VENDOR#${this.vendorid}`;
    }

    get sk(): string {
        return `CATEGORY#${this.category}`;
    }

    static fromItem(item?: DynamoDB.AttributeMap): MenuCategory {
        if (!item) throw new Error("Category Not Found")
        return new MenuCategory(item.vendorid.S, item.category.S, item.name.S, item.description?.S, Number(item.itemCount?.N))
    }

    toItem(): Record<string, unknown> {
        return {
            ...this.keys(),
            vendorid: {S: this.vendorid},
            category: {S: this.category},
            name: {S: this.name},
            description: {S: this.description},
            itemCount: {N: this.itemCount.toString()}
        }
    }
}

export const createMenuCategory = async (menuCategory: MenuCategory): Promise<MenuCategory> => {
    const client = getClient();

    try {
        await client.putItem({
            TableName: process.env.TABLE_NAME,
            Item: menuCategory.toItem(),
            ConditionExpression: "attribute_not_exists(PK)"
        }).promise()
        return menuCategory
    } catch (e) {
        console.error(JSON.stringify(e))
        throw e
    }
}

export const getMenuCategoryList = async (vendorId: string): Promise<MenuCategory[]> => {
    const client = getClient();

    const menuCategory = new MenuCategory(vendorId, "", "");

    try {
        const resp = await client
            .query({
                TableName: process.env.TABLE_NAME,
                KeyConditionExpression: "PK = :pk and begins_with(SK, :beginsWith)",
                ExpressionAttributeValues: {
                    ":pk": { S: menuCategory.pk },
                    ":beginsWith": { S: "CATEGORY#" }
                }
            })
            .promise()
        console.log(`******Count: ${resp.Count}  ***************ScannedCount:    ${resp.ScannedCount}    CC:  ${resp.ConsumedCapacity}   *******************`);
        return resp.Items.map((item) => MenuCategory.fromItem(item))
    } catch (e) {
        console.error(JSON.stringify(e))
        throw e
    }
}