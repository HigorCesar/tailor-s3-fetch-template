'use strict'
const S3 = require('aws-sdk/clients/s3');
const { promisify } = require('util');

require('dotenv').config()

const client = new S3({ apiVersion: '2006-03-01', endpoint: process.env.AWS_S3_ENDPOINT, region: process.env.AWS_REGION, s3ForcePathStyle: true });

const createBucketPromise = promisify(client.createBucket).bind(client);
const getFilePromise = promisify(client.getObject).bind(client);

const createBucket = bucketName => {
    return new Promise((resolve, reject) => {
        createBucketPromise({ Bucket: bucketName, ACL: 'public-read' })
            .then(data => resolve(data))
            .catch(err => reject(err))
    })
}
const getObjectContents = (bucketName, key) => {
    return new Promise((resolve,reject) =>{
        return getFilePromise({ Bucket: bucketName, Key: key })
        .then(data => resolve(data.Body.toString()))
        .catch(err => reject(err))
    })
};

exports.createBucket = createBucket;
exports.getObjectContents = getObjectContents;