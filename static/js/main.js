var dnode = require('dnode');
var $ = require('jquery-browserify');

$(window).ready(function () {
    
    $('.note').draggable({
        revert : true,
        revertDuration : 0,
    });
    
    $('#treble').droppable({
        accept : '.note',
        drop : function (ev, ui) {
            var ypx = ev.clientY + (112 - ev.offsetY);
            var y = Math.floor((ypx - 63) / 33 * 2);
            var note = {
                8 : 'E3',
                7 : 'F3',
                6 : 'G3',
                5 : 'A4',
                4 : 'B4',
                3 : 'C4',
                2 : 'D4',
                1 : 'E4',
                0 : 'F4',
            }[y];
            console.log(note);
        },
    });
    
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
