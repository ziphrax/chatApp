$(function(){
	var socket = io();
	var username = 'default';

	$('.chatting').hide();

	$('form#join').submit(function(){
		username = $('#username').val()
		socket.emit('login',username);
		$('.not-chatting').fadeOut(function(){
			$('.chatting').fadeIn();
		});
		return false;
	});

	$('form#messagebox').submit(function(){
		socket.emit('chat message',$('#message').val());
		$('#message').val('');
		return false;
	});

	socket.on('chat message',function(msg){
		console.log(msg);
		$('ul.messages').append($('<li class="list-group-item">').text(msg));
	});

});