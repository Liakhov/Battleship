var gulp = require('gulp'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    del = require('del'), // удаление файлов
    sourcemaps = require("gulp-sourcemaps"),
    concat = require('gulp-concat'), // для конкатенации файлов
    uglify = require('gulp-uglifyjs'), // cжатие js
    cssnano = require('gulp-cssnano'), // сжатие css
    rename = require('gulp-rename'), // переименование файлов
    babel = require("gulp-babel"), // транспайлер переписывающий код c ES6 на код ES5
    autoprefixer = require('gulp-autoprefixer');// автоматическое добавления префиксов

gulp.task('sass',function () {
    return gulp.src('src/sass/**/*.scss')
        .pipe(sass().on('error', function (error) {
            console.log(error);
        }))
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
        .pipe(gulp.dest('src/css'))
        .pipe(browserSync.reload({stream: true}))
});

gulp.task("babel", function () {
    return gulp.src("src/js/main.js")
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(concat('main.min.js')) // Собираем в кучу в новом файле scripts.min.js
        //.pipe(uglify()) // Сжимаем JS файл
        .pipe(gulp.dest('src/js')); // Выгружаем в папку app/libs
});

gulp.task('css-libs', ['sass'], function() {
    return gulp.src('src/css/style.css') // Выбираем файл для минификации
        .pipe(cssnano()) // Сжимаем
        .pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
        .pipe(gulp.dest('src/css')); // Выгружаем в папку src/css
});

gulp.task('browser-sync', function () {
    browserSync({
        server: {
            baseDir: 'src'
        },
        notify: false
    });
});

gulp.task('clean', function() {
    return del.sync('dist'); // Удаляем папку dist перед сборкой
});

gulp.task('build', ['clean', 'css-libs', 'babel'], function () {

    var bulidHtml = gulp.src('src/*.html')  // Переносим файлы HTML
        .pipe(gulp.dest('dist'));

    var buildCss = gulp.src(['src/css/style.css'])   // Переносим файлы CSS
        .pipe(gulp.dest('dist/css'));

    var bulidJs = gulp.src('src/js/main.min.js')  // Переносим файлы JS
        .pipe(gulp.dest('dist/js'));

    var buildFonts = gulp.src('src/fonts/**/*') // Переносим шрифты
        .pipe(gulp.dest('dist/fonts'));

    var buildIMG = gulp.src('src/img/**/*') // Переносим изображения
        .pipe(gulp.dest('dist/img'));
});
gulp.task('watch',['browser-sync','babel', 'sass'] , function () {
    gulp.watch('src/sass/**/*.sass', ['scss']);
    gulp.watch('src/js/main.js', ['babel']);
    gulp.watch('src/*.html', browserSync.reload);
    gulp.watch('src/js/**/*.js', browserSync.reload);
});
gulp.task('default', ['watch']);