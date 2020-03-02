'use strict'
const s3FetchTemplate = require('./s3-fetch-template');
const doNothing = () => 'default.html';
const fetchTemplate = s3FetchTemplate('hello.html',doNothing);
fetchTemplate({url:'http://localhost/hello.html'},x => x)
.then(data => console.log(data))
.catch(err => console.log(err))