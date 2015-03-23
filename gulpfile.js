var gulp = require('gulp'),
	dependencies = {
		js: [
			'bower_components/jquery/dist/jquery.js',
			'bower_components/bootstrap/dist/js/bootstrap.js',
			'app/main.js'
			],
		fonts: ['bower_components/bootstrap/dist/fonts/*'],
		css: ['bower_components/bootstrap/dist/css/*'],
		html: 'app/index.html'
	};

gulp.task('default',['move-dependencies'],function(){

});

gulp.task('move-dependencies',function(){
	gulp.src(dependencies.html)
		.pipe(gulp.dest('./public/'));
	gulp.src(dependencies.js)
		.pipe(gulp.dest('./public/'));
	gulp.src(dependencies.fonts)
		.pipe(gulp.dest('./public/fonts/'));
	gulp.src(dependencies.css)
		.pipe(gulp.dest('./public/css/'));
});

gulp.task('watch',['move-dependencies'],function(){
	gulp.watch('move-dependencies',['move-dependencies']);
});