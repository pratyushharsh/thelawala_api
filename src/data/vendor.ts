import {Item} from "./base";
import {getClient} from "./client";
import {DynamoDB} from "aws-sdk";
import {Images} from "./image";

export class Vendor extends Item {
    vendorid: string
    name: string
    introduction: string
    tagline: string
    // reviewCount: number

    logo: Images

    facebook?: string
    instagram?: string
    youtube?: string
    twitter?: string

    email: string
    phone: string
    website?: string

    cuisines: string[]

    constructor(userid: string, name: string, email: string, phone: string,
                introduction?: string,
                tagline?: string, website?: string,
                facebook?: string, instagram?: string, youtube?: string, twitter?: string, cuisines?: string[], logo?: Images) {
        super();
        this.vendorid = userid
        this.name = name
        // this.reviewCount = reviewCount || 0
        this.tagline = tagline || ""
        this.introduction = introduction || ""

        this.email = email
        this.phone = phone
        this.website = website

        this.facebook = facebook
        this.instagram = instagram
        this.youtube = youtube
        this.twitter = twitter

        this.cuisines = cuisines || []
        this.logo = logo
    }

    static fromItem(item?: DynamoDB.AttributeMap): Vendor {
        if (!item) throw new Error("Vendor Not Found");
        const logo = Images.fromItem(item.logo?.M) || null
        return new Vendor(item.userid.S, item.name.S, item.email.S, item.phone?.S,
            item.introduction?.S, item.tagline?.S, item.website?.S,
            item.facebook?.S, item.instagram?.S, item.youtube?.S, item.twitter?.S, item.cuisines?.SS, logo)
    }

    get pk(): string {
        return `VENDOR#${this.vendorid}`;
    }

    get sk(): string {
        return `VENDOR#${this.vendorid}`;
    }

    toItem(): Record<string, unknown> {
        return {
            ...this.keys(),
            userid: {S: this.vendorid},
            name: {S: this.name},
            introduction: {S: this.introduction},
            tagline: {S: this.tagline},
            // reviewCount: {N: this.reviewCount.toString()},

            email: {S: this.email},
            phone: {S: this.phone},
            website: {S: this.website},

            facebook: {S: this.facebook},
            instagram: {S: this.instagram},
            youtube: {S: this.youtube},
            twitter: {S: this.twitter},

            cuisines: {SS: this.cuisines},
            logo: null
        }
    }
}

export const createVendor = async (vendor: Vendor): Promise<Vendor> => {
    const client = getClient();

    try {
        await client.putItem({
            TableName: process.env.TABLE_NAME,
            Item: vendor.toItem()
        }).promise();
        return vendor;
    } catch (e) {
        console.log(e)
        throw e
    }
}

export const getVendor = async (vendorid: string): Promise<Vendor> => {
    const client = getClient();
    const vendor = new Vendor(vendorid, "", "", "")

    try {
        const resp = await client
            .getItem({
                TableName: process.env.TABLE_NAME,
                Key: vendor.keys()
            })
            .promise()
        return Vendor.fromItem(resp.Item)
    } catch (e) {
        console.log(e)
        throw e
    }
}