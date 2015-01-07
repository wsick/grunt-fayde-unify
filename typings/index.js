var fs = require('fs'),
    path = require('path'),
    unify = require('fayde-unify'),
    renderer = unify.renderer,
    JsonFile = unify.JsonFile,
    Library = unify.Library;

module.exports = function (grunt) {
    function getTypings(basePath, unify, isSelf) {
        grunt.verbose
            .write('Collecting typings from [')
            .write(unify.path)
            .writeln(']...');

        var typings = unify.getValue('typings') || [];
        if (isSelf) {
            typings = typings.concat(unify.getValue('devTypings') || []);
        }
        var unifyDir = path.resolve(path.dirname(unify.path));
        return typings.map(function (typing) {
            return path.relative(basePath, path.join(unifyDir, typing));
        });
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

    return function (basePath, unifyPath) {
        unifyPath = unifyPath == null ? basePath : unifyPath;
        var unifyDir = unifyPath == null ? process.cwd() : unifyPath;
        var unify = new JsonFile(path.join(unifyDir, 'unify.json'));
        unify.loadSync();

        var typings = getTypings(basePath, unify, true);

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
            .writeln(']...');
        var allTypings = unique(getAllDependencies(lib))
            .reduce(function (agg, cur) {
                return agg.concat(getTypings(basePath, cur.unify, false));
            }, typings);
        verboseTypings(allTypings);
        return allTypings;
    };
};

function unique(arr) {
    return arr.reduce(function (agg, cur) {
        if (agg.indexOf(cur.name) > -1)
            return agg;
        return agg.concat([cur]);
    }, []);
}
