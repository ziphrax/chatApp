var gulp = require('gulp'),
	dependencies = {
		js: [
			'bower_components/jquery/dist/jquery.js',
			'bower_components/bootstrap/dist/js/bootstrap.js'
		],
		fonts: ['bower_components/bootstrap/dist/fonts/*'],
		css: ['bower_components/bootstrap/dist/css/*']
	},
	source = {
		js:[
			 	'app/main.js',
				'server.js'
		],
		html: 'app/index.html'
	};

gulp.task('default',['move-dependencies'],function(){});

gulp.task('move-dependencies',function(){
	gulp.src(dependencies.js)
		.pipe(gulp.dest('./public/'));
	gulp.src(dependencies.fonts)
		.pipe(gulp.dest('./public/fonts/'));
	gulp.src(dependencies.css)
		.pipe(gulp.dest('./public/css/'));
});

gulp.task('js-source',function(){
	gulp.src(source.js)
		.pipe(gulp.dest('./public/'));
});

gulp.task('html',function(){
	gulp.src(source.html)
		.pipe(gulp.dest('./public/'));
});



gulp.task('watch',['js-source','html'],function(){
	gulp.watch(source.js,['js-source']);
	gulp.watch(source.html,['html']);
});
