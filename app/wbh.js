$(function(){

var universe;
var timer = '';
var lastTime = '';
var rate = 10;
var time = new Date();

var battleGroupClass = function(data){
  var self = this;

  self.stats = data;

  return self;
}

var shipClass = function(data){
  var self = this;

  self.stats = data;

  return self;
}

var universeClass = function(x,y){
  var self = this;

  self.players = [];
  self.gameObjects = [];

  self.x = x;
  self.y = y;

  return self;
}

var playerClass = function(data){
  var self = this;

  self.stats = data;

  return self;
}

function init(){
  universe = new universeClass(10,10);

  var player1 = new playerClass({name:'Player 1'});
  var player2 = new playerClass({name:'Computer'});

  universe.players = [player1,player2];

  var p1BattleGroup = new  battleGroupClass({
    position: {x: 5, y: 10},
    direction: 0,
    speed: 0,
    owner : 0,
    orders : 'none',
    formation : 1,
    ships : [
      new shipClass({
        name : 'Dauntless',
        armour : [4,2,1,2],
        weapons : [
          {
            type: 'torpedo',
            strength: 8,
            range: 10,
          },
          {
            type: 'lance',
            strength: 4,
            range: 3
          },
          {
            type: 'none',
            strength: 0,
            range: 0
          },
          {
            type: 'lance',
            strength: 4,
            range: 3
          }
        ],
        speed: 4
      }),
      new shipClass({
        name : 'Fearless',
        armour : [4,2,1,2],
        weapons : [
          {
            type: 'torpedo',
            strength: 8,
            range: 10,
          },
          {
            type: 'lance',
            strength: 4,
            range: 3
          },
          {
            type: 'none',
            strength: 0,
            range: 0
          },
          {
            type: 'lance',
            strength: 4,
            range: 3
          }
        ],
        speed: 4
      }),
      new shipClass({
        name : 'Courageous',
        armour : [4,2,1,2],
        weapons : [
          {
            type: 'torpedo',
            strength: 8,
            range: 10,
          },
          {
            type: 'lance',
            strength: 4,
            range: 3
          },
          {
            type: 'none',
            strength: 0,
            range: 0
          },
          {
            type: 'lance',
            strength: 4,
            range: 3
          }
        ],
        speed: 4
      })
    ]
  });

  var p2BattleGroup = new  battleGroupClass({
    position: {x: 5, y: 0},
    direction: 180,
    speed: 0,
    owner : 1,
    orders : 'none',
    formation : 1,
    ships : [
      new shipClass({
        name : 'Valiant',
        armour : [4,2,1,2],
        weapons : [
          {
            type: 'torpedo',
            strength: 8,
            range: 10,
          },
          {
            type: 'lance',
            strength: 4,
            range: 3
          },
          {
            type: 'none',
            strength: 0,
            range: 0
          },
          {
            type: 'lance',
            strength: 4,
            range: 3
          }
        ],
        speed: 4
      }),
      new shipClass({
        name : 'Relentless',
        armour : [4,2,1,2],
        weapons : [
          {
            type: 'torpedo',
            strength: 8,
            range: 10,
          },
          {
            type: 'lance',
            strength: 4,
            range: 3
          },
          {
            type: 'none',
            strength: 0,
            range: 0
          },
          {
            type: 'lance',
            strength: 4,
            range: 3
          }
        ],
        speed: 4
      }),
      new shipClass({
        name : 'Victorious',
        armour : [4,2,1,2],
        weapons : [
          {
            type: 'torpedo',
            strength: 8,
            range: 10,
          },
          {
            type: 'lance',
            strength: 4,
            range: 3
          },
          {
            type: 'none',
            strength: 0,
            range: 0
          },
          {
            type: 'lance',
            strength: 4,
            range: 3
          }
        ],
        speed: 4
      })
    ]
  });

  universe.gameObjects.push(p1BattleGroup);
  universe.gameObjects.push(p2BattleGroup);

  timer = setInterval(function(){
    tick(1);
  },1000 / rate);

}

$('.btn-start').click(function(){
  init();
  $(this).fadeOut('normal',function(){
    $('.btn-stop').fadeIn();
  });
});

$('.btn-stop').click(function(){
  clearInterval(timer);
  $(this).fadeOut('normal',function(){
    $('.btn-start').fadeIn();
  });
});

function tick(deltaTime){
  time= +new Date();
  $('.timer').html(time);
  $('.fps').html(rate);
  drawPlayerUI(universe);
}


function drawPlayerUI(universe){
  $('.players').empty();
  $.each(universe.players,function(index,val){
    $('.players').append('<div class="'+ val.stats.name +'"><h1>' + val.stats.name + '</h1>'+ drawPlayerShipsUI(index,universe) + '</div>');
  });
}

function drawPlayerShipsUI(player,universe){
  var output = '<h3>Ships</h3><ul class="ships">';
    $.each(universe.gameObjects,function(index,val){
      if(val.stats.owner == player){
        output += '<li>Ships: ' + val.stats.ships.length + drawPlayerShipUI( val.stats.ships) +'<br />'
            + 'fomation: ' + val.stats.formation +'<br />'
            + 'orders: ' + val.stats.orders + '<br />'
            + 'position: X:' + val.stats.position.x + ', Y: ' +  val.stats.position.y + '<br />'
            + 'direction: ' + val.stats.direction + '&deg;<br />'
            + 'speed: ' + val.stats.speed + ' lyps<br />'
            + '</li>';
      }
    });
  return output + '</ul>';
}

function drawPlayerShipUI(ships){
  var output = '[ ';

  $.each(ships,function(index,ship){
    output += ship.stats.name + ','
  });

  return output + ']';
}



});
