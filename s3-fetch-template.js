'use strict'
const S3 = require('./s3.js')
const Error = require('./template-error.js');
const url = require('url');

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
        let templateStat = {
            isFile:true
        };
        if(isPathAnHtmlFile(templatesPath)){
            templateStat.path = templatesPath;
            return resolve(templateStat);
        }
        if(isPathAnHtmlFile(factoryFilePath(templatesPath,pathname)))
        {
            templateStat.path = factoryFilePath(templatesPath,pathname);
            return resolve(templateStat);
        }
        return reject(new Error.TemplateError('It is not possible to create a valid file path.'))
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
        return S3.getObjectContents('tailor-templates',templateStat.path).then(baseTemplate => {
            if (templateStat.isFile) {
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
            return S3.getObjectContents('tailor-templates',baseTemplatePath).then(baseTemplate =>
                parseTemplate(baseTemplate, pageTemplate)
            );
        });
    });
};