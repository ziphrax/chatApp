var gulp = require('gulp'),
	dependencies = {
		js: [
			'bower_components/jquery/dist/jquery.min.js',
			'bower_components/bootstrap/dist/js/bootstrap.min.js',
			'other_components/bootstrap-markdown/js/bootstrap-markdown.js',
			'other_components/marked/marked.js',
			'other_components/responsive_voice/responsivevoice.js'
		],
		fonts: ['bower_components/bootstrap/dist/fonts/*'],
		css: ['bower_components/bootstrap/dist/css/*.min.*',
				'bower_components/bootstrap/dist/css/*.map',
				'other_components/bootstrap-markdown/css/bootstrap-markdown.min.css'
			]
	},
	source = {
		js:[
			 	'app/main.js',
				'app/minigame.js'
		],
		html: ['app/*.html']
	};

gulp.task('move-dependencies', function(){
	return gulp.src(dependencies.js)
		.pipe(gulp.dest('./public/'))
		.on('end', function() {
			gulp.src(dependencies.fonts)
				.pipe(gulp.dest('./public/fonts/'));
			gulp.src(dependencies.css)
				.pipe(gulp.dest('./public/css/'));
		});
});

gulp.task('js-source', function(){
	return gulp.src(source.js)
		.pipe(gulp.dest('./public/'));
});

gulp.task('default', gulp.series('move-dependencies', 'js-source'));

gulp.task('watch', function(){
	gulp.watch(source.js, gulp.series('js-source'));
});
