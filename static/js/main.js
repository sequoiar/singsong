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
            if (j === undefined) return;
            
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
            if (typeof j === 'object') {
                note.note = j.note.replace(/[b#]/, '');
                note.beats = j.durations[0].beats;
                
                var macc = j.note.toString().match(/[b#]/);
                note.accident = macc
                    ? { b : 'flat', '#' : 'sharp' }[macc[0]]
                    : 'natural'
                ;
            }
            else {
                note.note = toNote(j);
                note.beats = 0.15;
                note.accident = 'natural';
            }
            
            
            var code = noteCode(note.accident);
            $('<div>')
                .addClass('note-accident')
                .html(note.accident === 'natural' ? '' : code)
                .appendTo(target)
            ;
            
            var tr = note.tr;
            $('<td>').text(i).appendTo(tr);
            
            var accidentals = {
                A : [ 'natural', 'sharp', 'flat' ],
                B : [ 'natural', 'flat' ],
                C : [ 'natural', 'sharp' ],
                D : [ 'natural', 'sharp', 'flat' ],
                E : [ 'natural' ],
                F : [ 'natural', 'sharp' ],
                G : [ 'natural', 'sharp', 'flat' ],
            };
            
            $('<td>')
                .addClass('note-name')
                .click(function () {
                    var key = note.note.charAt(0);
                    var acc = accidentals[key];
                    var ii = acc.indexOf(note.accident);
                    note.accident = acc[(ii + 1) % acc.length];
                    
                    var code = noteCode(note.accident);
                    
                    $(this).html(note.note + code);
                    
                    note.cell
                        .find('.note-accident')
                        .html(note.accident === 'natural' ? '' : code)
                    ;
                })
                .html(note.note + code)
                .appendTo(tr)
            ;
            
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
                        note : note.note.charAt(0) + {
                            natural : '',
                            flat : 'b',
                            sharp : '#',
                        }[note.accident] + note.note.charAt(1),
                        durations : [
                            { beats : note.beats, text : note.text }
                        ],
                    });
                }
                else {
                    acc.push({ rest : 0.3 });
                }
                return acc;
            }, []);
        },
        follow : function () {
            Seq.ap(range(columns)).seqEach(function (i) {
                var note = notes.notes[i];
                
                $('.playing').removeClass('playing');
                note.tr.addClass('playing');
                
                var wait = note.active ? note.beats : (note.rest || 1);
                setTimeout(this, 2000 * wait);
            });
        },
        load : function (data) {
            Object.keys(notes.notes).forEach(function (i) {
                notes.remove(i);
            });
            
            Object.keys(data).forEach(function (key, i) {
                if (data[key].note) {
                    var cell = cells[i][fromNote(data[key].note)];
                    notes.add(i, data[key], cell);
                    
                    $(notes.notes[i].tr.find('input')[0])
                        .val(data[key].durations[0].text)
                        .trigger('keypress')
                    ;
                }
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
        
        range(13).forEach(function (j) {
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
    11 : 'C3',
    10 : 'D3',
    9 : 'E3',
    8 : 'F3',
    7 : 'G3',
    6 : 'A3',
    5 : 'B3',
    4 : 'C4',
    3 : 'D4',
    2 : 'E4',
    1 : 'F4',
    0 : 'G4',
};

function toNote (j) {
    return noteMap[j];
}

function fromNote (n) {
    var key = n.replace(/[b#]/, '');
    var keys = Object.keys(noteMap);
    for (var i = 0; i < keys.length; i++) {
        if (noteMap[keys[i]] === key) return keys[i];
    }
}

function noteCode (n) {
    return {
        natural : '&#9838;',
        flat : '&#9837;',
        sharp : '&#9839;',
    }[n];
}
