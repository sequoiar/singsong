var dnode = require('dnode');
var $ = require('jquery-browserify');

function range (start, end, step) {
    if (end === undefined) {
        end = start - 1;
        start = 0;
    }
    if (step === undefined) step = 1;
    
    var xs = [];
    for (var i = start; i < end; i += step) {
        xs.push(i);
    }
    return xs;
}

$(window).ready(function () {
    
    range(14).forEach(function (i) {
        var column = $('<div>')
            .addClass('column')
            .appendTo($('#treble'))
        ;
        
        range(10).forEach(function (j) {
            $('<div>')
                .addClass('cell')
                .appendTo(column)
                .mouseover(function () {
                    $('.moused').removeClass('moused');
                    $(this).addClass('moused');
                })
                .mouseout(function () {
                    $(this).removeClass('moused');
                })
                .toggle(
                    function () {
                        $('<img>')
                            .attr('src', '/images/quarter_up.png')
                            .addClass('note')
                            .appendTo($(this))
                        ;
                    },
                    function () {
                        $(this).empty();
                    }
                )
                .droppable({
                    accept : '.note',
                    drop : function (ev, ui) {
                        console.log(i + ',' + j);
                        $(this).css('background-color', 'red');
                    },
                })
            ;
        });
    });
    
    $('.note').draggable({
        revert : true,
        revertDuration : 0,
    });
    
    /*
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
            if (note) {
                console.log(note);
            }
        },
    });
    */
    
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
