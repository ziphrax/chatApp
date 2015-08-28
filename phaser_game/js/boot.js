var game = new Phaser.Game(800, 600, Phaser.AUTO, 'Game');

var boot = function(game){
	console.log("%cStarting my awesome game", "color:white; background:red");
};

boot.prototype = {
	preload: function(){
        game.load.image("loading","/phaser_assets/assets/loading.png");
	},
  	create: function(){
		game.state.start("Preload");
	}
}
