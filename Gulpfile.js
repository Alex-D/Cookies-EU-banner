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
var bannerLight = ['/** <%= pkg.title %> v<%= pkg.version %> by <%= pkg.author.name %>',
  ' - <%= pkg.homepage.replace("http://", "") %>',
  ' - <%= pkg.license %> License',
  ' */',
  '\n'].join('');

gulp.task('clean', function () {
  return gulp.src(['dist/*'])
    .pipe(vinylPaths(del));
});

gulp.task('lint', function () {
  return gulp.src(['src/cookies-eu-banner.js'])
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'));
});

gulp.task('scripts', function () {
  return gulp.src(['src/cookies-eu-banner.js'])
    .pipe($.header(banner, { pkg: pkg }))
    .pipe($.concat('cookies-eu-banner.js', { newLine: '\r\n\r\n' }))
    .pipe(gulp.dest('dist/'))
    .pipe($.size({ title: 'cookies-eu-banner.js' }))
    .pipe($.rename({ suffix: '.min' }))
    .pipe($.uglify())
    .pipe($.header(bannerLight, { pkg: pkg }))
    .pipe(gulp.dest('dist/'))
    .pipe($.size({ title: 'cookies-eu-banner.min.js' }));
});

gulp.task('watch', function () {
  gulp.watch(['src/cookies-eu-banner.js'], gulp.series('lint', 'scripts'));
});

gulp.task('build', gulp.series('clean', 'lint', 'scripts'));

gulp.task('test', gulp.series('build'));

gulp.task('default', gulp.series('build', 'watch'));
