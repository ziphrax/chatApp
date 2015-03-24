var socket = io.connect();

socket.on('connect', function(){
    socket.emit('adduser', prompt("What's your name: "));
});

socket.on('updatechat', function (username, data) {
    $('#conversation').append('<li class="list-group-item"><b>'+ username + ':</b> ' + data + '</li>');
});


socket.on('updaterooms', function (rooms, current_room) {
    $('#rooms').empty();
    $.each(rooms, function(key, value) {
        if(value == current_room){
            $('#rooms').append('<li role="presentation" class="active"><a href="#">' + value + '</a></li>');
        }
        else {
            $('#rooms').append('<li role="presentation"><a href="#" onclick="switchRoom(\''+value+'\')">' + value + '</a></lit>');
        }
    });
});

function switchRoom(room){
    socket.emit('switchRoom', room);
}

$(function(){
    $('#datasend').click( function() {
        var message = $('#data').val();
        $('#data').val('');
        socket.emit('sendchat', message);
    });

    $('#data').keypress(function(e) {
        if(e.which == 13) {
            $(this).blur();
            $('#datasend').focus().click();
        }
    });

    $('#roombutton').click(function(){
        //socket.emit('create', prompt("New Room name?"));
    });
});