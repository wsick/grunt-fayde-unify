# grunt-fayde-unify

This is a tool for extracting unify metadata for Grunt. For more information about unify, see [fayde unify](https://github.com/bsick7/fayde-unify).

## Usage

To use, `grunt` variable must be injected.

```
var gunify = require('grunt-fayde-unify');

module.exports = function (grunt) {
    var unify = gunify(grunt);
};
```

### typings

`typings(config)`
- config (optional)
    - basePath - path to resolve resulting typings (default: './')
    - unifyPath - path to resolve current project `unify.json` (default: './unify.json')
    - includeSelf - if true, will include typings from current library (default: true)
    - includeDevSelf - if true, will include devTypings from current library (default: true)

If a bower library has a unify.json file with `typings` defined, `unify.typings()` will extract these typings and return a path relative to `basePath`.

```
# Gruntfile.js
var gunify = require('grunt-fayde-unify');

module.exports = function (grunt) {
    var unify = gunify(grunt);
    var typings = unify.typings(); // Returns typings for all client dependencies (unify.json)
    ...
};
```
