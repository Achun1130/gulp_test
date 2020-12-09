var gulp = require('gulp');
const $ = require('gulp-load-plugins')();
var autoprefixer = require('autoprefixer');
var mainBowerFiles = require('main-bower-files');
var browserSync = require('browser-sync').create();
var gulpSequence = require('gulp-sequence');

var envOpt = {
    string: 'env',
    default: { env: 'develop' }
}
var opts = require('minimist')(process.argv.slice(2), envOpt)

gulp.task('jade', function () {
    gulp.src('./source/**/*.jade')
        .pipe($.plumber())
        .pipe($.if(opts.env === 'production', $.jade()))
        .pipe($.if(opts.env === 'develop', $.jade({
            pretty: true
        })))
        .pipe(gulp.dest('./public/'))
        .pipe(browserSync.stream());
});

gulp.task('sass', function () {
    return gulp.src('./source/scss/**/*.scss')
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.sass().on('error', $.sass.logError))
        .pipe($.postcss([autoprefixer()]))
        .pipe($.if(opts.env === 'production', $.cleanCss()))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('./public/css/'))
        .pipe(browserSync.stream());
});

gulp.task('babel', () =>
    gulp.src('./source/js/**/*.js')
        .pipe($.sourcemaps.init())
        .pipe($.babel({
            presets: ['@babel/env']
        }))
        .pipe($.concat('all.js'))
        .pipe($.if(opts.env === 'production', $.uglify({
            compress: {
                drop_console: true
            },
        })))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('./public/js/'))
        .pipe(browserSync.stream())
);

gulp.task('bower', function () {
    return gulp.src(mainBowerFiles())
        .pipe(gulp.dest('./.tmp/vendors/'))
});

gulp.task('vendorJs', ['bower'], function () {
    return gulp.src('./.tmp/vendors/**/*.js')
        .pipe($.sourcemaps.init())
        .pipe($.order([
            "jquery.js",
            "bootstrap.js"
        ]))
        .pipe($.concat('vendors.js'))
        .pipe($.if(opts.env === 'production', $.uglify({
            compress: {
                drop_console: true
            },
        })))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('./public/js/'))
})

gulp.task('watch', function () {
    $.watch('./source/**/*.jade', function () {
        gulp.start('jade');
    });
    $.watch('./source/scss/**/*.scss', function () {
        gulp.start('sass');
    });
    $.watch('./source/js/**/*.js', function () {
        gulp.start('babel');
    });
});

gulp.task('browser-sync', function () {
    browserSync.init({
        server: {
            baseDir: "./public/"
        }
    });
});

gulp.task('clean', function () {
    return gulp.src(['./.tmp', './public'], { read: false })
        .pipe($.clean());
});

gulp.task('image-min', () => 
    gulp.src('./source/images/*')
        .pipe($.if(opts.env === 'production', $.imagemin()))
        .pipe(gulp.dest('./public/images/'))
);

gulp.task('build', gulpSequence('clean', 'jade', 'sass', 'babel', 'vendorJs', 'image-min'))

gulp.task('default', ['jade', 'sass', 'babel', 'vendorJs', 'image-min', 'browser-sync', 'watch'])