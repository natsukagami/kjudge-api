var gulp = require('gulp');

gulp.task('default', function() {
  gulp.src('src/app/public')
		.pipe(gulp.dest('build/app'));
	gulp.src('src/app/views')
		.pipe(gulp.dest('build/app'));
});