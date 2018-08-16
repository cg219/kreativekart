(function(){
	const gulp 			= require("gulp");
	const jshint		= require("gulp-jshint");


	gulp.task("hint", function(){
		return gulp.src(["./*.js", "./routes/*.js", "./models/*.js"])
			.pipe(jshint({esversion: 6, asi: true, node: true}))
			.pipe(jshint.reporter("jshint-stylish"))
	})

	gulp.task("watch", function(){
		gulp.watch("./**/*.js", ["hint"]);
	})

	gulp.task("default", ["watch"]);
})();