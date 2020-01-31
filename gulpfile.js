const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const del = require('del');
const eslint = require('gulp-eslint');
const ttf2eot = require('gulp-ttf2eot');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const ttf2svg = require('gulp-ttf-svg');
const iconfont = require('gulp-iconfont');
const iconfontCss = require('gulp-iconfont-css');
const imagemin = require('gulp-imagemin');
const cssmin = require('gulp-cssmin');
const uglify = require('gulp-uglify');
const sassLint = require('gulp-sass-lint');
const browserSync = require('browser-sync')
  .create();
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const babelify = require('babelify');
const mode = require('gulp-mode')({
  modes: ['production', 'development'],
  default: 'development',
  verbose: false
});

const buildRoot = './build';
const assetsRoot = './assets';
const paths = {
  build: {
    css: `${buildRoot}/css/`,
    images: `${buildRoot}/images/`,
    fonts: `${buildRoot}/fonts/`,
    js: `${buildRoot}/js/`,
    html: `${buildRoot}/`
  },
  src: {
    html: `${assetsRoot}/html/**/*.html`,
    styles: `${assetsRoot}/styles/**/*.scss`,
    images: `${assetsRoot}/images/*.{jpg,png,svg,ico,gif}*`,
    fonts: `${assetsRoot}/fonts/`,
    icons: `${assetsRoot}/icons/*.svg`,
    js: `${assetsRoot}/js/**/*.js`,
    entryJS: `${assetsRoot}/js/main.js`
  },
  vendors: {
    css: [],
    js: []
  }
};

// ===== Dev server =====
gulp.task('server', (done) => {
  browserSync.init({
    server: {
      baseDir: "./"
    }
  });
  done();
});

gulp.task('reload', (done) => {
  browserSync.reload();
  done();
});


// ===== Linters =====
gulp.task('lint:styles', (done) => {
  gulp.src(paths.src.styles)
    .pipe(sassLint({
      options: {
        formatter: 'stylish',
        'merge-default-rules': false
      },
      files: { ignore: ['**/_icons.scss', '**/_mixin.scss'] },
      rules: {
        'no-ids': 2,
        'no-duplicate-properties': 2,
        'no-empty-rulesets': 2
      }
    }))
    .pipe(sassLint.format())
    .pipe(mode.production(sassLint.failOnError()));
  done();
});

gulp.task('lint:js', (done) => {
  gulp.src(paths.src.js)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(mode.production(sassLint.failOnError()));
  done();
});

gulp.task('lint:all', gulp.series('lint:styles', 'lint:js'));


// ===== Styles =====
gulp.task('styles', (done) => {
  gulp.src(paths.src.styles)
    .pipe(mode.development(sourcemaps.init()))
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(autoprefixer('last 2 versions', '> 1%', 'ie 10'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(mode.development(sourcemaps.write()))
    .pipe(gulp.dest(paths.build.css));
  done();
});

gulp.task('watch:styles', () => {
  gulp.watch(paths.src.styles, gulp.series('styles'));
});


// ===== Javascript =====

gulp.task('js', (done) => {
  browserify({ entries: ['./assets/js/main.js'] })
    .transform(babelify, { presets: ['@babel/preset-env'] })
    .bundle()
    .pipe(source('main.js'))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(buffer())
    .pipe(mode.development(sourcemaps.init()))
    .pipe(uglify())
    .pipe(mode.development(sourcemaps.write()))
    .pipe(gulp.dest(paths.build.js));
  done();
});

gulp.task('watch:js', () => {
  gulp.watch(paths.src.js, gulp.series('js'));
});


// ===== Tasks for images =====
gulp.task('images:optimize', (done) => {
  gulp.src(paths.src.images)
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.jpegtran({ progressive: true }),
      imagemin.optipng({ optimizationLevel: 3 }),
      imagemin.svgo({
        plugins: [{ removeViewBox: true }]
      })
    ]))
    .pipe(gulp.dest(paths.build.images));
  done();
});


// ===== Tasks for FONTS =====
gulp.task('ttf2eot', (done) => {
  gulp.src(`${paths.src.fonts}*.ttf`)
    .pipe(ttf2eot())
    .pipe(gulp.dest(paths.build.fonts));
  done();
});

gulp.task('ttf2woff', (done) => {
  gulp.src(`${paths.src.fonts}*.ttf`)
    .pipe(ttf2woff())
    .pipe(gulp.dest(paths.build.fonts));
  done();
});

gulp.task('ttf2woff2', (done) => {
  gulp.src(`${paths.src.fonts}*.ttf`)
    .pipe(ttf2woff2())
    .pipe(gulp.dest(paths.build.fonts));
  done();
});

gulp.task('ttf2svg', (done) => {
  gulp.src(`${paths.src.fonts}*.ttf`)
    .pipe(ttf2svg())
    .pipe(gulp.dest(paths.build.fonts));
  done();
});

const runTimestamp = Math.round(Date.now() / 1000);
gulp.task('iconfont', (done) => {
  gulp.src(paths.src.icons)
    .pipe(iconfontCss({
      path: 'assets/styles/icons/templates/_icons.scss',
      targetPath: '../styles/icons/_icons.scss',
      fontPath: '../fonts/',
      fontName: 'icons',
      cacheBuster: runTimestamp
    }))
    .pipe(iconfont({
      fontName: 'icons',
      timestamp: runTimestamp,
      formats: ['svg', 'ttf', 'eot', 'woff', 'woff2'],
      normalize: true,
      fontHeight: 1001
    }))
    .pipe(gulp.dest(paths.src.fonts));
  done();
});

gulp.task('fonts:copy', (done) => {
  gulp.src(`${paths.src.fonts}*.*`)
    .pipe(gulp.dest(paths.build.fonts));
  done();
});

gulp.task('fonts', gulp.series('iconfont', gulp.parallel('ttf2woff', 'ttf2woff2', 'ttf2eot', 'ttf2svg')));

// ===== Copy vendors =====
gulp.task('vendors:copy-js', () => {
  gulp.src(paths.vendors.js)
    .pipe(gulp.dest(paths.build.js));
});

gulp.task('vendors:copy-css', () => {
  gulp.src(paths.vendors.css)
    .pipe(cssmin())
    .pipe(gulp.dest(paths.build.css));
});

gulp.task('vendors:copy-all', gulp.series('vendors:copy-css', 'vendors:copy-js'));


gulp.task('build:dev', gulp.series('styles', 'images:optimize', 'js', gulp.parallel('watch:styles', 'watch:js')));


gulp.task('clean', () => {
  del.sync([buildRoot], { force: true });
});


gulp.task('build:prod', gulp.series('clean', 'fonts', 'images:optimize', 'lint:styles', 'styles', 'lint:js', 'js'));
