var express = require('express');
var browserify = require('browserify');
var dnode = require('dnode');
var fs = require('fs');

var app = express.createServer();
app.use(express.static(__dirname + '/static'));
app.use(browserify({
    require : [ 'dnode', 'jquery-browserify', 'seq' ],
    base : __dirname + '/static/js',
    entry : __dirname + '/static/js/main.js',
}));
app.listen(8080);

var song = require('song');
dnode({
    sing : song(),
    save : function (filename, data, cb) {
        if (filename.match(/[^\w'! -]/)) {
            cb('Illegal filename');
        }
        else {
            fs.writeFile(
                __dirname + '/songs/' + filename + '.json',
                JSON.stringify(data),
                cb
            );
        }
    },
    load : function (filename, cb) {
        if (filename.match(/[^\w'! -]/)) {
            cb('Illegal filename');
        }
        else {
            fs.readFile(
                __dirname + '/songs/' + filename + '.json',
                function (data) {
                    cb(null, JSON.parse(data));
                }
            );
        }
    },
    list : function (cb) {
        fs.readdir(__dirname + '/songs', function (err, files) {
            if (err) cb(err)
            else cb(null, files
                .filter(function (file) {
                    return file.match(/\.json$/);
                })
                .map(function (file) {
                    return file.replace(/\.json$/, '');
                })
            )
        });
    },
}).listen(app);
