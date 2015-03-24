var socket = io.connect();
var cachedRooms = [];

socket.on('connect', function(){
    socket.emit('adduser', prompt("What's your name: "));
});

socket.on('updatechat', function (username, data) {
    $('#conversation').append('<li class="list-group-item"><b>'+ username + ':</b> ' + data + '</li>');
});

socket.on('updaterooms', function (rooms, current_room) {
    $('#rooms').empty();
    cachedRooms = rooms;
    console.log(cachedRooms);
    $.each(rooms, function(key, value) {
    	var icon = '';
    	if(value.requiresPassword && value.name == current_room){
    		icon = '<i class="glyphicon glyphicon-ok"></i> ';
    	} else if (value.requiresPassword){
    		icon = '<i class="glyphicon glyphicon-lock"></i> ';
    	}
        if(value.name == current_room){
            $('#rooms').append('<li role="presentation" class="active"><a href="#">' + icon + value.name + '</a></li>');
        }
        else {
            $('#rooms').append('<li role="presentation"><a href="#" onclick="switchRoom(\''+value.name+'\')">' + icon + value.name + '</a></lit>');
        }
    });
});

socket.on('error',function(error){
    alert('There was an error: ' + error);
});

socket.on('disconnect',function(){
    alert('Disconnected by server :-(');
});

function switchRoom(room){	
	var password ='';
	if(cachedRooms[room].requiresPassword){
		password = prompt('Please enter password');	
	}
    socket.emit('switchRoom',{name: room, password: password});
}

$(function(){
    $('#datasend').click( function(e) {
        e.preventDefault();
        var message = $('#data').val();
        $('#data').val('');
        socket.emit('sendchat', message);
    });

    $('#data').keypress(function(e) {
        if(e.which == 13) {
            e.preventDefault();
            $(this).blur();
            $('#datasend').focus().click();
        }
    });

    //$('#roombutton').click(function(){
        //socket.emit('create', prompt("New Room name?"));
    //});
});