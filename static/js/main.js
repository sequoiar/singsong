var dnode = require('dnode');
var $ = require('jquery-browserify');

$(window).ready(function () {
    dnode.connect(function (remote) {
        remote.sing([
            {
                note : 'E3',
                durations : [ { beats : 0.3, text : 'hello' } ]
            },
            {
                note : 'F#4',
                durations : [ { beats : 0.3, text : 'cruel' } ]
            },
            {
                note : 'C3',
                durations : [ { beats : 0.3, text : 'world' } ]
            },
        ]);
    });
});
