var dnode = require('dnode');
var $ = require('jquery-browserify');
var Seq = require('seq');

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
    var columns = 50;
    
    var notes = {
        notes : {},
        has : function (i) {
            return notes.notes[i].active;
        },
        add : function (i, j, elems) {
            var note = notes.notes[i];
            note.active = true;
            note.note = {
                10 : 'C3',
                9 : 'D3',
                8 : 'E3',
                7 : 'F3',
                6 : 'G3',
                5 : 'A4',
                4 : 'B4',
                3 : 'C4',
                2 : 'D4',
                1 : 'E4',
                0 : 'F4',
            }[j];
            note.beats = 0.1;
            
            var tr = note.tr;
            $('<td>').text(i).appendTo(tr);
            $('<td>').text(note.note).appendTo(tr);
            
            var textInput = (function () {
                function changer () {
                    note.text = $(this).val();
                }
                
                return $('<input>')
                    .attr('type', 'text')
                    .change(changer)
                    .keypress(changer)
                ;
            })();
            $('<td>').append(textInput).appendTo(tr);
            
            var beatInput = (function () {
                function changer () {
                    note.beats = $(this).val();
                }
                return $('<input>')
                    .attr('type', 'text')
                    .val(note.beats)
                    .change(changer)
                    .keypress(changer)
                ;
            })();
            $('<td>').append(beatInput).appendTo(tr);
        },
        remove : function (i) {
            var note = notes.notes[i];
            if (note) {
                note.active = false;
                note.tr.empty();
            }
        },
        song : function () {
            return range(columns).reduce(function (acc, i) {
                var note = notes.notes[i];
                if (note.active) {
                    acc.push({
                        note : note.note,
                        durations : [
                            { beats : note.beats, text : note.text }
                        ],
                    });
                }
                return acc;
            }, []);
        },
        follow : function () {
            Seq.ap(range(columns)).seqEach(function (i) {
                var note = notes.notes[i];
                
                $('.playing').removeClass('playing');
                note.tr.addClass('playing');
                if (note.active) {
                    setTimeout(this, note.beats);
                }
            });
        },
    };
    
    range(columns).forEach(function (i) {
        var column = $('<div>')
            .addClass('column')
            .appendTo($('#treble'))
        ;
        var tr = $('<tr>').appendTo($('#notes'));
        notes.notes[i] = { tr : tr };
        
        range(12).forEach(function (j) {
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
        $('#play').click(function () {
            remote.sing(notes.song());
            notes.follow();
        });
        
        remote.list(function (err, files) {
            if (err) alert(err)
            else files.forEach(function (file) {
                $('<option>')
                    .text(file)
                    .val(file)
                    .appendTo($('#files'))
                ;
            });
        });
        
        $('#save').submit(function (ev) {
            ev.preventDefault();
            remote.save(
                $(this.elements.filename).val(),
                notes.song(),
                function (err) {
                    if (err) alert(err)
                }
            );
        });
    });
});
