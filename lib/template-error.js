'use strict'
const TEMPLATE_ERROR = 0;
const TEMPLATE_NOT_FOUND = 1;

class TemplateError extends Error {
    constructor(code) {
        super(code)
        this.code = TEMPLATE_ERROR;
        this.presentable = 'template error';
        if (code === 'ENOENT') {
            this.code = TEMPLATE_NOT_FOUND;
            this.presentable = 'template not found';
        }
    }
}
module.exports.TemplateError = TemplateError;
module.exports.TEMPLATE_ERROR = TEMPLATE_ERROR;
module.exports.TEMPLATE_NOT_FOUND = TEMPLATE_NOT_FOUND;