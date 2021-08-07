export interface MenuItemCreateRequest {
    item_name: string;
    item_price: number;
    description: string;
    tags?: (string)[] | null;
    active: boolean;
    modifiers?: (ModifiersEntity)[] | null;
}
export interface ModifiersEntity {
    group_name: string;
    item_list?: (ItemListEntity)[] | null;
    must_select: boolean;
    multiple_selection_allowed: boolean;
}
export interface ItemListEntity {
    modifier_name: string;
    price: number;
}
