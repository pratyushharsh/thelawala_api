import {Item} from "./base";
import {getClient} from "./client";
import {DynamoDB} from "aws-sdk";
import {Images} from "./image";
import {MenuItem} from "./menuItem";
let geohash = require('ngeohash');


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

    // adding location detail to vendor
    locationHash: string
    currentLocation: Location
    lastLocationUpdateTime: string

    constructor(userid: string, name: string, email: string, phone: string,
                introduction?: string,
                tagline?: string, website?: string,
                facebook?: string, instagram?: string, youtube?: string, twitter?: string, cuisines?: string[], logo?: Images,
                locationHash?: string, currentLocation?: Location, lastLocationUpdateTime?: string) {
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
        this.locationHash = locationHash
        this.currentLocation = currentLocation
        this.lastLocationUpdateTime = lastLocationUpdateTime
    }

    static fromItem(item?: DynamoDB.AttributeMap): Vendor {
        if (!item) throw new Error("Vendor Not Found");
        const logo = Images.fromItem(item.logo?.M) || null
        return new Vendor(item.userid.S, item.name.S, item.email.S, item.phone?.S,
            item.introduction?.S, item.tagline?.S, item.website?.S,
            item.facebook?.S, item.instagram?.S, item.youtube?.S, item.twitter?.S, item.cuisines?.SS, logo, item.locationHash?.S,
            item.currentLocation ? Location.fromItem(item.currentLocation.M) : null, item.lastLocationUpdateTime?.S)
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
            logo: null,
            locationHash: null,
            currentLocation: this.currentLocation.toItem(),
            lastLocationUpdateTime: null
        }
    }
}

export class Location {
    latitude: number
    longitude: number

    constructor(latitude: number, longitude: number) {
        this.latitude = latitude
        this.longitude = longitude
    }

    static fromItem(item?: DynamoDB.AttributeMap): Location {
        if (!item) throw new Error("Category Not Found")
        return new Location(Number(item.latitude.N), Number(item.longitude.N))
    }

    toItem(): Record<string, unknown> {
        return {
            M: {
                latitude: {N: this.latitude.toString()},
                longitude: {N: this.longitude.toString()}
            }
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

export const updateVendorLocation = async (vendorid: string, lat: number, lng: number): Promise<void> => {
    const client = getClient();
    const vendor = new Vendor(vendorid, "", "", "")
    const loc = new Location(lat, lng)
    const timeStamp = new Date().toISOString();
    const hash: string = geohash.encode(lat, lng, 9)
    hash.charAt(0)
    try {
        const config = {
            TableName: 'THELAWALA',
            Key: vendor.keys(),
            ConditionExpression: "attribute_exists(PK)",
            UpdateExpression: "SET #currentLocation = :currentLocation, #lastLocationUpdateTime = :lastLocationUpdateTime, #geohash = :geohash, #region = :region",
            ExpressionAttributeNames: {
                "#currentLocation": "currentLocation",
                "#lastLocationUpdateTime": "lastLocationUpdateTime",
                "#geohash": "GSI1SK",
                "#region": "GSI1PK"
            },
            ExpressionAttributeValues: {
                ":currentLocation": loc.toItem(),
                ":lastLocationUpdateTime": {
                    S: timeStamp
                },
                ":geohash": {
                    S: hash
                },
                ":region": {
                    S: hash.charAt(0)
                },
            },
            ReturnValues:"UPDATED_NEW"
        };
        const resp = await client.updateItem(
            config
        ).promise();
        console.log(resp);
        // return resp;
    } catch (e) {
        console.log(e)
        throw e
    }
}

export const getVendorsWithinLocation = async () => {
    const client = getClient();

    try {
        const resp = await client
            .query({
                TableName: process.env.TABLE_NAME,
                IndexName: "GSI1",
                KeyConditionExpression: "GSI1PK = :pk and begins_with(GSI1SK, :beginsWith)",
                ExpressionAttributeValues: {
                    ":pk": { S: 't' },
                    ":beginsWith": { S: "tut" }
                }
            })
            .promise()
        console.log(`******Count: ${resp.Count}  ***************ScannedCount:    ${resp.ScannedCount}    CC:  ${resp.ConsumedCapacity}   *******************`);
        return resp.Items.map((item) => Vendor.fromItem(item))
    } catch (e) {
        console.error(JSON.stringify(e))
        throw e
    }
}