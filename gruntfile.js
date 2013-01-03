/*global module:false*/
module.exports = function(grunt) {
    var config = {
        banner : [
            '/**\n',
            ' * <%= pkg.name %> v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n',
            ' * <%= pkg.description %>\n',
            ' *\n',
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n',
            ' * Licensed <%= pkg.license %>\n',
            ' */\n'
        ].join(''),

        sources : [
            'src/js/golem.js',
            'src/js/intro.js',
            'src/js/golem.util.js',
            'src/js/golem.preload.js',
            'src/js/ui/golem.ui.js',
            'src/js/ui/golem.ui.widget.js',
            'src/js/ui/widget/collection.js',
            'src/js/ui/widget/data.js',
            'src/js/ui/widget/menu.js',
            'src/js/ui/widget/utility.js',
            'src/js/ui/widget/collection/*.js',
            'src/js/ui/widget/data/*.js',
            //'src/js/ui/widget/menu/*.js',
            //'src/js/ui/widget/utility/*.js',
            'src/js/outro.js'
        ],

        pkg : grunt.file.readJSON('package.json'),
        uglifyFiles : {}
    };

    // setup dynamic filenames
    config.versioned = [config.pkg.name, config.pkg.version].join('-');
    config.jsDist = ['dist/js/', '.js'].join(config.versioned);
    config.cssDist = ['dist/css/', '.css'].join(config.versioned);
    config.uglifyFiles[['dist/js/', '.min.js'].join(config.versioned)] = config.jsDist;

    // Project configuration.
    grunt.initConfig({
        pkg : config.pkg,
        lint : {
            files : ['grunt.js', 'test/**/*.js', 'src/*']
        },
        clean : {
            dist : ['dist/js', 'dist/css']
        },
        concat : {
            options : {
                stripBanners : true,
                banner : config.banner
            },
            jsDist : {
                src : config.sources,
                dest : config.jsDist
            },
            cssDist : {
                src : ['src/css/golem-ui.css'],
                dest : config.cssDist
            },

            /**
             * Example files
             */
            jsExample : {
                src : [config.jsDist],
                dest : ['examples/js/', '.js'].join(config.pkg.name)
            },
            cssExample : {
                src : [config.cssDist],
                dest : ['examples/css/', '.css'].join(config.pkg.name)
            }
        },

        copy : {
            dist : {
                files : {
                    "dist/css/filters/golem-filters.svg" : "src/css/filters/golem-filters.svg"
                }
            },
            example : {
                files : {
                    "examples/css/filters/golem-filters.svg" : "src/css/filters/golem-filters.svg"
                }
            },

            // preloader unit tests need some data files, so cpying those to the example directory to be served.
            tests : {
                files : {
                    "examples/js/test/preloader.data1.js" : "test/src/preloader.data1.js",
                    "examples/js/test/preloader.data2.js" : "test/src/preloader.data2.js"
                }
            }
        },
        uglify : {
            options : { mangle : true },
            jsDist : {
                files : config.uglifyFiles
            }
        },
        jasmine : {
            tests : {
                src : ['dist/js/', '.min.js'].join(config.versioned),
                options : {
                    specs : 'test/spec/*.spec.js',
                    template : 'test/grunt.tmpl'
                }
            }
        },
        jshint : {
            options : {
                curly : true,
                eqeqeq : true,
                immed : true,
                latedef : true,
                newcap : true,
                noarg : true,
                sub : true,
                undef : true,
                boss : true,
                eqnull : true,
                browser : true
            },
            globals : {}
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Default task.
    grunt.registerTask('default', ['clean', 'copy', 'concat', 'uglify', 'jasmine']);
};