var gulp = require('gulp');

gulp.task('default', function() {
  	gulp.src('src/app/public/**/*')
		.pipe(gulp.dest('build/app/public'));
	gulp.src('src/app/views/**/*')
		.pipe(gulp.dest('build/app/views'));
	gulp.src('src/app/bin/**/*')
		.pipe(gulp.dest('build/app/bin'));
});