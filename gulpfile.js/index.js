const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const autoprefixer = require('autoprefixer');
// const mainBowerFiles = require('main-bower-files');
const browserSync = require('browser-sync').create();
// const gulpSequence = require('gulp-sequence');
const { opts } = require('./options.js');
const { bower, vendorJs } = require('./vendors.js');

gulp.task('jade', function () {
    return gulp.src('./source/**/*.jade')
        .pipe($.plumber())
        .pipe($.data(function() {
            var list = require('../source/data/data.json');
            var ks = require('../source/data/ks.json');
            var lightbox = require('../source/data/lightbox.json')
            var source = {
                'list': list,
                'ks': ks,
                'lightbox': lightbox
            };
            return source;
          }))
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
        .pipe($.sass({
            includePaths: [
                './node_modules/bootstrap/scss',
                './node_modules/lightbox2/dist/css']
        }).on('error', $.sass.logError))
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

// gulp.task('watch', function () {
//     gulp.watch('./source/**/*.jade', gulp.series('jade'));
//     gulp.watch('./source/**/*/*.scss', gulp.series('sass'));
//     gulp.watch('./source/js/**/*.js', gulp.series('babel'));
//     //     $.watch('./source/**/*.jade', 'jade');
//     //     $.watch('./source/scss/**/*.scss', 'sass');
//     //     $.watch('./source/js/**/*.js', 'babel');
// });

// gulp.task('browser-sync', function () {
//     return browserSync.init({
//             server: {
//                 baseDir: "./public/"
//             }
//     });
// });

gulp.task('clean', function () {
    return gulp.src(['./.tmp', './public'], { read: false, allowEmpty: true })
        .pipe($.clean());
});

gulp.task('image-min', () => 
    gulp.src([
        './source/images/*',
        './node_modules/lightbox2/dist/images/*'
    ])
        .pipe($.if(opts.env === 'production', $.imagemin()))
        .pipe(gulp.dest('./public/images/'))
);

// @3.9.1
// gulp.task('build', gulpSequence('clean', 'jade', 'sass', 'babel', 'vendorJs', 'image-min'))
// gulp.task('default', ['jade', 'sass', 'babel', 'vendorJs', 'image-min', 'browser-sync', 'watch'])

// @4.0.2
gulp.task('build',
    gulp.series(
        'clean',
        bower,
        vendorJs,
        gulp.parallel('jade', 'sass', 'babel', 'image-min')
    )
);

gulp.task('default',
    gulp.series(
        'clean',
        bower,
        vendorJs,
        gulp.parallel('jade', 'sass', 'babel', 'image-min'),
        function (done) {
            browserSync.init({
                server: {
                    baseDir: "./public/"
                }
            });

            gulp.watch('./source/**/*.jade', gulp.series('jade'));
            gulp.watch('./source/**/*/*.scss', gulp.series('sass'));
            gulp.watch('./source/js/**/*.js', gulp.series('babel'));
            done();
        }
    )
);
