var pngdiff = require('../');
var fs = require('fs');

var image1Buffer = fs.readFileSync('1.png');
var image2Stream = fs.createReadStream('2.png');

pngdiff.outputDiff(image1Buffer, image2Stream, 'diff.png')
    .catch(function(err) {
        console.error(err.message);
    });
