
const express = require('express');

var app = express();
var port = process.env.PORT || 5000;

app.use(express.static('build'))

app.listen(port, () => {
  console.log(`Started  on port ${port}`);
})

