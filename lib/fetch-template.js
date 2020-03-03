'use strict'
const s3 = require('./s3')
const {TemplateError, TEMPLATE_ERROR,TEMPLATE_NOT_FOUND} = require('./template-error');
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
 * Returns True if the path ends is a valid template file or false othwerwise.
 * @param {String} path 
 */
const isPathAnHtmlFile = path => path.endsWith('html');

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
        s3.fileExists(bucket,templatesPath).then(
            data => {
                let templateStat = {
                    isFile: true
                };

                if (templateStat.isFile) {
                    templateStat.path = templatesPath;
                } else {
                    templateStat.path = factoryFilePath(
                        templatesPath,
                        pathname
                    );
                }

                return resolve(templateStat);
            },
            
        ).catch(err => reject(new TemplateError(err)))
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
        return s3.getObjectContents(bucket,templateStat.path).then(baseTemplate => {
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
            return s3.getObjectContents(bucket,baseTemplatePath).then(baseTemplate =>
                parseTemplate(baseTemplate, pageTemplate)
            );
        });
    });
};