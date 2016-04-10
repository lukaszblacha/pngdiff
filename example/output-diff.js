var pngdiff = require('../');

pngdiff.outputDiff('1.png', '2.png', 'diff.png')
    .then(function(data) {
        console.log(data.metric > 0 ? 'Difference detected.' : 'No difference');
        console.log('Diff saved to file ' + data.output);
    })
    .catch(function(err) {
        console.error(err);
    });