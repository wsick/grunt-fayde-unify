var fs = require('fs'),
    path = require('path'),
    unify = require('fayde-unify'),
    renderer = unify.renderer,
    JsonFile = unify.JsonFile,
    Library = unify.Library;

module.exports = function (grunt) {
    function getAllTypings(config) {
        var unify = new JsonFile(config.unifyPath);
        var typings = getTypings(config.basePath, unify, !!config.includeSelf, !!config.includeDevSelf);

        var lib = new Library(unify, new renderer.Standard());
        if (!fs.existsSync(lib.bower.bowerFilepath)) {
            grunt.verbose.write('Could not find bower file [')
                .write(lib.bower.bowerFilepath)
                .writeln('].');
            verboseTypings(typings);
            return typings;
        }

        grunt.verbose.write('Collecting bower dependencies from [')
            .write(lib.bower.bowerFilepath)
            .write(']...');
        var deps = unique(getAllDependencies(lib));
        grunt.verbose.ok();
        var allTypings = deps
            .reduce(function (agg, cur) {
                return agg.concat(getTypings(config.basePath, cur.unify, true, false));
            }, typings);
        verboseTypings(allTypings);
        return allTypings;
    }

    function getTypings(basePath, unify, includeSelf, includeDev) {
        if (!unify.exists) {
            grunt.verbose.write('Ignored typings from missing file [')
                .write(unify.path)
                .writeln(']');
            return [];
        }

        grunt.verbose
            .write('Collecting typings from [')
            .write(unify.path)
            .write(']...');

        unify.loadSync();
        var typings = [];
        if (includeSelf)
            typings = typings.concat(unify.getValue('typings') || []);
        if (includeDev)
            typings = typings.concat(unify.getValue('devTypings') || []);
        var unifyDir = path.resolve(path.dirname(unify.path));
        var rv = typings.map(function (typing) {
            return path.relative(basePath, path.join(unifyDir, typing));
        });
        grunt.verbose.ok();
        return rv;
    }

    function getAllDependencies(sourceLib, lib) {
        lib = lib || sourceLib;
        return lib.bower.getDependenciesSync()
            .reduce(function (agg, cur) {
                var curlib = sourceLib.createDependent(cur);
                agg.push(curlib);
                return agg
                    .concat([curlib])
                    .concat(getAllDependencies(sourceLib, curlib));
            }, []);
    }

    function verboseTypings(typings) {
        grunt.verbose.write('Typings: ')
            .writeln(grunt.log.wordlist(typings, {separator: ', ', color: 'cyan'}));
    }

    return function (config) {
        config = config || {};
        config.basePath = config.basePath || "";
        if (config.unifyPath == null) {
            config.unifyPath = config.basePath;
            if (!config.unifyPath)
                config.unifyPath = path.join(process.cwd(), 'unify.json');
        }
        config.includeSelf = config.includeSelf !== false;
        config.includeDevSelf = config.includeDevSelf !== false;
        return getAllTypings(config);
    };
};

function unique(arr) {
    return arr.reduce(function (agg, cur) {
        return (agg.some(function (check) {
            return check.name === cur.name;
        })) ? agg : agg.concat([cur]);
    }, []);
}