var preload = function(game){}

preload.prototype = {
	preload: function(){
          var loadingBar = this.add.sprite(200,200,"loading");
		  var loadingProgress = loadingBar.animations.add('loading');
          loadingBar.anchor.setTo(0.5,0.5);
          game.load.setPreloadSprite(loadingBar);
		  game.load.image("title","/phaser_assets/assets/title.png");
		  loadFilters();
		  loadAudio();
		  loadSpritesheets();
		  loadImages();
	},
  	create: function(){
		game.state.start("GameTitle");
	}
}

function loadFilters(){
    game.load.script('filter-vignette', '/phaser_assets/assets/filters/Vignette.js');
    game.load.script('filter-snoise', '/phaser_assets/assets/filters/SNoise.js');
    game.load.script('filter-filmgrain', '/phaser_assets/assets/filters/FilmGrain.js');
}

function loadAudio(){
    game.load.audio('bg_music','/phaser_assets/assets/audio/Electrix_NES.mp3');
	game.load.audio('main_theme','/phaser_assets/assets/audio/main_theme.mp3');
    game.load.audio('jump','/phaser_assets/assets/audio/platformer_jumping/jump_05.wav');
    game.load.audio('step','/phaser_assets/assets/audio/steps/stepstone_1.wav');
    game.load.audio('star','/phaser_assets/assets/audio/completetask_0.mp3');
}

function loadSpritesheets(){
    game.load.spritesheet('dude', '/phaser_assets/assets/dude1.png', 32, 48);
	game.load.spritesheet('level exit', '/phaser_assets/assets/exit.png', 48, 64);
}

function loadImages(){
    game.load.image('sky', '/phaser_assets/assets/sky.png');
    game.load.image('ground', '/phaser_assets/assets/platform.png');
    game.load.image('star', '/phaser_assets/assets/star.png');
    game.load.image('spike', '/phaser_assets/assets/spike.png');
}
