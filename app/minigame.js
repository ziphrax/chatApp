$(function(){
  $minigame = $('.minigame-container');

  var source = $('#xeno-template').html();
  var template = Handlebars.compile(source);

  var weaponsList = [];
  var xenosList = [];
  var currentXeno = '';


  var gameLoop = '';
  var loading = 0;

  init();

  function init(){
    getWeaponsList();
    getXenosList();

    main();
  };

  function main(){
    currentXeno = xenosList[0];
    var xenoTemplate = template(currentXeno);
    $minigame.html(html);
  }

  function getWeaponsList(){
    $.get('/minigame/data/weapons/')
      .done(function(data){
        weaponsList = data;
        loading++;
      });
  }

  function getXenosList(){
    $.get('/minigame/data/xenos/')
       .done(function(data){
         xenosList = data;
         loading++;
      });
  }

});
