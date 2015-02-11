var gulp = require('gulp'),
    del = require('del'),
    vinylPaths = require('vinyl-paths'),
    $ = require('gulp-load-plugins')();

var pkg = require('./package.json');
var banner = ['/**',
    ' * <%= pkg.title %> v<%= pkg.version %> - <%= pkg.description %>',
    ' * ------------------------',
    ' * @link <%= pkg.homepage %>',
    ' * @license <%= pkg.license %>',
    ' * @author <%= pkg.author.name %>',
    ' *         Twitter : @AlexandreDemode',
    ' *         Website : <%= pkg.author.url.replace("http://", "") %>',
    ' */',
    '\n'].join('\n');
var bannerLight = ['/** <%= pkg.title %> v<%= pkg.version %> - <%= pkg.description %>',
    ' - <%= pkg.homepage.replace("http://", "") %>',
    ' - License <%= pkg.license %>',
    ' - Author : <%= pkg.author.name %>',
    ' / <%= pkg.author.url.replace("http://", "") %>',
    ' */',
    '\n'].join('');




gulp.task('clean', function(){
    return gulp.src(['*.min.js'])
        .pipe(vinylPaths(del));
});

gulp.task('test', function(){
    return gulp.src(['src/cookies-eu-banner.js'])
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'));
});

gulp.task('scripts', ['test'], function(){
    return gulp.src(['src/cookies-eu-banner.js'])
        .pipe($.header(banner, { pkg: pkg }))
        .pipe($.concat('cookies-eu-banner.js', { newLine: '\r\n\r\n' }))
        .pipe(gulp.dest('dist/'))
        .pipe($.size({ title: 'cookies-eu-banner.js' }))
        .pipe($.rename({ suffix: ".min" }))
        .pipe($.uglify())
        .pipe($.header(bannerLight, { pkg: pkg }))
        .pipe(gulp.dest('dist/'))
        .pipe($.size({ title: 'cookies-eu-banner.min.js' }))
});



gulp.task('watch', function(){
    gulp.watch(['src/cookies-eu-banner.js'], ['scripts']);

    gulp.watch(['dist/**'], function(file){
        $.livereload.changed(file);
    });

    $.livereload.listen();
});

gulp.task('build', ['scripts']);

gulp.task('default', ['build', 'watch']);