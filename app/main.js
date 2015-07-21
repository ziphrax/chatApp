$(function(){

	jQuery.fn.reverse = [].reverse;

	var socket = io();
	var me = 'unknown';
	var cachedRooms = [];

	var voicelist = responsiveVoice.getVoices();
  	var vselect = $("#voiceselection");
  	//vselect.append($("<option />").val('').text('Off'));
	$.each(voicelist, function() {
  	vselect.append($("<option />").val(this.name).text(this.name));
	});

	newsSummary();

	function newsSummary(){
		$.get('/data/articles/summary/').done(function(data){
			console.log(data);
			$.each(data,function(index,item){
				if(index == 0){
					$('.news-summary').append('<li class="list-group-item"><h2><a href="/articles/'+item._id+'">'+ item.title +'</a></h2>' 
						+ '<div class="content">' + marked(item.content) + '</div></li>');
				} else {					
					$('.news-summary').append('<li class="list-group-item"><a href="/articles/'+item._id+'">'+ item.title +'</a></li>');
				}
			});
		});
	}

	socket.on('updatechat', updateChat);

	function updateChat(username,data,sayIt){
		$('#conversation').append('<li class="list-group-item"><b><span class="username"></i>'+ username + '</span>: ' + formatedTime() +' -> <span class="saveForLater" title="Save as note"><i class="glyphicon glyphicon-star-empty"></i><span></b> ' + data + '</li>');

		if(sayIt){
			speak(data);			
		}


	  $('#conversation li:last-child .username').on('click',function(e){
	    var username = $(this).text();
	    if(confirm('Would you like to invite ' + username + ' to private chat?')){
	      inviteToChat(username);
	    };
	  });

	  $('#conversation li:last-child a.join').on('click',function(e){
	    e.preventDefault();
	    var room = $(this).data('room');
	    socket.emit('switchRoom',{name: room, password: ''});
	    $('#conversation').html('');
	  });

	  $('#conversation li:last-child a.decline').on('click',function(e){
	    e.preventDefault();
	    var username = $(this).data('username');
	    socket.emit('decline',username);
	    $(this).parent().remove();
	  });

	  $('#conversation li:last-child .glyphicon-star-empty').on('click',function(e){
	    e.preventDefault();
	    $.post('/data/notes',{content: data, from: username, owner: me});
	    $(this).toggleClass('.glyphicon-star-empty .glyphicon-star')
	    $(this).remove();
	  });

	  scrollConversation();
	}

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
	          $('#rooms').append('<li role="presentation" class="active"><a href="#" data-room="'+value.name+'">'+ icon + value.name + '</a></li>');
	      }
	      else {
	          $('#rooms').append('<li role="presentation"><a href="#" class="inactive" data-room=\''+value.name+'\'">' + icon + value.name + '</a></lit>');
	      }
	      $('#rooms li a').off('click');
	      $('#rooms').find('li a.inactive').on('click',function(e){
	        var room = $(this).data('room');
	        var password ='';
	        if(cachedRooms[room].requiresPassword){
	          password = prompt('Please enter password');
	        }
	          socket.emit('switchRoom',{name: room, password: password});
	          $('#conversation').html('');
	      });
	  });
	});

	socket.on('chat log',function(logs){
		$.each($(logs).reverse(),function(index,val){
			updateChat(val.username,val.message,false);
		});		
	});

	socket.on('update user list',function(userList){
		$('#userList').empty();
		var contentStr = '';
		$.each(userList,function(index,user){
			contentStr = contentStr + '<li class="list-group-item">' + user + '</li>';
		});

		$('#userList').html(contentStr);
		$('#userList li').click(function(){
			inviteToChat($(this).text());
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

	$( window ).bind( 'keypress' , function(e){
		var isChatMessage = $( 'input#data' ).is( ':active' );
		if ( e.keyCode == 13 && !( isChatMessage )) {
			e.preventDefault();
		}
	});


    $( '#join' ).click(function(e){
        $( this ).fadeOut(500,function(){
        	$( '#chatform' ).fadeIn();
        })
      	e.preventDefault();
      	socket.emit('adduser');
    });

    $( '#data' ).keypress( function(e) {
        if(e.which == 13) {
            e.preventDefault();
            $( this ).blur();
            $( '#datasend' ).focus().click();
        }
    });

		function speak(data){
			responsiveVoice.speak(
				data,
				$('#voiceselection').val());
		}

    function inviteToChat( username ){
      socket.emit( 'invite' , username );
    }

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

    $( '#datasend' ).click( function(e) {
        e.preventDefault();
        var message = $( '#data' ).val();
        $( '#data' ).val('');
        $( '#data' ).focus();
        socket.emit( 'sendchat' , message );
    });

    $( '#createroom' ).click( function(){
        var roomName = $( '#roomname' ).val();
        var password = $( '#roompassword' ).val();
        $( '#roomname, #roompassword' ).val('');
        socket.emit( 'create' , roomName , password );
    });
});
