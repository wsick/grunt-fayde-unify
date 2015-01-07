# grunt-fayde-unify
Grunt tasks for fayde unify

## Usage

### `typings`

`typings(basePath, unifyPath)`
- basePath - path to resolve resulting typings (default: process.cwd())
- unifyPath - path to resolve current project `unify.json`

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
