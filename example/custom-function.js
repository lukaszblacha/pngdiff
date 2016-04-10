var pngdiff = require('../');

pngdiff.outputDiff('1.png', '2.png', 'diff.png', diffFn)
    .catch(function(err) {
        console.error(err.message);
    });

function diffFn(pixel1, pixel2, match) {
    return match ? [255, 255, 255, 255] : [0, 0, 0, 255];
}
