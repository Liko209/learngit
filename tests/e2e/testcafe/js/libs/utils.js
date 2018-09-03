"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var G = require("glob");
var PATH = require("path");
var WORKSPACE = PATH.dirname(require.main.filename);
function parseArgs(argsString) {
    return argsString.split(',').filter(Boolean).map(function (s) { return s.trim(); });
}
exports.parseArgs = parseArgs;
function flattenGlobs(globs) {
    return _(globs).flatMap(function (g) { return G.sync(g); }).uniq().value();
}
exports.flattenGlobs = flattenGlobs;
var ExecutionStrategiesHelper = /** @class */ (function () {
    function ExecutionStrategiesHelper(branch, action, defaultBranch, defaultAction) {
        if (defaultBranch === void 0) { defaultBranch = 'default'; }
        if (defaultAction === void 0) { defaultAction = 'on_push'; }
        this.branch = branch;
        this.action = action;
        this.defaultBranch = defaultBranch;
        this.defaultAction = defaultAction;
        this.config = ExecutionStrategiesHelper.getConfigFromJson(branch);
    }
    ExecutionStrategiesHelper.getConfigFromJson = function (branch) {
        var items = branch.split('/');
        var file = items.pop().concat('.json');
        var paths = G.sync(WORKSPACE + '/../config/'.concat(items.join('/')).concat(file));
        if (!_.isEmpty(paths)) {
            var path_1 = paths[0];
            var config_1 = require(path_1);
            return config_1;
        }
        var path = WORKSPACE + '/../config/default.json';
        var config = require(path);
        return config;
    };
    ExecutionStrategiesHelper.prototype._isValidAction = function () {
        return ExecutionStrategiesHelper.VALID_ACTIONS.indexOf(this.action) >= 0;
    };
    ExecutionStrategiesHelper.prototype._getActionOrElseDefault = function () {
        return this._isValidAction() ? this.action : this.defaultAction;
    };
    ExecutionStrategiesHelper.prototype._getAttribute = function (attributeName) {
        var path = [this._getActionOrElseDefault(), attributeName];
        return _.get(this.config, path);
    };
    Object.defineProperty(ExecutionStrategiesHelper.prototype, "fixtures", {
        get: function () {
            return this._getAttribute('fixtures');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ExecutionStrategiesHelper.prototype, "includeTags", {
        get: function () {
            return this._getAttribute('include_tags');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ExecutionStrategiesHelper.prototype, "excludeTags", {
        get: function () {
            return this._getAttribute('exclude_tags');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ExecutionStrategiesHelper.prototype, "browsers", {
        get: function () {
            return this._getAttribute('browsers');
        },
        enumerable: true,
        configurable: true
    });
    ExecutionStrategiesHelper.VALID_ACTIONS = ['on_push', 'on_merge'];
    return ExecutionStrategiesHelper;
}());
exports.ExecutionStrategiesHelper = ExecutionStrategiesHelper;
