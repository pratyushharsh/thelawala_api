import {S3Event, S3EventRecord} from 'aws-lambda';
const AWS = require("aws-sdk");

const s3 = new AWS.S3()

const s3Service = require('../../service/s3Service').s3Service
const sharpService = require('../../service/sharpService').sharpService


const imageSizes = {
    banner: [1400, 350],
    content: [274, 377]
}

export const main = async (event: S3Event) => {
    console.log(JSON.stringify(event))
    if (!event || !event.Records ||
        !event.Records[0] || !event.Records[0].s3 ||
        !event.Records[0].s3.object || !event.Records[0].s3.object.key) {
        const errorMessage = 'Please provide a valid S3 trigger event'
        console.error(errorMessage)
        return { statusCode: 500, body: JSON.stringify({ message: errorMessage }) }
    }

    try {
        const splitPath = event.Records[0].s3.object.key.split('/')
        const imagesSize = imageSizes[splitPath[0]] || imageSizes.content
        const imageData = await s3Service.getObject('thelawala-images-dev', event.Records[0].s3.object.key)

        if (!await sharpService.isValidSize(imageData, imagesSize)) {
            const errorMessage = `Cannot resize ${event.Records[0].s3.object.key}. The original height or width is less than the desired values of [${imagesSize}]`
            console.error(errorMessage)
            return { statusCode: 500, body: JSON.stringify({ message: errorMessage }) }
        }

        const convertedImageData = await sharpService.convertImage(imageData, imagesSize)
        await s3Service.saveImage('vendorprofile', `${event.Records[0].s3.object.key.split('.').slice(0, -1).join('.')}.jpg`, convertedImageData)
        return { statusCode: 200 }
    } catch (error) {
        console.error(`Error thrown while processing the ${event.Records[0].s3.object.key} image. ${error.message}`, error)
        return { statusCode: 500, body: JSON.stringify({ message: error.message }) }
    }
}