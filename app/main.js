$(function(){
	var socket = io();
	var my_username = 'default';

	$('.chatting').hide();

	$('form#join').submit(function(){
		my_username = $('#username').val()
		socket.emit('login',my_username);
		$('.not-chatting').fadeOut(function(){
			$('.chatting').fadeIn();
		});
		return false;
	});

	$('#sendMessage').on('click',function(){
		var msgObject = {
			'username': my_username,
			'message': $('#message').val()
		};
		socket.emit('chat message',msgObject);
		$('#message').val('');
		return false;
	});

	$('#disconnect').on('click',function(){
		if(confirm('Are you sure you wish to leave?')){
			socket.disconnect();
		}
	});

	socket.on('chat message',function(msg){
		var text = '';
		var cssClass= 'yourself';
		if(msg.username == my_username){
			text = 'You: ' + msg.message;
		} else {
			text = msg.username + ': ' + msg.message;
			cssClass='other';
		}
		$('ul.messages').append($('<li class="list-group-item '+ cssClass +'">').text(text));
	});

});
