'use strict'
const s3 = require('./s3')
const path = require('path');
const { TemplateError, TEMPLATE_ERROR, TEMPLATE_NOT_FOUND } = require('./template-error');
const url = require('url');
const bucket = process.env.AWS_BUCKET_NAME;
/**
 * Returns pathname by request
 *
 * @param  {Object} request - Request Object
 *
 * @return {String} pathname
 */
const getPathName = request => url.parse(request.url, true).pathname;

/**
 * Factory the complete file path
 *
 * @param  {String} templatesPath - Templates dir path
 * @param  {String} filename - file name without extension
 *
 * @return {String} complete file path
 */
const factoryFilePath = (templatesPath, filename) =>
    `${path.join(templatesPath, filename)}.html`;

/**
 * Returns the template path validating a exactly file or a directory
 *
 * @param  {String} templatesPath - TemplatesPath config
 * @param  {String} pathname - Path name based on Request Object
 *
 * @return {Promise} Template Info object on success or TemplateError on fail
 */
const getTemplatePath = (templatesPath, pathname) =>
    new Promise((resolve, reject) => {
        let templateStat = {
            isFile: true
        };
        s3.headObject(bucket, templatesPath).then(
            data => {
                templateStat.path = templatesPath;
                return resolve(templateStat);
            },

        ).catch(err => {
            let templateStat = {
                isFile: false
            };
            templateStat.path = factoryFilePath(
                templatesPath,
                pathname);
            return resolve(templateStat);

        })
    });
/**
 * Fetches the template from File System
 *
 * @param {string} templatesPath - The path where the templates are stored
 * @param {function=} baseTemplateFn - Function that returns the Base template name for a given page
 */
module.exports = (templatesPath, baseTemplateFn) => (
    request,
    parseTemplate
) => {
    const pathname = getPathName(request);
    return getTemplatePath(templatesPath, pathname).then(templateStat => {
        return s3.getObjectContents(bucket, templateStat.path).then(baseTemplate => {
            if (templateStat.isFile || typeof baseTemplateFn !== 'function') {
                return parseTemplate(baseTemplate);
            }

            const templateName = baseTemplateFn(pathname);
            if (!templateName) {
                return parseTemplate(baseTemplate);
            }

            const pageTemplate = baseTemplate;
            const baseTemplatePath = factoryFilePath(
                templatesPath,
                templateName
            );
            return s3.getObjectContents(bucket, baseTemplatePath).then(baseTemplate =>
                parseTemplate(baseTemplate, pageTemplate)
            );
        }).catch(e => {
            return new TemplateError('ENOENT');
        });;
    });
};