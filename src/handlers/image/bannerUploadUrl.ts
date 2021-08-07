import { APIGatewayEvent } from 'aws-lambda';
const AWS = require("aws-sdk");

const s3 = new AWS.S3()

const URL_EXPIRATION_SECONDS = 300