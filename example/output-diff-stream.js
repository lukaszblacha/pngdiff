var pngdiff = require('../');
var fs = require('fs');

pngdiff.outputDiffStream('1.png', '2.png')
    .then(function(data) {
        if (data.metric === 0) {
            console.log('No difference, no need to output diff result.');
        } else {
            console.log('Found difference: ', data.metric, '%');
            data.output.pipe(fs.createWriteStream('diff.png'));
        }
    })
    .catch(function(err) {
        console.error(err);
    });
