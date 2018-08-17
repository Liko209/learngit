"use strict";
exports.__esModule = true;
var _ = require("lodash");
var G = require("glob");
function parseArgs(argsString) {
    return argsString.split(',').filter(Boolean).map(function (s) { return s.trim(); });
}
exports.parseArgs = parseArgs;
function flattenGlobs(globs) {
    return _(globs).flatMap(function (g) { return G.sync(g); }).uniq().value();
}
exports.flattenGlobs = flattenGlobs;
