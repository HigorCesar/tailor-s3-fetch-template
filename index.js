'use strict'
const fetchTemplate = require('./lib/fetch-template');
const doNothing = () => 'default.html';
const fetchTemplate = fetchTemplate('hello.html',doNothing);
fetchTemplate({url:'http://localhost/hello.html'},x => x)
.then(data => console.log(data))
.catch(err => console.log(err))