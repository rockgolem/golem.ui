/*global module:false*/
module.exports = function(grunt) {

        // Project configuration.
    grunt.initConfig({
        pkg : '<json:package.json>',
        meta : {
            banner : [
                '/**\n',
                ' * <%= pkg.name %> v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n',
                ' * <%= pkg.description %>\n',
                ' *\n',
                ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n',
                ' * Licensed <%= pkg.license %>\n',
                ' */'
            ].join('')
        },
        lint : {
            files : ['grunt.js', 'test/**/*.js', 'src/*']
        },
        concat : {
            jsDist : {
                src : [
                    '<banner:meta.banner>',
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
                    'src/js/ui/widget/menu/*.js',
                    'src/js/ui/widget/utility/*.js',
                    'src/js/outro.js'
                ],
                dest : 'dist/js/<%= pkg.name %>-<%= pkg.version %>.js'
            },
            cssDist : {
                src : ['src/css/golem-ui.css'],
                dest : 'dist/css/<%= pkg.name %>-<%= pkg.version %>.css'
            },
            filtersDist : {
                src : ['src/css/filters/golem-filters.svg'],
                dest : 'dist/css/filters/golem-filters.svg'
            },

            /**
             * Example files
             */
            jsExample : {
                src : ['<config:concat.jsDist.dest>'],
                dest : 'examples/js/<%= pkg.name %>.js'
            },
            cssExample : {
                src : ['<config:concat.cssDist.dest>'],
                dest : 'examples/css/<%= pkg.name %>.css'
            },
            filtersExample : {
                src : ['src/css/filters/golem-filters.svg'],
                dest : 'examples/css/filters/golem-filters.svg'
            },
        },
        min : {
            jsDist : {
                src : ['<banner:meta.banner>', '<config:concat.jsDist.dest>'],
                dest : 'dist/js/<%= pkg.name %>-<%= pkg.version %>.min.js'
            }
        },
        watch : {
            files : '<config:lint.files>',
            tasks : 'concat min'
        },
        jasmine : {
            build : {
                src : '<config:concat.jsDist.dest>',
                options: {
                    specs: 'test/spec/*.spec.js'
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
        },
        uglify : {}
    });

    // Default task.
    grunt.registerTask('default', 'concat min jasmine');
};