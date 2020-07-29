import gulp from "gulp";
import babel from "gulp-babel";
import postcss from "gulp-postcss";
import postcssImport from "postcss-import";
import postcssMediaMinMax from "postcss-media-minmax";
import postcssAutoPrefixer from "autoprefixer";
import postcssCsso from "postcss-csso";
import replace from "gulp-replace";
import htmlmin from "gulp-htmlmin";
import sass from "gulp-sass";
import terser from "gulp-terser";
import sync from "browser-sync";
import webpack from "webpack-stream";

/* HTML */

const html = (cb) => {
    gulp.src("./src/**.html")
        .pipe(
            htmlmin({
                removeComments: true,
                collapseWhitespace: true,
            })
        )
        .pipe(gulp.dest("dist"))
        .pipe(sync.stream());
    cb();
};

const styles = (cb) => {
    gulp.src("src/scss/main.scss")
        .pipe(sass().on("error", sass.logError))
        .pipe(
            postcss([
                postcssImport,
                postcssMediaMinMax,
                postcssAutoPrefixer,
                postcssCsso,
            ])
        )
        .pipe(replace(/\.\.\//g, ""))
        .pipe(gulp.dest("dist"))
        .pipe(sync.stream());
    cb();
};

const scripts = (cb) => {
    gulp.src("./src/index.js")
        // .pipe(
        //     babel({
        //         presets: ["@babel/preset-env"],
        //     })
        // )
        .pipe(
            webpack({
                mode: "production",
                output: {
                    filename: "index.js",
                },
                module: {
                    rules: [
                        {
                            test: /\.m?js$/,
                            exclude: /(node_modules|bower_components)/,
                            use: {
                                loader: "babel-loader",
                                options: {
                                    presets: ["@babel/preset-env"],
                                },
                            },
                        },
                    ],
                },
            })
        )
        // .pipe(terser())
        .pipe(gulp.dest("dist"))
        .pipe(sync.stream());
    cb();
};

const copy = (cb) => {
    gulp.src(["src/fonts/**/*", "src/images/**/*"], { base: "src" })
        .pipe(gulp.dest("dist"))
        .pipe(sync.stream({ once: true }));
    cb();
};

const server = (cb) => {
    sync.init({
        ui: false,
        notify: false,
        open: false,
        server: {
            baseDir: "dist",
        },
    });

    cb();
};

const update = (cb) => {
    gulp.watch("src/*.html", html);
    gulp.watch("src/scss/**/*.scss", styles);
    gulp.watch(["src/app/**/*.js", "src/*.js"], scripts);
    gulp.watch(["src/fonts/**/*", "src/images/**/*"], copy);

    cb();
};

const start = (cb) => {
    cb();
};

export default gulp.series(
    gulp.parallel(html, styles, scripts),
    copy,
    gulp.series(update, server)
);
