module.exports = function(config) {
    // Karma configuration

    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: '',

        // list of files / patterns to load in the browser
        files: [
            // JASMINE,
            // JASMINE_ADAPTER,
            'bower_components/angular/angular.js',
            'bower_components/jquery/jquery.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'bower_components/lodash/dist/lodash.js',
            'bower_components/crossfilter/crossfilter.js',
            'bower_components/d3/d3.js',
            'bower_components/dcjs/dc.js',
            'bower_components/dcjs/dc.css',
            'src/*.js',
            'test/spec/*.js'
        ],

        frameworks: ["jasmine"],

        // list of files to exclude
        exclude: [],

        // test results reporter to use
        // possible values: dots || progress || growl
        reporters: ['progress'],

        // web server port
        port: 8085,

        // cli runner port
        runnerPort: 9100,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: ['PhantomJS'],

        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 5000,

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false
    });
}
