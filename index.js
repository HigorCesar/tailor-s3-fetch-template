'use strict'
const s3 = require('./s3.js')

//s3.createBucket('hello-world4').then(data => console.log(`Success: ${data}`)).catch(err => console.log(`Error: ${err}`));
s3.getObjectContents('tailor-templates','hello.txt')
.then(data => console.log(`Success: ${data}`))
.catch(err => console.log(`Error: ${err}`));