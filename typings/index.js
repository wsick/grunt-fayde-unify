var fs = require('fs'),
    path = require('path'),
    unify = require('fayde-unify'),
    renderer = unify.renderer,
    JsonFile = unify.JsonFile,
    Library = unify.Library;

module.exports = function (grunt) {
    function getAllTypings(basePath, unifyPath) {
        var unify = new JsonFile(unifyPath);
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
            .write(']...');
        var deps = unique(getAllDependencies(lib));
        grunt.verbose.ok();
        var allTypings = deps
            .reduce(function (agg, cur) {
                return agg.concat(getTypings(basePath, cur.unify, false));
            }, typings);
        verboseTypings(allTypings);
        return allTypings;
    }

    function getTypings(basePath, unify, isSelf) {
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
        var typings = unify.getValue('typings') || [];
        if (isSelf) {
            typings = typings.concat(unify.getValue('devTypings') || []);
        }
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

    return function (basePath, unifyPath) {
        basePath = basePath || "";
        if (unifyPath == null) {
            unifyPath = basePath;
            if (!unifyPath)
                unifyPath = path.join(process.cwd(), 'unify.json');
        }
        return getAllTypings(basePath, unifyPath);
    };
};

function unique(arr) {
    return arr.reduce(function (agg, cur) {
        return (agg.some(function (check) {
            return check.name === cur.name;
        })) ? agg : agg.concat([cur]);
    }, []);
}