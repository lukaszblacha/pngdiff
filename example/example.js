var fs = require('fs');
var pngdiff = require('../');

var image2Stream = fs.createReadStream('2.png');
pngdiff.outputDiff('1.png', image2Stream, 'diffOutput.png')
    .then(function(data) {
        console.log(data.metric > 0 ? 'Difference detected.' : 'No difference');
        console.log('Diff saved to file ' + data.output);
    })
    .catch(function(err) {
        console.error(err);
    });

var image1Buffer = fs.readFileSync('1.png');
pngdiff.outputDiffStream(image1Buffer, '2.png', diffFn)
    .then(function(data) {
        if (data.metric === 0) {
            console.log('No difference, no need to output diff result.');
        } else {
            data.output.pipe(fs.createWriteStream('diffOutput2.png'));
        }
    })
    .catch(function(err) {
        console.error(err);
    });

pngdiff.outputDiff('1.png', '2.png', 'diffOutput.png', changeFn)
    .catch(function(err) {
        console.error(err.message);
    });

function diffFn(pixel1, pixel2, match) {
    return match ? [255, 255, 255, 255] : [0, 0, 0, 255];
}

function getAvg(pixel1, pixel2) {
    var result = [];
    pixel1.forEach(function(val, idx) {
        result.push((pixel1[idx] + pixel2[idx]) / 2);
    });
    return result;
}

function changeFn(pixel1, pixel2, match) {
    var addRed = 60;
    if (match) {
        return [
            pixel1[0],
            pixel1[1],
            pixel1[2],
            pixel1[3] / 2
        ];
    } else {
        var avg = getAvg(pixel1, pixel2);
        // turn the diff pixels redder. No change to alpha
        if (avg[0] + addRed <= 255) {
            return [
                avg[0] + addRed,
                Math.max(avg[1] - addRed, 0),
                Math.max(avg[2] - addRed, 0),
                Math.max(50, Math.min(255, avg[3] * 2))
            ];
        } else {
            // too bright; subtract G and B instead
            return [
                avg[0],
                Math.max(0, avg[1] - addRed),
                Math.max(0, avg[2] - addRed),
                Math.max(50, Math.min(255, avg[3] * 2))
            ];
        }
    }
}