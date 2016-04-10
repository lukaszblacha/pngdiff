var pngdiff = require('../');

pngdiff.outputDiff('1.png', '2.png', 'diff.png', diffFn)
    .catch(function(err) {
        console.error(err.message);
    });

function getAvg(pixel1, pixel2) {
    var result = [];
    pixel1.forEach(function(val, idx) {
        result.push((pixel1[idx] + pixel2[idx]) / 2);
    });
    return result;
}

function diffFn(pixel1, pixel2, match) {
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