'use strict';

var test = require('tape');
var concat = require('concat-stream');
var fs = require('fs');

var pngdiff = require('../');

var img1Path = 'test/fixtures/1.png';
var img2Path = 'test/fixtures/2.png';
var imgDotPath = 'test/fixtures/dot.png';
var tempImgPath = 'temp.png';

var img2Stream;
var img2Buf;

function _compareDiff1(stream, t) {
    stream.pipe(concat(function(buf1) {
        fs.createReadStream('test/fixtures/expected12Diff.png').pipe(concat(function(buf2) {
            t.equal(buf1.length, buf2.length);

            for (var i = 0; i < buf1.length; i++) {
                if (buf1[i] !== buf2[i]) {
                    fs.writeFileSync(__dirname + '/fixtures/failTest.png', buf1);
                    t.end('Generated file is different then expected one');
                    return;
                }
            }
            t.end();
        }));
    }));
}

test('outputDiffStream should error for misinput', {timeout: 3000}, function(t) {
    pngdiff.outputDiffStream('bla', img1Path)
        .then(function() {
            t.end('Expected to throw the misinput error');
        })
        .catch(function(err) {
            t.equal(err.message, 'ENOENT: no such file or directory, open \'bla\'');
            t.end();
        });
});

test('outputDiffStream should NOT error for different image dimensions', {timeout: 3000}, function(t) {
    pngdiff.outputDiffStream(img1Path, imgDotPath)
        .then(function() {
            t.end();
        })
        .catch(t.end);
});

test('outputDiffStream should accept a stream', {timeout: 3000}, function(t) {
    img2Stream = fs.createReadStream(img2Path);

    pngdiff.outputDiffStream(img1Path, img2Stream)
        .then(function(res) {
            _compareDiff1(res.output, t);
        })
        .catch(t.end);
});

test('outputDiffStream should accept a buffer', {timeout: 3000}, function(t) {
    img2Buf = fs.readFileSync(img2Path);

    pngdiff.outputDiffStream(img1Path, img2Buf)
        .then(function(res) {
            _compareDiff1(res.output, t);
        })
        .catch(t.end);
});

test('outputDiffStream should output the diff as a stream', {timeout: 3000}, function(t) {
    pngdiff.outputDiffStream(img1Path, img2Path)
        .then(function(res) {
            _compareDiff1(res.output, t);
        })
        .catch(t.end);
});

test('outputDiff should error for misinput', {timeout: 3000}, function(t) {
    pngdiff.outputDiff('bla', img1Path, tempImgPath)
        .then(function() {
            t.end('outputDiff did not error for misinput');
        })
        .catch(function(err) {
            t.equal(err.message, 'ENOENT: no such file or directory, open \'bla\'');
            t.end();
        });
});

test('outputDiff should NOT error for different image dimensions', {timeout: 3000}, function(t) {
    pngdiff.outputDiff(img1Path, imgDotPath, tempImgPath)
        .then(function() {
            t.end();
        }).catch(t.end);
});

test('outputDiff should accept a stream', {timeout: 3000}, function(t) {
    img2Stream = fs.createReadStream(img2Path);

    pngdiff.outputDiff(img1Path, img2Stream, tempImgPath)
        .then(function() {
            _compareDiff1(fs.createReadStream(tempImgPath), t);
        }).catch(t.end);
});

test('outputDiff should accept a buffer', {timeout: 3000}, function(t) {
    img2Buf = fs.readFileSync(img2Path);

    pngdiff.outputDiff(img1Path, img2Buf, tempImgPath)
        .then(function() {
            _compareDiff1(fs.createReadStream(tempImgPath), t);
        }).catch(t.end);
});

test('outputDiff should output the diff', {timeout: 3000}, function(t) {
    pngdiff.outputDiff(img1Path, img2Path, tempImgPath)
        .then(function() {
            _compareDiff1(fs.createReadStream(tempImgPath), t);
        }).catch(t.end);
});
