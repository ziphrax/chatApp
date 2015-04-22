var socket;
var me = 'unknown';
$(function(){
  $("input#username").focus();

  $(window).bind('keypress',function(e){
    var isChatMessage = $("input#data").is(":active");
    if ( e.keyCode == 13 && !(isChatMessage)) {
      e.preventDefault();
    }
  });

    $('#join').click(handleJoin);

    $('#datasend').hide();

    $('#data').keypress(function(e) {
        if(e.which == 13) {
            e.preventDefault();
            $(this).blur();
            $('#datasend').focus().click();
        }
    });

    function handleJoin(e){
      $('#join').fadeOut(500,function(){
        $('#datasend').fadeIn();
      })
      io.connect();
      e.preventDefault();
      socket = io.connect();;
      var cachedRooms = [];
      
      socket.emit('adduser');
      $('.disconnected').fadeOut(500,function(){
        $('.connected').fadeIn(500,function(){
          $("input#data").focus();
        });
      });


      socket.on('updatechat', function (username, data) {
          $('#conversation').append('<li class="list-group-item"><b><span class="username"></i>'+ username + '</span>: ' + formatedTime() +' -> <span class="saveForLater" title="Save as note"><i class="glyphicon glyphicon-star-empty"></i><span></b> ' + data + '</li>');
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
              });
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
    }

    function inviteToChat(username){
      socket.emit('invite', me, username);
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

    $('#datasend').click( function(e) {
        e.preventDefault();
        var message = $('#data').val();
        $('#data').val('');
        $('#data').focus();
        socket.emit('sendchat', message);
    });

    $('#createroom').click(function(){
        var roomName = $('#roomname').val();
        var password = $('#roompassword').val();
        $('#roomname, #roompassword').val('');
        socket.emit('create', roomName,password);
    });


});
