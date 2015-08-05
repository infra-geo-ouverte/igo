module.exports = function(grunt) {
    initTasks(grunt);
    initConfigs(grunt);
}

function getModulesDir(grunt){
    var modulesJson = grunt.file.readJSON('modules.json');
    var modulesDir = [];
    for (var key in modulesJson) {
        modulesDir.push(modulesJson[key].options.directory);
    };
    return modulesDir;
}

function initConfigs(grunt){
grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        dirs: {
            publicNav: 'interfaces/navigateur/public/',
            build: 'interfaces/navigateur/build/',
            librairies: 'librairie/',
            GeoExt: '<%= dirs.publicNav %>libs/GeoExt/',
            LayerTreeBuilder: '<%= dirs.publicNav %>libs/GeoExt.ux/LayerTreeBuilder/',
            WMSBrowser: '<%= dirs.publicNav %>libs/GeoExt.ux/WMSBrowser/'
        },
        jshint: {
            all: ['interfaces/navigateur/public/js/app/*.js', 'interfaces/navigateur/public/js/app/**/*.js'],
            beforeconcat: ['interfaces/navigateur/public/js/app/*.js', 'interfaces/navigateur/public/js/app/**/*.js'],
            afterconcat: ['interfaces/navigateur/public/js/main-build.js'],
            basic: ['interfaces/navigateur/public/js/app/*.js'],
            options: {
                undef: true,
                curly: true,
                freeze: true,
                futurehostile: true,
                //eqeqeq: true,
                //maxcomplexity: 10,
                //maxdepth: 3,
                //maxstatements: 30,
                unused: true,
                loopfunc: true, //à retirer: enleve avertissement sur function dans une boucle
                globals: {
                    "jQuery": false,
                    "$": false,
                    "Ext": false,
                    "define": false,
                    "require": false,
                    "OpenLayers": false,
                    "document": false,
                    "clearInterval": false,
                    "setInterval": false
                }
            }
        },
        "jsbeautifier": {
            files: ["interfaces/navigateur/public/js/app/*.js"],
            options: {
            }
        },
        // concat: {
        //     options: {
        //         separator: ';',
        //         stripBanners: true,
        //         banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        //             '<%= grunt.template.today("yyyy-mm-dd") %> */',
        //         sourceMap: true
        //     },
        //     dist: {
        //         src: ['<%= dirs.publicNav %>libs/GeoExt.ux/LayerTreeBuilder/lib/widgets/tree/LayerTreeBuilder.js',
        //               '<%= dirs.publicNav %>libs/GeoExt.ux/LayerTreeBuilder/lib/plugins/LayerTreeBuilderNodeAgent.js'],
        //         dest: 'testBuid.js',
        //     },
        // },
        uglify: {
            options: {
                sourceMap: true,
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                        '<%= grunt.template.today("yyyy-mm-dd") %> */',
                compress: {
                    drop_console: true,
                    global_defs: {
                        "DEBUG": false
                    },
                    dead_code: true
                }
            },
            LayerTreeBuilder: {
                files: {
                    '<%= dirs.LayerTreeBuilder %>/LayerTreeBuilder-build.js':
                            grunt.file.readJSON('interfaces/navigateur/build/LayerTreeBuilder.json')
                }
            },
            WMSBrowser: {
                files: {
                    '<%= dirs.WMSBrowser %>/WMSBrowser-build.js':
                            grunt.file.readJSON('interfaces/navigateur/build/WMSBrowser.json')
                }
            },
            GeoExt: {
                files: {
                    '<%= dirs.GeoExt %>/GeoExt-build.js':
                            grunt.file.readJSON('interfaces/navigateur/build/GeoExt.json')
                }
            },
            GeoExtDebug: {
                options: {
                    beautify: true,
                    mangle: false,
                    preserveComments: "all",
                    compress: {}
                },
                files: {
                    '<%= dirs.GeoExt %>/GeoExt-build-debug.js':
                            grunt.file.readJSON('interfaces/navigateur/build/GeoExt.json')
                }
            }
            // OpenLayers: {
            //     files: [{
            //         src: [
            //             "<%= dirs.librairies %>/openlayers/lib/OpenLayers/SingleFile.js",
            //             "<%= dirs.librairies %>/openlayers/lib/OpenLayers/**/*.js",
            //             "!<%= dirs.librairies %>/openlayers/lib/OpenLayers/Lang/*"

            //         ],
            //         dest: '<%= dirs.librairies %>/openlayers/OpenLayers.js'
            //     }]
            // },
            // OpenLayersDebug: {
            //     options: {
            //         beautify: true,
            //         mangle: false,
            //         preserveComments: "all",
            //         compress: {}
            //     },
            //     files: [{
            //         src: [
            //             "<%= dirs.librairies %>/openlayers/lib/OpenLayers/SingleFile.js",
            //             "<%= dirs.librairies %>/openlayers/lib/OpenLayers/**/*.js",
            //             "!<%= dirs.librairies %>/openlayers/lib/OpenLayers/Lang/*"

            //         ],
            //         dest: '<%= dirs.librairies %>/openlayers/OpenLayers.debug.js'
            //     }]
            // }
        },
        requirejs: {
            compile: {
                options: {
                    baseUrl: "interfaces/navigateur/public/",
                    name: "../build/main",
                    mainConfigFile: "interfaces/navigateur/build/configRequire.js",
                    out: 'interfaces/navigateur/public/js/main-build.js',
                    preserveLicenseComments: false,
                    uglify: {
                        ascii_only: true,
                        max_line_length: 1000,
                        no_mangle: true
                    },
                    done: function (done, output) {
                        var duplicates = require('rjs-build-analysis').duplicates(output);

                        if (Object.keys(duplicates).length > 0) {
                            grunt.log.subhead('Duplicates found in requirejs build:');
                            for (var key in duplicates) {
                                grunt.log.error(duplicates[key] + ": " + key);
                            }
                            return done(new Error('r.js built duplicate modules, please check the excludes option.'));
                        } else {
                            grunt.log.success("No duplicates found!");
                        }

                        done();
                    }
                }
            }
        },
        bower: {
            dev: {
                dest: 'libs2',
                options: {
                    packageSpecific: {
                        jquery: {
                            dest: 'libs2/jquery/jquery-1.10.2/',
                            files: ["jquery*.js"]
                        },
                        openlayers: {
                            dest: "libs2/OpenLayers/OpenLayers-2-13-1/",
                            keepExpandedHierarchy: true,
                            //files: ["**"]
                        },
                        "jquery-ui": {
                            dest: 'libs2/jquery/jquery-ui-1-11.2/',
                            //keepExpandedHierarchy: true,
                            files: ["jquery-ui*.js"]
                        },
                        "devbridge-autocomplete": {
                            dest: 'libs2/jquery/extension/autocomplete/',
                            keepExpandedHierarchy: false,
                            files: ["**/jquery.autocomplete*.js"]
                        },
                        extjs: {
                            dest: 'libs2/extjs/ext-3.4.0/',
                            keepExpandedHierarchy: true,
                            files: ["*", "welcome/**", "src/**", "resources/**", "pkgs/**", "adapter/**"]
                        }
                    }
                }
            },
        },
        chmod: {
            options: {
                mode: '770'
            },
            cacheDossier: {
                src: ['interfaces/navigateur/app/cache/', 'pilotage/app/cache/']
            },
            cacheFichier: {
                options: {
                    mode: '660'
                },
                src: ['interfaces/navigateur/app/cache/*', 'pilotage/app/cache/*']
            }
        },
        shell: {
            bowerinstall: {
                command: function () {
                    return 'bower install';
                }
            },
            bowerupdate: {
                command: function () {
                    return 'bower update';
                }
            },
            buildOpenLayers: {
                command: [
                    'cd <%= dirs.librairies %>/openlayers/build/',
                    'python buildUncompressed.py full ../OpenLayers.debug.js',
                    'python build.py full ../OpenLayers.js'
                ].join('&&')
            },
            qUnit: {
                command: function () {
                    return "phantomjs interfaces/navigateur/public/testUnit/run-qunit.js <%= pkg.urlTestUnit %> | \
                            grep 'failures=\"0\"'";
                },
                options: {
                    execOptions: {
                        timeout: 30000
                    },
                    callback: function log(err, stdout, stderr, cb) {
                        if (!stdout) {
                            grunt.log.subhead('Tests échecs');
                            if (err && err.signal === "SIGTERM") {
                                grunt.log.error("timeout");
                            } else {
                                grunt.log.error("Dans package.json, veillez définir 'urlTestUnit'");
                            }
                            return cb(new Error('Tests échecs'));
                        }
                        var patternT = /tests=\"[0-9]*\"/;
                        var matchT = patternT.exec(stdout);
                        var tests = matchT[0].substring(7, matchT[0].length - 1);
                        var patternE = /failures=\"[0-9]*\"/;
                        var matchE = patternE.exec(stdout);
                        var echecs = matchE[0].substring(10, matchE[0].length - 1);
                        if (echecs > 0) {
                            grunt.log.subhead('Tests échecs');
                            grunt.log.error(echecs + " échecs sur " + tests + " tests");
                            return cb(new Error('Tests échecs'));
                        }
                        grunt.log.success(tests + " Tests réussis !");
                        cb();
                    }
                }
            }
        },
        clean: {
            cache: ['interfaces/navigateur/app/cache/*', 'pilotage/app/cache/*'],
            modules: [getModulesDir(grunt)]
        },
        watch: {
            scripts: {
                files: ['interfaces/navigateur/public/js/app/*.js', 'interfaces/navigateur/public/js/app/**/*.js'],
                tasks: ['default'],
                options: {
                    //spawn: false,
                },
            },
        },
        notify: {
            task_name: {
                options: {
                    // Task-specific options go here.
                }
            },
            watch: {
                options: {
                    title: 'Tâches complètées', // optional
                    message: 'Toutes les tâches ont étés complètées avec succès', //required
                }
            }
        },
        jsdoc: {
            dist: {
                src: ['interfaces/navigateur/public/js/app/*.js', 'interfaces/navigateur/public/js/app/**/*.js'],
                options: {
                    destination: 'doc/interfaces/navigateur/',
                    template: "node_modules/grunt-jsdoc/node_modules/ink-docstrap/template",
                    configure: "node_modules/grunt-jsdoc/node_modules/ink-docstrap/template/jsdoc.conf.json"
                }
            }
        },
        gitclone: grunt.file.readJSON('modules.json'),
        gitpull: grunt.file.readJSON('modules.json')
    });
}

    
function initTasks(grunt){
    //grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    //grunt.loadNpmTasks('grunt-bower');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-chmod');
    //grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-notify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks("grunt-jsbeautifier");
    grunt.loadNpmTasks('grunt-git');
//grunt-uncss
//grunt-contrib-less

    grunt.registerTask('default', ['telechargerLibs', 'build', 'cache', 'doc', 'qUnit', 'notify:watch']);
    grunt.registerTask('build', ['buildIgo', 'buildLibs']);
    grunt.registerTask('buildIgo', ['requirejs']);
    grunt.registerTask('buildLibs', ['shell:buildOpenLayers', 'uglify:LayerTreeBuilder', 'uglify:WMSBrowser', 'uglify:GeoExt', 'uglify:GeoExtDebug']);
    grunt.registerTask('cache', ['clean:cache', 'chmod:cacheDossier', 'chmod:cacheFichier']);
    grunt.registerTask('telechargerLibs', ['shell:bowerinstall']);
    grunt.registerTask('doc', ['jsdoc']);
    grunt.registerTask('qUnit', ['shell:qUnit']);
    grunt.registerTask('cloneModules', ['gitclone']);
    grunt.registerTask('pullModules', ['gitpull']);
    grunt.registerTask('cleanModules', ['clean:modules']);
    //jsbeautifier et //jshint

    grunt.task.run('notify_hooks');
}
