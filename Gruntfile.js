module.exports = function(grunt) {
    igo.globalGrunt = grunt;
    igo.initTasks(grunt);
    igo.initConfigs(grunt);
    igo.includeModules(grunt);
}

igo = {};

igo.initConfigs = function(grunt){
    if(!grunt.file.exists("configGrunt.json")) {
        grunt.file.copy("configGrunt.exemple.json", "configGrunt.json");
    } 
    if(!grunt.file.exists("modules.json")) {
        grunt.file.copy("modules.exemple.json", "modules.json");
    } 

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        config: grunt.config.set('config', grunt.file.readJSON('configGrunt.json')),
        modules: grunt.config.set('modules', grunt.file.readJSON(grunt.config.get('config').pathModules)),
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
                src: ['interfaces/navigateur/app/cache/']
            },
            cacheFichier: {
                options: {
                    mode: '660'
                },
                src: ['interfaces/navigateur/app/cache/*']
            }
        },
        shell: {
            gitstatus: {
                command: function (dir) {
                    return "cd " + dir + " && git status -s";
                }
            },
            gitstatuscomplet: {
                command: function (dir) {
                    return "cd " + dir + " && git status";
                }
            },
            gitcheckout: {
                command: function (dir, branch) {
                    return "cd " + dir + " && git checkout " + branch;
                }
            },
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
                    return "phantomjs interfaces/navigateur/public/testUnit/run-qunit.js <%= config.urlTestUnit %> | \
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
                                grunt.log.error("Dans configGrunt.json, veillez définir 'urlTestUnit'");
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
            cache: ['interfaces/navigateur/app/cache/*']
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
        gitclone: grunt.config.get("modules"),
        gitpull: grunt.config.get("modules")
    });
}

igo.includeModules = function(grunt, modules){
    modules = modules || grunt.config.get("modules");
    if(!modules){
        return false;
    }

    var base = '';
    if(grunt['projectPath']){
        base = grunt['projectPath'] + '/'; 
    }
    for (var key in modules) {
        var mod = modules[key];
        if(!mod.options){
            continue;
        }
        if(grunt.file.isDir(base + mod.options.directory) && grunt.file.isFile(base + mod.options.directory + '/Gruntfile.js')){
            require("grunt-load-gruntfile")(grunt);
            grunt.loadGruntfile(base + mod.options.directory);
        } 
    }; 
}

igo.initTasks = function(grunt){
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
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks("grunt-jsbeautifier");
    grunt.loadNpmTasks('grunt-git');
    grunt.loadNpmTasks("grunt-then");
    //grunt-uncss
    //grunt-contrib-less

    grunt.registerTask('default', ['libs', 'build', 'cache']);
    grunt.registerTask('build', ['buildIgo', 'buildLibs']);
    grunt.registerTask('buildIgo', 'build les js Igo', ['requirejs']);
    grunt.registerTask('buildLibs', ['shell:buildOpenLayers', 'uglify:LayerTreeBuilder', 'uglify:WMSBrowser', 'uglify:GeoExt', 'uglify:GeoExtDebug']);
    grunt.registerTask('cache', ['clean:cache', 'chmod:cacheDossier', 'chmod:cacheFichier']);
    grunt.registerTask('libs', ['shell:bowerinstall']);
    grunt.registerTask('doc', 'Génération de la documentation', ['jsdoc']);
    grunt.registerTask('qUnit', 'Lancer les tests unitaires', ['shell:qUnit']);
    grunt.registerTask('notify', ['notify:watch']);
    grunt.registerTask('surveiller', ['watch:scripts']);
    grunt.registerTask('gruntConfig', ['copy:gruntConfig']);
    //jsbeautifier et //jshint

    grunt.task.registerTask('modules', 'Gérer les modules', igo.modulesTask);
    grunt.task.registerTask('init', 'Init igo', igo.init);

    grunt.task.run('notify_hooks');
}

igo.init = function(serveur, repertoire){
    var grunt = igo.globalGrunt;
    var modulesPath = grunt.config.get('config').pathModules;

    if(serveur){
        var gitStr = serveur;
        gitStr += repertoire ? ':' + repertoire : "";

        var modulesStr = grunt.file.read(modulesPath);
        modulesStr = modulesStr.replace('[git]' , gitStr);
        grunt.file.write(modulesPath, modulesStr);

        igo.initConfigs(grunt);
    } else {
        var modulesStr = grunt.file.read(modulesPath);
        var find = modulesStr.indexOf('[git]');
        if(find !== -1){
            grunt.log.writeln("Aucun module de défini");
            grunt.task.run(['default']);
            return true;
        }
    }
    
    grunt.task.run(['default', 'modules:get', 'modules:init']);
} 


igo.modulesTask = function(commande, nomModule, param3){
    var grunt = igo.globalGrunt;

    var modules = grunt.config.get("modules");
    if(!modules){
        grunt.log.error("La liste des modules n'est pas définie");
        return false;
    }
    if(nomModule && nomModule !== 'all'){
        var moduleTrouve = modules[nomModule];
        if(!moduleTrouve){
            grunt.log.error("Module '" + nomModule + "' inconnu");
            return false;
        }
        modules = {};
        modules[nomModule] = moduleTrouve;
    }

    if(commande === 'get'){
        igo.modulesGetTask(grunt, modules);
    } else if (commande === 'init'){
        igo.modulesInitTask(grunt, modules);
    } else if (commande === 'update'){
        igo.modulesUpdateTask(grunt, modules);
    } else if (commande === 'clean'){
        igo.modulesCleanTask(grunt, modules);
    } else if (commande === 'reset') {
        igo.modulesResetTask(grunt, modules);
    } else if (commande === 'status') {
        igo.modulesStatusTask(grunt, modules);
    } else if (commande === 'statusC') {
        igo.modulesStatusTask(grunt, modules, true);
    } else if (commande === 'checkout') {
        igo.modulesCheckoutTask(grunt, modules, param3);
    } else if (commande === '') {
        grunt.log.error("Une commande est requise.");
    } else {
        grunt.log.error("Commande introuvable.");
    }
}


igo.modulesGetTask = function(grunt, modules){
    var i = 0;
    var iE = 0;
    for (var key in modules) {
        var mod = modules[key];
        if(!igo.verifierModuleConfig(grunt, mod)){
            continue;
        }
        if(grunt.file.isDir(mod.options.directory)){
            grunt.verbose.warn("Le répertoire du module '" + key + "' existe déjà.");
            iE++;
        } else {
            var task = "gitclone:" + key;
            grunt.task.run(task);
            i++;
        }
    };
    grunt.log.writeln(i + " modules à cloner.");
    if(iE){
        grunt.log.writeln(iE + " modules existe déjà.");
    }
}

igo.modulesInitTask = function(grunt, modules){   
   igo.includeModules(grunt, modules);
   var i = 0;

   for (var key in modules) {
        var mod = modules[key];
        if(!igo.verifierModuleConfig(grunt, mod)){
            continue;
        }
        if (grunt.task.exists(key + ':init')){
            grunt.task.run(key + ':init');
            i++;
        }    
    };
    grunt.log.writeln(i + " modules à initier.");
}

igo.modulesUpdateTask = function(grunt, modules){
    var iC = 0;
    var iM = 0;
    var iG = 0;
    for (var key in modules) {
        var mod = modules[key];
        if(!igo.verifierModuleConfig(grunt, mod)){
            continue;
        }
        if(grunt.file.isDir(mod.options.directory)){
            if(grunt.file.isDir(mod.options.directory + ".git")){
                var task = "gitpull:" + key;
                grunt.task.run(task);
                iM++;
            } else {
                grunt.log.warn("Le module '" + key + "' n'est pas dans git.");
                iG++;
            }      
        } else {
            var task = "gitclone:" + key;
            grunt.task.run(task);
            iC++;
        }
    };
    grunt.log.writeln(iC + " modules à cloner.");
    grunt.log.writeln(iM + " modules à mettre à mis à jour.");
    if(iG){
        grunt.log.writeln(iG + " modules absents de git.");
    }
}

igo.modulesCleanTask = function(grunt, modules){
    var i = 0;
    for (var key in modules) {
        var mod = modules[key];
        if(!igo.verifierModuleConfig(grunt, mod)){
            continue;
        }
        if(grunt.file.isDir(mod.options.directory)){
            grunt.file.delete(mod.options.directory)
            i++;
        } 
    };
    grunt.log.writeln(i + " modules à supprimer.");
}

igo.modulesResetTask = function(grunt, modules){
    igo.modulesCleanTask(grunt, modules);
    igo.modulesGetTask(grunt, modules);
}

igo.modulesStatusTask = function(grunt, modules, gitstatuscomplet){
    var i = 0;
    var iG = 0;
    for (var key in modules) {
        var mod = modules[key];
        if(!igo.verifierModuleConfig(grunt, mod)){
            continue;
        }
        if(grunt.file.isDir(mod.options.directory)){
            if(grunt.file.isDir(mod.options.directory + ".git")){
                var task = "shell:gitstatus:" + mod.options.directory;
                if(gitstatuscomplet){
                    task = "shell:gitstatuscomplet:" + mod.options.directory;
                }
                grunt.task.run(task);
                i++;
            } else {
                grunt.log.warn("Le module '" + key + "' n'est pas dans git.");
                iG++;
            } 
        }
    };
    grunt.log.writeln(i + " modules à analyser.");
    if(iG){
        grunt.log.writeln(iG + " modules absents de git.");
    }
}

igo.modulesCheckoutTask = function(grunt, modules, branche){
    branche = branche || 'master';
    var i = 0;
    var iG = 0;
    for (var key in modules) {
        var mod = modules[key];
        if(!igo.verifierModuleConfig(grunt, mod)){
            continue;
        }
        if(grunt.file.isDir(mod.options.directory)){
            if(grunt.file.isDir(mod.options.directory + ".git")){
                var task = "shell:gitcheckout:" + mod.options.directory + ":" + branche;
                grunt.task.run(task);
                i++;
            } else {
                grunt.log.warn("Le module '" + key + "' n'est pas dans git.");
                iG++;
            } 
        }
    };
    grunt.log.writeln(i + " modules à changer de branche.");
    if(iG){
        grunt.log.writeln(iG + " modules absents de git.");
    }
}

igo.verifierModuleConfig = function(grunt, mod){
    if(!mod.options){
        grunt.log.warn("Le module '" + key + "' n'est pas configuré correctement.");
        return false;
    }
    return true;
}