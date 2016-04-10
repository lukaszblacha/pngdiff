'use strict';
var Promise = require('bluebird');
var PNG = require('pngjs').PNG;
var Stream = require('stream');

var fs = require('fs');
var streamifier = require('streamifier');

function inputToStream(streamOrBufOrPath) {
    return new Promise(function(resolve, reject) {
        if (typeof streamOrBufOrPath === 'string') {
            streamOrBufOrPath = fs
                .createReadStream(streamOrBufOrPath)
                .once('error', reject);
        } else if (streamOrBufOrPath instanceof Buffer) {
            streamOrBufOrPath = streamifier
                .createReadStream(streamOrBufOrPath)
                .once('error', reject);
        }

        if (!(streamOrBufOrPath instanceof Stream)) {
            reject(new Error('Argument needs to be a valid read path, stream or buffer.'));
        }

        resolve(streamOrBufOrPath);
    });
}

function turnInputsIntoStreams(input1, input2) {
    var streams = [inputToStream(input1), inputToStream(input2)];
    return Promise.all(streams);
}

function defaultDiffFunction(pixel1, pixel2, match) {
    if (match) {
        return [0, 0, 0, 0];
    } else {
        return [
            255 - Math.abs(pixel1[0] - pixel2[0]),
            255 - Math.abs(pixel1[1] - pixel2[1]),
            255 - Math.abs(pixel1[2] - pixel2[2]),
            Math.max(100, 255 - Math.abs(pixel1[3] - pixel2[3]))
        ]
    }
}

function createPng(input) {
    return new Promise(function (resolve, reject) {
        var png = new PNG();
        input.pipe(png);
        png.once('error', reject);
        png.on('parsed', function () {
            resolve(png);
        });
    });
}

/**
 * option
 *    diffFunction: function that changes color of the pixel
 */
function outputDiffStream(streamOrBufOrPath1,
                          streamOrBufOrPath2,
                          diffFunction) {
    diffFunction = diffFunction || defaultDiffFunction;

    return turnInputsIntoStreams(streamOrBufOrPath1, streamOrBufOrPath2)
        .then(function (streams) {
            return Promise.all([createPng(streams[0]), createPng(streams[1])])
        })
        .then(function (pngs) {
            var width = Math.min(pngs[0].width, pngs[1].width);
            var height = Math.min(pngs[0].height, pngs[1].height);
            var dx = Math.abs(pngs[0].width - pngs[1].width);
            var dy = Math.abs(pngs[0].height - pngs[1].height);
            var output = new PNG({
                width: width + dx,
                height: height + dy
            });

            var diffMetric = 0;
            var offset = 0;
            var i;
            for (var y = 0; y < height + dy; y++) {
                for (var x = 0; x < width + dx; x++) {
                    var pixel1 = [0, 0, 0, 0];
                    var pixel2 = [0, 0, 0, 0];

                    if (x < pngs[0].width && y < pngs[0].height) {
                        i = (y * pngs[0].width + x) * 4;
                        pixel1 = pngs[0].data.slice(i, i + 4);
                    }

                    if (x < pngs[1].width && y < pngs[1].height) {
                        i = (y * pngs[1].width + x) * 4;
                        pixel2 = pngs[1].data.slice(i, i + 4);
                    }

                    var diff;
                    if (pixel1[0] !== pixel2[0] || pixel1[1] !== pixel2[1] ||
                        pixel1[2] !== pixel2[2] || pixel1[3] !== pixel2[3]) {

                        diffMetric += 4;
                        diff = diffFunction(pixel1, pixel2, false);
                    } else {
                        diff = diffFunction(pixel1, pixel2, true);
                    }

                    output.data[offset] = diff[0];
                    output.data[offset + 1] = diff[1];
                    output.data[offset + 2] = diff[2];
                    output.data[offset + 3] = diff[3];
                    offset += 4;
                }
            }

            return {
                output: output.pack(),
                metric: diffMetric / output.data.length * 100
            };
        });
}

function outputDiff(input1, input2, destPath, diffFunction) {
    return outputDiffStream(input1, input2, diffFunction)
        .then(function (res) {
            return new Promise(function(resolve, reject) {
                res.output.pipe(fs.createWriteStream(destPath))
                    .once('error', reject)
                    .once('close', function() {
                        resolve(res.metric);
                    })
            });
        });
}

module.exports = {
    outputDiff: outputDiff,
    outputDiffStream: outputDiffStream
};
