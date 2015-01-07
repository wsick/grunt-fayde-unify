var typings = require('./typings');

module.exports = function (grunt) {
    return {
        typings: typings(grunt)
    };
};