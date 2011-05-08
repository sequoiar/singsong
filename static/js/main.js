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
    
    var notes = {
        notes : {},
        has : function (i) {
            return notes.notes[i].active;
        },
        add : function (i, j, elems) {
            var note = notes.notes[i];
            note.active = true;
            
            var tr = note.tr;
            $('<td>').text(i).appendTo(tr);
            $('<td>').text({
                8 : 'E4',
                7 : 'F4',
                6 : 'G4',
                5 : 'A3',
                4 : 'B3',
                3 : 'C3',
                2 : 'D3',
                1 : 'E3',
                0 : 'F3',
            }[j]).appendTo(tr);
            
            $('<td>').append(
                $('<input>').attr('type', 'text')
            ).appendTo(tr);
        },
        remove : function (i) {
            var note = notes.notes[i];
            if (note) {
                note.active = false;
                note.tr.empty();
            }
        },
    };
    
    range(14).forEach(function (i) {
        var column = $('<div>')
            .addClass('column')
            .appendTo($('#treble'))
        ;
        var tr = $('<tr>').appendTo($('#notes'));
        notes.notes[i] = { tr : tr };
        
        range(10).forEach(function (j) {
            $('<div>')
                .addClass('cell')
                .appendTo(column)
                .mouseover(function () {
                    $('.moused').removeClass('moused');
                    if (!notes.has(i)) {
                        $(this).addClass('moused');
                    }
                })
                .mouseout(function () {
                    $(this).removeClass('moused');
                })
                .toggle(
                    function () {
                        if (notes.has(i)) return;
                        
                        var note = $('<img>')
                            .attr('src', '/images/quarter_up.png')
                            .addClass('note')
                            .appendTo($(this))
                        ;
                        var label = $('<div>')
                            .addClass('note-label')
                            .text(i)
                            .click(function () {
                                note.trigger('toggle');
                            })
                            .appendTo($(this))
                        ;
                        
                        notes.add(i, j, {
                            note : note,
                            label : label,
                        });
                    },
                    function () {
                        notes.remove(i);
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
