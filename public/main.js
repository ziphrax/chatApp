var socket = io.connect();
var cachedRooms = [];

socket.on('connect', function(){
    socket.emit('adduser', prompt("What's your name: "));
});

socket.on('updatechat', function (username, data) {
    $('#conversation').append('<li class="list-group-item"><b>'+ username + ': ' + formatedTime() +'-></b> ' + data + '</li>');
    scrollConversation();
});

socket.on('updaterooms', function (rooms, current_room) {
    $('#rooms').empty();
    cachedRooms = rooms;
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

socket.on('usercount',function(count){
  $('#usercount').text(count);
});

socket.on('error',function(error){
  $('#conversation').append('<li class="list-group-item"><b>SERVER: ' + formatedTime() +'-></b> Whoops something went wrong' + error + '</li>');
  scrollConversation();
});

socket.on('disconnect',function(){
  $('#conversation').append('<li class="list-group-item"><b>SERVER: ' + formatedTime() +'-></b> Lost connection to the server :-(</li>');
  scrollConversation();
});

function scrollConversation(){
  var objDiv = document.getElementById("conversation");
  objDiv.scrollTop = objDiv.scrollHeight;
}

function formatedTime(){
  var d = new Date();
  return  d.getHours() + ':' +
  d.getMinutes() + ':' +
  d.getSeconds();
}

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
        $('#data').focus();
        socket.emit('sendchat', message);
    });

    $('#data').keypress(function(e) {
        if(e.which == 13) {
            e.preventDefault();
            $(this).blur();
            $('#datasend').focus().click();
        }
    });

    $('#createroom').click(function(){
        var roomName = prompt("New Room name?");
        var password = prompt("Password for the room?");
        socket.emit('create', roomName,password);
    });
});
