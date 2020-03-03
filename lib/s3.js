'use strict'
const s3 = require('aws-sdk/clients/s3');
const { promisify } = require('util');
const Error = require('./template-error');
const { Readable } = require('stream')

require('dotenv').config()
const client = new s3({ apiVersion: '2006-03-01', endpoint: process.env.AWS_S3_ENDPOINT, region: process.env.AWS_REGION, s3ForcePathStyle: true });

const createBucketPromise = promisify(client.createBucket).bind(client);
const getObjectPromise = promisify(client.getObject).bind(client);
const uploadPromise = promisify(client.upload).bind(client);
const deleteObjectPromise = promisify(client.deleteObject).bind(client);
const deleteBucketPromise = promisify(client.deleteBucket).bind(client);
const headObjectPromise = promisify(client.headObject).bind(client);
const headBucketPromise = promisify(client.headBucket).bind(client);

const createBucket = name => {
    return new Promise((resolve, reject) => {
        createBucketPromise({ Bucket: name, ACL: 'public-read' })
            .then(data => resolve(data))
            .catch(err => reject(err))
    })
}
const upload = (bucket, key, body) => {
    return new Promise((resolve, reject) => {
        const readable = Readable.from(body)
        var uploadParams = { Bucket: bucket, Key: key, Body: readable };
        uploadPromise(uploadParams)
            .then(data => resolve({ 'location': data.location }))
            .catch(err => reject(err));
    });
};

const getObjectContents = (bucket, key) => {
    return new Promise((resolve, reject) => {
        return getObjectPromise({ Bucket: bucket, Key: key })
            .then(data => resolve(data.Body.toString()))
            .catch(err => reject(new Error.TemplateError(err)))
    })
};

const deleteObject = (bucket, key) => {
    return new Promise((resolve, reject) => {
        var params = { Bucket: bucket, Key: key };
        return deleteObjectPromise(params)
            .then(_ => resolve(_))
            .catch(err => reject(err));
    });
};

const deleteBucket = bucket => {
    return new Promise((resolve, reject) => {
        var params = { Bucket: bucket };
        return deleteBucketPromise(params)
            .then(data => resolve(data))
            .catch(err => reject(err));
    });
};

const headObject = (bucket, key) => {
    return new Promise((resolve, reject) => {
        var params = { Bucket: bucket, Key: key };
        return headObjectPromise(params)
            .then(data => resolve(data))
            .catch(err => reject(err));
    });
}

const headBucket = bucket => {
    return new Promise((resolve, reject) => {
        var params = { Bucket: bucket };
        headBucketPromise(params)
            .then(data => resolve(data))
            .catch(err => reject(err));
    });
}

module.exports.createBucket = createBucket;
module.exports.getObjectContents = getObjectContents;
module.exports.upload = upload;
module.exports.deleteObject = deleteObject;
module.exports.deleteBucket = deleteBucket;
module.exports.headObject = headObject;
module.exports.headBucket = headBucket;
