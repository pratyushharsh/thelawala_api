import {Order} from "./order";
import {getClient} from "./client";

export class Sequence {
    sequenceType: string
    sequenceValue: number

    constructor(sequenceType: string, sequenceValue: number) {
        this.sequenceType = sequenceType
        this.sequenceValue = sequenceValue
    }

    keys() {
        return {
            sequenceType: {
                S: this.sequenceType
            }
        }
    }
}

export const nextSequence = async (seq: Sequence): Promise<Sequence> => {
    const client = getClient();
    try {
        const config = {
            TableName: process.env.SEQUENCE_TABLE,
            Key: seq.keys(),
            ConditionExpression: "attribute_exists(sequenceType)",
            UpdateExpression: "SET #sequenceValue = #sequenceValue + :sequenceValue",
            ExpressionAttributeNames: {
                "#sequenceValue": "sequenceValue"
            },
            ExpressionAttributeValues: {
                ":sequenceValue": {
                    N: '1'
                }
            },
            ReturnValues:"UPDATED_NEW"
        };
        const resp = await client.updateItem(
            config
        ).promise();

        console.log(resp)
        return new Sequence(seq.sequenceType, Number(resp.Attributes.sequenceValue.N))
    } catch (e) {
        console.error(e);
        throw e;
    }
}