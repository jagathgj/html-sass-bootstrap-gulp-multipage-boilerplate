const gulp = require('gulp');
const gulpIf = require('gulp-if');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const htmlmin = require('gulp-htmlmin');
const cssmin = require('gulp-cssmin');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const concat = require('gulp-concat');
const jsImport = require('gulp-js-import');
const sourcemaps = require('gulp-sourcemaps');
const htmlPartial = require('gulp-html-partial');
const clean = require('gulp-clean');
const googleWebFonts = require( 'gulp-google-webfonts' );
const cssbeautify = require('gulp-cssbeautify');
const htmlbeautify = require('gulp-html-beautify')
const isProd = process.env.NODE_ENV === 'prod';

var options = { };

const htmlFile = [
    'src/*.html'
]

function html() {
    return gulp.src(htmlFile)
        .pipe(htmlPartial({
            basePath: 'src/assets/partials/'
        }))
        .pipe(htmlbeautify())
        .pipe(gulpIf(isProd, htmlmin({
            collapseWhitespace: true
        })))
        .pipe(gulp.dest('public'));
}

function css() {
    return gulp.src('src/assets/sass/style.scss')
        .pipe(gulpIf(!isProd, sourcemaps.init()))
        .pipe(sass({
            includePaths: ['node_modules']
        }).on('error', sass.logError))
        .pipe(cssbeautify({
            indent: '  ',
            openbrace: 'separate-line',
            autosemicolon: true
        }))
        .pipe(gulpIf(!isProd, sourcemaps.write()))
        .pipe(gulpIf(isProd, cssmin()))
        .pipe(gulp.dest('public/assets/css/'));
}

function js() {
    return gulp.src('src/assets/js/*.js')
        .pipe(jsImport({
            hideConsole: true
        }))
        // .pipe(concat('all.js'))
        .pipe(gulpIf(isProd, uglify()))
        .pipe(gulp.dest('public/assets/js'));
}

function img() {
    return gulp.src('src/assets/img/*')
        .pipe(gulpIf(isProd, imagemin()))
        .pipe(gulp.dest('public/assets/img/'));
}

function fonts() {
    return gulp.src('src/assets/fonts/*.{eot,svg,ttf,woff,woff2}')
		.pipe(gulp.dest('public/assets/fonts/'));
}

function fontAwesome() {
    return gulp.src('./node_modules/@fortawesome/**/*')
		.pipe(gulp.dest('public/assets/vendor/'));
}


function serve() {
    browserSync.init({
        open: true,
        notify: false,
        server: './public'
    });
}

function browserSyncReload(done) {
    browserSync.reload();
    done();
}


function watchFiles() {
    gulp.watch('src/**/*.html', gulp.series(html, browserSyncReload));
    gulp.watch('src/assets/**/*.scss', gulp.series(css, browserSyncReload));
    gulp.watch('src/assets/**/*.js', gulp.series(js, browserSyncReload));
    gulp.watch('src/assets/img/**/*.*', gulp.series(img));
    gulp.watch('src/assets/**/*.{eot,svg,ttf,woff,woff2}', gulp.series(fonts));
    gulp.watch('src/assets/vendor/**/*.*', gulp.series(fontAwesome));

    return;
}

function del() {
    return gulp.src('public/*', {read: false})
        .pipe(clean());
}

exports.css = css;
exports.html = html;
exports.js = js;
exports.fonts = fonts;
exports.fontAwesome = fontAwesome;
exports.del = del;
exports.serve = gulp.parallel(html, css, js, img, fonts, fontAwesome, watchFiles, serve);
exports.default = gulp.series(del, html, css, js, fonts, img, fontAwesome);