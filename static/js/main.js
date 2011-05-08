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
        add : function (i, j, target) {
            var note = notes.notes[i];
            
            $('<img>')
                .attr('src', '/images/quarter_up.png')
                .addClass('note')
                .click(function () {
                    target.trigger('toggle');
                })
                .appendTo(target)
            ;
            $('<div>')
                .addClass('note-label')
                .text(i)
                .click(function () {
                    target.trigger('toggle');
                })
                .appendTo(target)
            ;
            
            note.cell = target;
            note.active = true;
            note.note = toNote(j) || j;
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
                if (note.cell) {
                    note.cell.empty();
                    note.cell = null;
                }
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
        load : function (data) {
            Object.keys(notes.notes).forEach(function (i) {
                notes.remove(i);
            });
            
            Object.keys(data).forEach(function (key, i) {
                var cell = cells[i][fromNote(data[key].note)];
                notes.add(i, data[key].note, cell);
                
                $(notes.notes[i].tr.find('input')[0])
                    .val(data[key].durations[0].text)
                    .trigger('keypress')
                ;
            });
        },
    };
    
    var cells = {};
    range(columns).forEach(function (i) {
        var column = $('<div>')
            .addClass('column')
            .appendTo($('#treble'))
        ;
        var tr = $('<tr>').appendTo($('#notes'));
        notes.notes[i] = { tr : tr };
        cells[i] = {};
        
        range(12).forEach(function (j) {
            cells[i][j] = $('<div>')
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
                        notes.add(i, j, $(this));
                    },
                    function () {
                        notes.remove(i);
                        $(this).empty();
                    }
                )
                .droppable({
                    accept : '.note',
                    drop : function (ev, ui) {
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
        
        $('#load').submit(function (ev) {
            ev.preventDefault();
            remote.load($('#files').val(), function (err, data) {
                if (err) alert(err)
                else notes.load(data)
            });
        });
    });
});

var noteMap = {
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
};

function toNote (j) {
    return noteMap[j];
}

function fromNote (n) {
    var keys = Object.keys(noteMap);
    for (var i = 0; i < keys.length; i++) {
        if (noteMap[keys[i]] === n) return keys[i];
    }
}
