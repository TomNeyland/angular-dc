### ###############################################################################################
#
#   This module contains all configuration for the build process
#
### ###############################################################################################
ANGULAR_TAG = "~1.2.0"

gulp = require("gulp")
require("shelljs/global")

gulp.task "publish", ['default'], ->
    r = exec "git diff --no-ext-diff --quiet --exit-code"
    if r.code > 0
        exec("git status")
        echo "Please commit your changes before publish!"
        return
    bower_json =
        name: "angular-dc"
        version: "0.0.5"
        main: ["scripts.js"]
        ignore: []
        description: "Angular bindings for dc.js"
        dependencies: {}

    exec("git checkout gh-pages")
    cp "-rf", "static/*", "."
    JSON.stringify(bower_json).to("bower.json")
    exec("git add .")
    exec("git commit -m " + bower_json.version)
    exec("git tag " + bower_json.version)
    exec("git push buildbot gh-pages")
    exec("git push buildbot " + bower_json.version)
    exec("git checkout master")

config =

    ### ###########################################################################################
    #   Name of the module
    ### ###########################################################################################
    name: 'angularDc'

    ### ###########################################################################################
    #   Directories
    ### ###########################################################################################
    dir:
        # The build folder is where the app resides once it's completely built
        build: 'dist'
    files:
    # app entrypoint should be placed first, so need to be specific
        app: [
            'src/**/*.module.js'
        ]

        # scripts (can be coffee or js)
        scripts: [
            'src/**/*.js'
            '!src/**/*.spec.js'
            'src/**/*.coffee'
            '!src/**/*.spec.coffee'
        ]

        # CoffeeScript tests
        tests: [
            'test/**/*.coffee'
            'src/**/*.spec.coffee'
            'test/**/*.js'
            'src/**/*.spec.js'
        ]
        index: [
            'test/index.jade'
        ]
        less: [
            'test/styles.less'
        ]
    devserver:
        # development server port
        port: 8080

    sourcemaps: true
    vendors_apart: true
    ### ###########################################################################################
    #   Bower dependancies configuration
    ### ###########################################################################################
    bower:
        deps:
            jquery:
                version: '~2.1.1'
                files: 'dist/jquery.js'
            angular:
                version: ANGULAR_TAG
                files: 'angular.js'
            lodash:
                version: "~2.4.1"
                files: 'dist/lodash.js'
            'd3':
                version: "~3.3.11"
                files: 'd3.js'
            'dc.js':
                version: "master"
                files: 'dc.js'
            'crossfilter':
                version: "~1.3.0"
                files: 'crossfilter.js'
        testdeps:
            "angular-mocks":
                version: ANGULAR_TAG
                files: "angular-mocks.js"

module.exports = config
