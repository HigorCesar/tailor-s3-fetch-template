'use strict';
const fetchTemplate = require('../lib/fetch-template');
const assert = require('assert');
const sinon = require('sinon');
const path = require('path');
const s3 = require('../lib/s3');
require('dotenv').config()

describe('fetch-template', () => {
    let mockParseTemplate;
    const mockRequest = { url: 'http://localhost:8080/test' };
    const bucket = process.env.AWS_BUCKET_NAME
    const templatePath = path.join('templates');
    const baseTemplatePath = path.join(templatePath, 'base-template.html');
    const testTemplatePath = path.join(templatePath, 'test.html');

    before(async () => {
        await s3.createBucket(bucket);
        await s3.upload(bucket, baseTemplatePath, '<div>base-template</div>');
        await s3.upload(bucket, testTemplatePath, '<div>test</div>');
    });

    beforeEach(() => (mockParseTemplate = sinon.spy()));

    after(async () => {
        await s3.deleteObject(bucket, baseTemplatePath);
        await s3.deleteObject(bucket, testTemplatePath);
        await s3.deleteBucket(bucket);
    });

    afterEach(() => mockParseTemplate.reset());

    describe('templatePath - File', () => {
        it('should fetch template from file path', () => {
            return fetchTemplate(testTemplatePath)(
                mockRequest,
                mockParseTemplate
            ).then(() => {
                assert(mockParseTemplate.calledOnce);
                assert(mockParseTemplate.calledWith('<div>test</div>'));
            });
        });

        it('should throw TEMPLATE_NOT_FOUND error on wrong file path', () => {
            const wrongTemplatePath = path.join(
                templatePath,
                'wrong-template.html'
            );
            return fetchTemplate(wrongTemplatePath)(
                mockRequest,
                mockParseTemplate
            ).catch(err => {
                assert(err.code, 1);
                assert(err.presentable, 'template not found');
            });
        });
    });

    describe('templatePath - Dir', () => {
        it('should fetch the template with absolute path when baseTemplateFn is falsy', () => {
            const baseTemplateFn = () => null;
            return fetchTemplate(templatePath, baseTemplateFn)(
                mockRequest,
                mockParseTemplate
            ).then(() => {
                assert(mockParseTemplate.calledOnce);
                assert(mockParseTemplate.calledWith('<div>test</div>'));
            });
        });

        it('should fetch template with relative path and baseTemplateFn', () => {
            const baseTemplateFn = () => 'base-template';

            return fetchTemplate(templatePath, baseTemplateFn)(
                mockRequest,
                mockParseTemplate
            ).then(() => {
                assert(mockParseTemplate.calledOnce);
                assert(
                    mockParseTemplate.calledWith(
                        '<div>base-template</div>',
                        '<div>test</div>'
                    )
                );
            });
        });

        it('should throw TEMPLATE_NOT_FOUND error for wrong template path', () => {
            const request = { url: 'http://localhost:8080/unknown' };
            return fetchTemplate(templatePath)(
                request,
                mockParseTemplate
            ).catch(err => {
                assert(err.code, 1);
                assert(err.presentable, 'template not found');
            });
        });
    });
});