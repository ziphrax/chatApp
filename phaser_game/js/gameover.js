var gameover = function(game){}
gameover.prototype = {
    create: function(){

        main_theme = game.add.audio('main_theme');
        main_theme.volume = volume;
        main_theme.loop = true;
        main_theme.play();

        var title = game.add.sprite(400, 200, 'title');
        title.anchor.x = 0.5;
        title.anchor.y = 0.5;

        var text = game.add.text(338, 300 , 'Game Over', { fontSize: '32px', fill: '#fff' });
        var button = game.add.button(290,300,'btn_startgane', restartGameOnClick, this, 2 , 1 , 0 );
    }
}
function restartGameOnClick(){
    music.stop();
    console.log('Game Starting...');
    game.state.start("Lobby");
}
