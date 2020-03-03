const s3 = require('../lib/s3');
const assert = require('assert');
describe('s3 tests', () => {

    describe('createBucket', () => {
        const targetBucket = 'fetch-template-test';
        it('successful when bucket does not exist', async () => {
            await s3.createBucket(targetBucket);
            const existingBucket = await s3.headBucket(targetBucket);
            assert(existingBucket);
        });

        it('fails when bucket already exists', async () => {
            await s3.createBucket(targetBucket);
            try {
                await s3.createBucket(targetBucket);
                assert.fail('It should have failed');

            } catch (e) {
                assert(e);
            }
        });

        afterEach(async () =>
            await s3.deleteBucket(targetBucket)
        );
    });

    describe('upload', () => {
        const targetBucket = 'fetch-template-test-upload';
        before(async () => {
            await s3.createBucket(targetBucket);
        });

        it('create when file does not exist', async () => {
            await s3.upload(targetBucket, 'test-key', 'test');
            assert(s3.headObject(targetBucket, 'test-key'));
        });

        it('update when file exists', async () => {
            await s3.upload(targetBucket, 'test-key', 'test-2');
            const content = await s3.getObjectContents(targetBucket, 'test-key')
            assert(content === 'test-2');
        });

        after(async () => {
            await s3.deleteObject(targetBucket, 'test-key', 'test');
            await s3.deleteBucket(targetBucket);
        })
    })

    describe('getObjectContents', () => {
        const targetBucket = 'fetch-template-test-upload';
        before(async () => {
            await s3.createBucket(targetBucket);
        });

        it('Successful when file exists', async () => {
            await s3.upload(targetBucket, 'test-key', 'test');
            const content = await s3.getObjectContents(targetBucket, 'test-key')
            assert(content === 'test');
        });

        it('fails when file does not exist', async () => {
            try {
                await s3.getObjectContents(targetBucket, 'test-key')
            } catch (e) {
                assert(e);
            }
        });
        it('fails when bucket does not exist', async () => {
            try {
                await s3.getObjectContents('invalid-bucket', 'test-key')
            } catch (e) {
                assert(e);
            }
        });

        after(async () => {
            await s3.deleteObject(targetBucket, 'test-key', 'test');
            await s3.deleteBucket(targetBucket);
        })
    })

    describe('DeleteBucket', () => {
        const targetBucket = 'fetch-template-test-upload';
        it('Successful when bucket exists', async () => {
            await s3.createBucket(targetBucket);
            const result = await s3.deleteBucket(targetBucket);
            assert(result);
        });

        it('fails when bucket does not exist', async () => {
            try {
                await s3.deleteBucket('invalid-bucket')
            } catch (e) {
                assert(e);
            }
        });
        it('fails when bucket has files', async () => {
            try {
                await s3.createBucket(targetBucket);
                await s3.upload(targetBucket, 'foo', 'bar');
                await s3.deleteBucket(targetBucket);
            } catch (e) {
                assert(e);
                await s3.deleteObject(targetBucket, 'foo');
            }
        });

        after(async () => {
            await s3.deleteBucket(targetBucket);
        })
    })

    describe('headObject', () => {
        const targetBucket = 'fetch-template-test-headObject-2';
        before(async () => {
            await s3.createBucket(targetBucket);
        });

        it('successful when file exists', async () => {
            await s3.upload(targetBucket, 'test-key', 'test');
            const content = await s3.headObject(targetBucket, 'test-key')
            assert(content);
        });

        it('fails when file does not exist', async () => {
            try {
                await s3.headObject(targetBucket, 'test-fake-key')
            } catch (e) {
                assert(e);
            }
        });
        after(async () => {
            await s3.deleteObject(targetBucket, 'test-key');
            await s3.deleteBucket(targetBucket);
        })
    })

    describe('headBucket', () => {
        const targetBucket = 'fetch-template-test-headBucket';
        it('successful when bucket exists', async () => {
            await s3.createBucket(targetBucket)
            const content = await s3.headBucket(targetBucket)
            assert(content);
        });

        it('fails when bucket does not exist', async () => {
            try {
                await s3.headObject('invalid-bucket')
            } catch (e) {
                assert(e);
            }
        });

        after(async () => {
            await s3.deleteBucket(targetBucket);
        })
    })

});