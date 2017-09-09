// _________________________________________________________

const gulp = require('gulp');

//for pages
const pug = require("gulp-pug");

//for styles
const sass = require("gulp-sass");
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require("gulp-autoprefixer");
const mincss = require("gulp-csso");

//for images
const imagemin = require('gulp-imagemin');
const cache = require('gulp-cache');

//for change
const gulpIf = require('gulp-if');
const del = require('del');
const rename = require('gulp-rename');
const concat = require('gulp-concat');

//for errors
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');

//for view
const browserSync = require('browser-sync').create();


// _________________________________________________________

// source
const paths = {
    root: './dist',
    templates: {
        src: 'src/templates/**/*.pug',
        dest: 'dist/assets/'
    },
    fonts: {
        src: 'src/fonts/**/*.*',
        dest: 'dist/assets/fonts'
    },
    styles: {
        src: 'src/styles/**/*.scss',
        dest: 'dist/assets/styles/'
    },
    images: {
        src: 'src/images/**/*.*',
        dest: 'dist/assets/images/'
    }
};

// _______________for project assembly_____________________

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

// _________________________________________________________

// pug
function templates() {
     return gulp.src("./src/templates/pages/**/*.pug")
    .pipe(pug({ pretty: "\t" }))
    .pipe(gulp.dest(paths.root));   
}

exports.templates = templates;

// // fonts
function fonts() {
    return gulp.src(paths.fonts.src)
    .pipe(gulp.dest(paths.fonts.dest))   
}

// // styles
function styles() {
    return gulp.src("./src/styles/*main.scss")
    .pipe(plumber({errorHandler: notify.onError(function (err) {return {title: 'Style', message: err.message}})}))
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(sass())
    .pipe(autoprefixer('last 2 versions'))
    .pipe(rename({suffix: '.min'}))
    .pipe(mincss())
    .pipe(gulpIf(isDevelopment, sourcemaps.write()))
    .pipe(gulp.dest(paths.styles.dest));  
}

// images
function images() {
    return gulp.src(paths.images.src)
    .pipe(cache(imagemin(
        {
            optimizationLevel: 3, 
            progressive: true,
            interlaced: true
        })))
          .pipe(gulp.dest(paths.images.dest));
}

// watch
function watch() {
  gulp.watch(paths.templates.src, templates);
  gulp.watch(paths.styles.src, styles);
  gulp.watch(paths.images.src, images);   
}


// // server
function server() {
   browserSync.init({
    server: {
      baseDir: "./dist"
    }
  });
  browserSync.watch(['./dist/**/*.*', '!**/*.css'], browserSync.reload);   
}


gulp.task('default', gulp.series (server, watch));


function clean() {
    return del(paths.root);
}

// //project assembly (production)
gulp.task('build', gulp.series(
    clean,
    gulp.parallel(styles, templates, images, fonts),
    gulp.parallel(watch, server)
));