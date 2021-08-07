import {DynamoDB} from "aws-sdk";

export class Images {
    small: string
    medium: string
    large: string

    constructor(small: string, medium: string, large: string) {
        this.small = small
        this.medium = medium
        this.large = large
    }

    static fromItem(item?: DynamoDB.AttributeMap): Images {
        if (!item) {
            console.error(`No Image Found`)
            return
        }
        return new Images(item?.small.S, item?.medium.S, item?.large.S);
    }

    toItem(): Record<string, unknown> {
        return {
            M: {
                small: {S: this.small},
                medium: {S: this.medium},
                large: {S: this.large},
            }
        }
    }
}