const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const mainBowerFiles = require('main-bower-files');

const { opts } = require('./options');

const bower = function () {
    return gulp.src(mainBowerFiles())
        .pipe(gulp.dest('./.tmp/vendors/'))
};

const vendorJs = function () {
    return gulp.src([
            './.tmp/vendors/**/*.js',
            './node_modules/bootstrap/dist/js/bootstrap.bundle.js',
            './node_modules/lightbox2/dist/js/lightbox.js'
        ])
        .pipe($.sourcemaps.init())
        .pipe($.order([
            "jquery.js",
            "bootstrap.bundle.js",
            "lightbox.js"
        ]))
        .pipe($.concat('vendors.js'))
        .pipe($.if(opts.env === 'production', $.uglify({
            compress: {
                drop_console: true
            },
        })))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('./public/js/'))
};

exports.bower = bower;
exports.vendorJs = vendorJs;
