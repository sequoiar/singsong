var express = require('express');
var browserify = require('browserify');
var dnode = require('dnode');

var app = express.createServer();
app.use(express.static(__dirname + '/static'));
app.use(browserify({
    require : [ 'dnode', 'jquery-browserify', 'seq' ],
    base : __dirname + '/static/js',
    entry : __dirname + '/static/js/main.js',
}));
app.listen(8080);

var song = require('song');
dnode({ sing : song() }).listen(app);
