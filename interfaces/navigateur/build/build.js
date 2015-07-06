({
    //appDir: "./",
    baseUrl: "../public/",
    //dir: "build",
    //optimize: "closure",
    name: '../build/main',
    mainConfigFile: 'configRequire.js',
    out: '../public/js/main-build.js',
    preserveLicenseComments: false,
    uglify: {
        //toplevel: true,
        ascii_only: true,
        //beautify: true,
        max_line_length: 1000,
        no_mangle: true
    },
    closure: {
        CompilerOptions: {},
        CompilationLevel: 'WHITESPACE_ONLY',
        loggingLevel: 'WARNING'
    }
})
