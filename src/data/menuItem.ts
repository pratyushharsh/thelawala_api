import {Item} from "./base";
import {DynamoDB} from "aws-sdk";
import {getClient} from "./client";
import {executeTransactWrite} from "./utils";
import {MenuCategory} from "./menuCategory";

export class MenuItem extends Item {
    vendorid: string
    category: string
    itemid: string

    name: string
    price: number
    description: string
    tags: string[]
    active: boolean

    modifiers: ModifierGroup[]

    constructor(vendorid: string, category: string, itemid: string, name?: string, price?: number,
                description?: string, tags?: string[], active?: boolean, modifiers?: ModifierGroup[]) {
        super();
        this.vendorid = vendorid
        this.category = category
        this.itemid = itemid

        this.name = name
        this.price = price
        this.description = description
        this.tags = tags
        this.active = active
        this.modifiers = modifiers
    }

    get pk(): string {
        return `VENDOR#${this.vendorid}`;
    }

    get sk(): string {
        return `MENU#${this.category}#${this.itemid}`;
    }

    static fromItem(item?: DynamoDB.AttributeMap): MenuItem {
        if (!item) throw new Error("Category Not Found")
        const modifiers = item.modifiers?.L?.map((e) => ModifierGroup.fromItem(e.M)) || []
        return new MenuItem(item.vendorid.S, item.category.S, item.itemid.S, item.name.S, Number(item.price.N), item.description.S, item.tags?.SS || [], item.active.BOOL, modifiers)
    }

    toItem(): Record<string, unknown> {
        return {
            ...this.keys(),
            vendorid: {S: this.vendorid},
            category: {S: this.category},
            itemid: {S: this.itemid},
            name: {S: this.name},
            price: {N: this.price.toString()},
            description: {S: this.description},
            tags: (this.tags && this.tags.length > 0) ?  {SS: this.tags} : null,
            active: {BOOL: this.active},
            modifiers: (this.modifiers && this.modifiers.length > 0) ?  {L: this.modifiers.map((e) => e.toItem())} : null
        }
    }
}

export class ModifierGroup {
    groupName: string
    mustSelect: boolean
    multipleSelectionAllowed: boolean
    modifierItems: ModifierItem[]

    constructor(groupName: string, mustSelect: boolean, multipleSelectionAllowed: boolean, modifierItems: ModifierItem[]) {
        this.groupName = groupName
        this.mustSelect = mustSelect
        this.multipleSelectionAllowed = multipleSelectionAllowed
        this.modifierItems = modifierItems
    }

    static fromItem(item?: DynamoDB.AttributeMap): ModifierGroup {
        const modifierItems = item.modifierItems?.L?.map((tmp) => ModifierItem.fromItem(tmp.M)) || []
        return new ModifierGroup(item.groupName.S, item.mustSelect.BOOL, item.multipleSelectionAllowed.BOOL, modifierItems)
    }

    toItem(): Record<string, unknown> {
        return {
            M: {
                groupName: {S: this.groupName},
                mustSelect: {BOOL: this.mustSelect},
                multipleSelectionAllowed: {BOOL: this.multipleSelectionAllowed},
                modifierItems: {L: this.modifierItems.map((e) => e.toItem())}
            }
        }
    }
}

export class ModifierItem {
    itemName: string
    price: number

    constructor(itemName: string, price: number) {
        this.itemName = itemName
        this.price = price
    }

    static fromItem(item?: DynamoDB.AttributeMap): ModifierItem {
        if (!item) throw new Error("Category Not Found")
        return new ModifierItem(item.itemName.S, Number(item.price.N))
    }

    toItem(): Record<string, unknown> {
        return {
            M: {
                itemName: {S: this.itemName},
                price: {N: this.price.toString()}
            }
        }
    }
}

export const createMenuItem = async (menuItem: MenuItem): Promise<MenuItem> => {
    const client = getClient();
    const category = new MenuCategory(menuItem.vendorid, menuItem.category, '')
    try {

        const resp = await executeTransactWrite({
            client,
            params: {
                TransactItems: [
                    {
                        Put: {
                            TableName: process.env.TABLE_NAME,
                            Item: menuItem.toItem(),
                            ConditionExpression: "attribute_not_exists(PK)"
                        }
                    },
                    {
                        Update: {
                            TableName: process.env.TABLE_NAME,
                            Key: category.keys(),
                            ConditionExpression: "attribute_exists(PK)",
                            UpdateExpression: "SET #itemCount = #itemCount+ :inc",
                            ExpressionAttributeNames: {
                                "#itemCount": "itemCount"
                            },
                            ExpressionAttributeValues: {
                                ":inc": { N: "1" }
                            }
                        }
                    }
                ]
            }
        })
        console.log(JSON.stringify(resp))
        return menuItem;
    } catch (e) {
        console.error(JSON.stringify(e))
        throw e
    }
}

export const getMenuById = async (vendorid: string, category: string, itemid: string) => {
    const client = getClient();
    const item = new MenuItem(vendorid, category, itemid, "")

    try {
        const resp = await client
            .getItem({
                TableName: process.env.TABLE_NAME,
                Key: item.keys()
            })
            .promise()
        return MenuItem.fromItem(resp.Item)
    } catch (e) {
        console.error(JSON.stringify(e))
        throw e
    }
}

export const getMenuList = async (vendorid: string) => {
    const client = getClient();
    const item = new MenuItem(vendorid, "", "", "")

    try {
        const resp = await client
            .query({
                TableName: process.env.TABLE_NAME,
                KeyConditionExpression: "PK = :pk and begins_with(SK, :beginsWith)",
                ExpressionAttributeValues: {
                    ":pk": { S: item.pk },
                    ":beginsWith": { S: "MENU#" }
                }
            })
            .promise()
        console.log(`******Count: ${resp.Count}  ***************ScannedCount:    ${resp.ScannedCount}    CC:  ${resp.ConsumedCapacity}   *******************`);
        return resp.Items.map((item) => MenuItem.fromItem(item))
    } catch (e) {
        console.error(JSON.stringify(e))
        throw e
    }
}

export const getMenuCategoryList = async (vendorid: string, category: string) => {
    const client = getClient();
    const item = new MenuItem(vendorid, category, "", "")

    try {
        const resp = await client
            .query({
                TableName: process.env.TABLE_NAME,
                KeyConditionExpression: "PK = :pk and begins_with(SK, :beginsWith)",
                ExpressionAttributeValues: {
                    ":pk": { S: item.pk },
                    ":beginsWith": { S: `MENU#${category}#` }
                }
            })
            .promise()
        console.log(`******Count: ${resp.Count}  ***************ScannedCount:    ${resp.ScannedCount}    CC:  ${resp.ConsumedCapacity}   *******************`);
        return resp.Items.map((item) => MenuItem.fromItem(item))
    } catch (e) {
        console.error(JSON.stringify(e))
        throw e
    }
}