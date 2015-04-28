var gulp = require('gulp'),
	dependencies = {
		js: [
			'bower_components/jquery/dist/jquery.min.js',
			'bower_components/bootstrap/dist/js/bootstrap.min.js',
			'other_components/bootstrap-markdown/js/bootstrap-markdown.js',
			'other_components/marked/marked.js'
		],
		fonts: ['bower_components/bootstrap/dist/fonts/*'],
		css: ['bower_components/bootstrap/dist/css/*.min.*',
				'bower_components/bootstrap/dist/css/*.map',
				'other_components/bootstrap-markdown/css/bootstrap-markdown.min.css'
			]
	},
	source = {
		js:[
			 	'app/main.js'
		],
		html: ['app/*.html']
	};

gulp.task('default',['move-dependencies','js-source'],function(){});

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

gulp.task('watch',['js-source'],function(){
	gulp.watch(source.js,['js-source']);
});
