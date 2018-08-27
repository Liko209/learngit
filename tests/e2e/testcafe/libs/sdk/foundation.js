'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _ = _interopDefault(require('lodash'));
var Dexie = _interopDefault(require('dexie'));
var axios = _interopDefault(require('axios'));
var io = _interopDefault(require('socket.io-client'));
var eventemitter2 = require('eventemitter2');
var localforage = _interopDefault(require('localforage'));

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
}

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _$$1 = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_$$1) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _$$1.label++; return { value: op[1], done: false };
                case 5: _$$1.label++; y = op[1]; op = [0]; continue;
                case 7: op = _$$1.ops.pop(); _$$1.trys.pop(); continue;
                default:
                    if (!(t = _$$1.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _$$1 = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _$$1.label = op[1]; break; }
                    if (op[0] === 6 && _$$1.label < t[1]) { _$$1.label = t[1]; t = op; break; }
                    if (t && _$$1.label < t[2]) { _$$1.label = t[2]; _$$1.ops.push(op); break; }
                    if (t[2]) _$$1.ops.pop();
                    _$$1.trys.pop(); continue;
            }
            op = body.call(thisArg, _$$1);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

(function (RegisterType) {
    RegisterType["ConstantValue"] = "ConstantValue";
    RegisterType["Constructor"] = "Constructor";
    RegisterType["DynamicValue"] = "DynamicValue";
    RegisterType["Factory"] = "Factory";
    RegisterType["Function"] = "Function";
    RegisterType["Instance"] = "Instance";
    RegisterType["Invalid"] = "Invalid";
    RegisterType["Provider"] = "Provider";
})(exports.RegisterType || (exports.RegisterType = {}));

var Container = /** @class */ (function () {
    function Container(containerConfig) {
        this._registrationMap = new Map();
        this._containerConfig = containerConfig || {};
        this.registerConstantValue({
            name: Container.name,
            value: this,
        });
    }
    Container.prototype.registerClass = function (config) {
        var registration = {
            type: exports.RegisterType.Instance,
            implementationType: config.value,
            singleton: config.singleton,
            injects: config.injects,
        };
        this._registrationMap.set(config.name, registration);
    };
    Container.prototype.registerAsyncClass = function (config) {
        var registration = {
            type: exports.RegisterType.Instance,
            asyncImplementationType: config.value,
            singleton: config.singleton,
            injects: config.injects,
            async: true,
        };
        this._registrationMap.set(config.name, registration);
    };
    Container.prototype.registerProvider = function (config) {
        var registration = {
            type: exports.RegisterType.Provider,
            provider: config.value,
            async: config.async,
            injects: config.injects,
        };
        this._registrationMap.set(config.name, registration);
    };
    Container.prototype.registerConstantValue = function (config) {
        var registration = {
            type: exports.RegisterType.ConstantValue,
            cache: config.value,
            async: config.async,
            injects: config.injects,
        };
        this._registrationMap.set(config.name, registration);
    };
    Container.prototype.get = function (name) {
        var registration = this.getRegistration(name);
        if (registration.async)
            throw new Error(name + " is async, use asyncGet() to get it.");
        var cache = this._getCache(registration);
        if (cache)
            return cache;
        var injections = this._getInjections(registration.injects);
        var result = this._resolve(registration, injections);
        this._setCache(registration, result);
        return result;
    };
    Container.prototype.asyncGet = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var registration, cache, injections, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        registration = this.getRegistration(name);
                        cache = this._getCache(registration);
                        if (cache)
                            return [2 /*return*/, cache];
                        return [4 /*yield*/, this._asyncGetInjections(registration.injects)];
                    case 1:
                        injections = _a.sent();
                        return [4 /*yield*/, this._asyncResolve(registration, injections)];
                    case 2:
                        result = _a.sent();
                        this._setCache(registration, result);
                        return [2 /*return*/, result];
                }
            });
        });
    };
    Container.prototype.isAsync = function (name) {
        return !!this.getRegistration(name).async;
    };
    Container.prototype.getRegistration = function (name) {
        var config = this._registrationMap.get(name);
        if (!config)
            throw new Error(name + " not been registered.");
        return config;
    };
    Container.prototype._getCache = function (registration) {
        var isSingleton = this._containerConfig.singleton || registration.singleton;
        if (isSingleton && registration.cache) {
            return registration.cache;
        }
    };
    Container.prototype._setCache = function (registration, result) {
        var isSingleton = this._containerConfig.singleton || registration.singleton;
        if (isSingleton) {
            registration.cache = result;
        }
    };
    Container.prototype._resolve = function (registration, injections) {
        var result = null;
        if (registration.type === exports.RegisterType.ConstantValue) {
            result = registration.cache;
        }
        else if (registration.type === exports.RegisterType.Instance && registration.implementationType) {
            result = this._resolveInstance(registration.implementationType, injections);
        }
        else if (registration.type === exports.RegisterType.Provider && registration.provider) {
            result = registration.provider();
        }
        else {
            throw new Error("Can not get " + name);
        }
        return result;
    };
    Container.prototype._asyncResolve = function (registration, injections) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                result = null;
                if (registration.type === exports.RegisterType.Instance &&
                    registration.async &&
                    registration.asyncImplementationType) {
                    result = this._asyncResolveInstance(name, registration.asyncImplementationType, injections);
                }
                else {
                    result = this._resolve(registration, injections);
                }
                return [2 /*return*/, result];
            });
        });
    };
    Container.prototype._getInjections = function (names) {
        var _this = this;
        if (!names)
            return [];
        return names.map(function (name) { return _this.get(name); });
    };
    Container.prototype._asyncGetInjections = function (names) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (!names)
                    return [2 /*return*/, []];
                return [2 /*return*/, Promise.all(names.map(function (name) { return _this.asyncGet(name); }))];
            });
        });
    };
    Container.prototype._resolveInstance = function (creator, injections) {
        var instance = null;
        var Class = creator;
        instance = new (Class.bind.apply(Class, __spread([void 0], injections)))();
        return instance;
    };
    Container.prototype._asyncResolveInstance = function (name, getModule, injections) {
        return __awaiter(this, void 0, void 0, function () {
            var module, creator;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, getModule()];
                    case 1:
                        module = _a.sent();
                        creator = module[name.toString()] || module.default;
                        return [2 /*return*/, this._resolveInstance(creator, injections)];
                }
            });
        });
    };
    return Container;
}());

var CriteriaParser = /** @class */ (function () {
    function CriteriaParser() {
        this.parallels = [];
        this.offsets = 0;
        this.limits = 0;
        this.orderBys = [];
        this.desc = false;
        this.equals = [];
        this.ranges = [];
        this.equalRangeCount = 0;
        this.notEquals = [];
        this.anyOfs = [];
        this.startsWiths = [];
        this.contains = [];
        this.filters = [];
    }
    CriteriaParser.prototype.parse = function (criterias) {
        var _this = this;
        var result = {
            offsets: 0,
            limits: 0,
            orderBys: [],
            desc: false,
            ranges: [],
            equalRangeCount: 0,
            equals: [],
            notEquals: [],
            anyOfs: [],
            contains: [],
            filters: [],
            startsWiths: [],
            parallels: [],
        };
        criterias.forEach(function (_a) {
            var name = _a.name, rest = __rest(_a, ["name"]);
            _this[name].apply(result, Object.values(rest));
        });
        return result;
    };
    CriteriaParser.prototype.or = function (query) {
        this.parallels.push(query);
    };
    CriteriaParser.prototype.offset = function (amount) {
        this.offsets = amount;
    };
    CriteriaParser.prototype.limit = function (amount) {
        this.limits = amount;
    };
    CriteriaParser.prototype.orderBy = function (key, desc) {
        if (desc === void 0) { desc = false; }
        this.orderBys.push({ key: key, desc: desc });
    };
    CriteriaParser.prototype.reverse = function () {
        this.desc = !this.desc;
    };
    CriteriaParser.prototype.equal = function (key, value, ignoreCase) {
        if (ignoreCase === void 0) { ignoreCase = false; }
        this.equals.push({
            key: key,
            value: value,
            ignoreCase: ignoreCase,
        });
    };
    CriteriaParser.prototype.notEqual = function (key, value) {
        this.notEquals.push({
            key: key,
            value: value,
        });
    };
    CriteriaParser.prototype.between = function (key, lower, upper, includeLower, includeUpper) {
        if (lower === void 0) { lower = -Infinity; }
        if (upper === void 0) { upper = Infinity; }
        if (includeLower === void 0) { includeLower = false; }
        if (includeUpper === void 0) { includeUpper = false; }
        this.ranges.push({
            key: key,
            lower: lower,
            upper: upper,
            includeLower: includeLower,
            includeUpper: includeUpper,
        });
    };
    CriteriaParser.prototype.greaterThan = function (key, value) {
        this.ranges.push({
            key: key,
            lower: value,
            upper: Infinity,
            includeLower: false,
            includeUpper: false,
        });
    };
    CriteriaParser.prototype.greaterThanOrEqual = function (key, value) {
        this.ranges.push({
            key: key,
            lower: value,
            upper: Infinity,
            includeLower: true,
            includeUpper: false,
        });
    };
    CriteriaParser.prototype.lessThan = function (key, value) {
        this.ranges.push({
            key: key,
            lower: -Infinity,
            upper: value,
            includeLower: false,
            includeUpper: false,
        });
    };
    CriteriaParser.prototype.lessThanOrEqual = function (key, value) {
        this.ranges.push({
            key: key,
            lower: -Infinity,
            upper: value,
            includeLower: false,
            includeUpper: true,
        });
    };
    CriteriaParser.prototype.anyOf = function (key, array, ignoreCase) {
        if (ignoreCase === void 0) { ignoreCase = false; }
        this.anyOfs.push({
            key: key,
            array: array,
            ignoreCase: ignoreCase,
        });
    };
    CriteriaParser.prototype.startsWith = function (key, value, ignoreCase) {
        if (ignoreCase === void 0) { ignoreCase = false; }
        this.startsWiths.push({
            key: key,
            value: value,
            ignoreCase: ignoreCase,
        });
    };
    CriteriaParser.prototype.contain = function (key, value) {
        this.contains.push({
            key: key,
            value: value,
        });
    };
    CriteriaParser.prototype.filter = function (func) {
        this.filters.push(func);
    };
    return CriteriaParser;
}());

var isIEOrEdge = typeof navigator !== 'undefined' &&
    /(MSIE|Trident|Edge)/.test(navigator.userAgent);
var equalIgnoreCase = function (a, b) {
    return a.toLowerCase() === b.toLowerCase();
};
var includesIgnoreCase = function (arr, a) {
    return arr.some(function (val) { return equalIgnoreCase(val, a); });
};
var startsWithIgnoreCase = function (val, a) {
    return val.toLowerCase().indexOf(a.toLowerCase()) === 0;
};
var CollectionWhereClause = /** @class */ (function () {
    function CollectionWhereClause(coll, key) {
        this.coll = coll;
        this.key = key;
    }
    CollectionWhereClause.prototype.anyOf = function (arr) {
        var _this = this;
        return this.coll.filter(function (item) { return arr.includes(item[_this.key]); });
    };
    CollectionWhereClause.prototype.anyOfIgnoreCase = function (arr) {
        var _this = this;
        return this.coll.filter(function (item) { return includesIgnoreCase(arr, item[_this.key]); });
    };
    CollectionWhereClause.prototype.equals = function (val) {
        var _this = this;
        return this.coll.filter(function (item) { return val === item[_this.key]; });
    };
    CollectionWhereClause.prototype.equalsIgnoreCase = function (val) {
        var _this = this;
        return this.coll.filter(function (item) {
            return equalIgnoreCase(item[_this.key], val);
        });
    };
    CollectionWhereClause.prototype.notEqual = function (val) {
        var _this = this;
        return this.coll.filter(function (item) { return val !== item[_this.key]; });
    };
    CollectionWhereClause.prototype.startsWith = function (val) {
        var _this = this;
        return this.coll.filter(function (item) { return item[_this.key].indexOf(val) === 0; });
    };
    CollectionWhereClause.prototype.startsWithIgnoreCase = function (val) {
        var _this = this;
        return this.coll.filter(function (item) {
            return startsWithIgnoreCase(item[_this.key], val);
        });
    };
    CollectionWhereClause.prototype.between = function (lower, upper, includeLower, includeUpper) {
        var key = this.key;
        return this.coll.filter(function (item) {
            return !!((lower < item[key] && item[key] < upper) ||
                (includeLower && lower === item[key]) ||
                (includeUpper && upper === item[key]));
        });
    };
    CollectionWhereClause.prototype.contains = function (val) {
        var _this = this;
        return this.coll.filter(function (item) {
            return Array.isArray(item[_this.key]) && item[_this.key].indexOf(val) >= 0;
        });
    };
    return CollectionWhereClause;
}());
var collectionWhere = function (coll, key) {
    return new CollectionWhereClause(coll, key);
};

var execQuery = function (table, query) {
    if (query === void 0) { query = { criteria: [], parallel: [] }; }
    if (query.criteria.length === 0) {
        return [table.toCollection()];
    }
    var coll;
    var _a = new CriteriaParser().parse(query.criteria), offsets = _a.offsets, limits = _a.limits, orderBys = _a.orderBys, ranges = _a.ranges, equals = _a.equals, notEquals = _a.notEquals, anyOfs = _a.anyOfs, contains = _a.contains, filters = _a.filters, startsWiths = _a.startsWiths, desc = _a.desc;
    // TODO multi orderBy
    var orderBy = orderBys[0];
    if (orderBy) {
        coll = table.orderBy(orderBy.key);
        if (orderBy.desc) {
            coll.reverse();
        }
    }
    var where = function (key) {
        return (coll ? collectionWhere(coll, key) : table.where(key));
    };
    anyOfs.forEach(function (_a) {
        var key = _a.key, array = _a.array, ignoreCase = _a.ignoreCase;
        coll = ignoreCase
            ? where(key).anyOfIgnoreCase(array)
            : where(key).anyOf(array);
    });
    equals.forEach(function (_a) {
        var key = _a.key, value = _a.value, ignoreCase = _a.ignoreCase;
        if (typeof value === 'boolean') {
            // Indexeddb don't support use booleans as keys,
            // so we force to use collection to do the query.
            // see: https://github.com/dfahlander/Dexie.js/issues/70#issuecomment-77814592
            coll = coll || table.toCollection();
        }
        coll = ignoreCase
            ? where(key).equalsIgnoreCase(value)
            : where(key).equals(value);
    });
    ranges.forEach(function (_a) {
        var key = _a.key, upper = _a.upper, lower = _a.lower, includeLower = _a.includeLower, includeUpper = _a.includeUpper;
        coll = where(key).between(lower, upper, includeLower, includeUpper);
    });
    notEquals.forEach(function (_a) {
        var key = _a.key, value = _a.value;
        coll = where(key).notEqual(value);
    });
    startsWiths.forEach(function (_a) {
        var key = _a.key, value = _a.value, ignoreCase = _a.ignoreCase;
        coll = ignoreCase
            ? where(key).startsWithIgnoreCase(value)
            : where(key).startsWith(value);
    });
    contains.forEach(function (_a) {
        var key = _a.key, value = _a.value;
        coll = where(key)
            .equals(value)
            .distinct();
    });
    filters.forEach(function (func, i) {
        if (coll) {
            coll = coll.filter(func);
        }
        else {
            coll = table.filter(func);
        }
    });
    if (coll === undefined) {
        coll = table.toCollection();
    }
    if (desc) {
        coll = coll.reverse();
    }
    if (offsets) {
        coll = coll.offset(offsets);
    }
    if (limits) {
        coll = coll.limit(limits);
    }
    var collections = [];
    if (coll) {
        collections.push(coll);
    }
    // parallel
    var parallel = query.parallel || [];
    if (parallel.length > 0) {
        var additions = parallel.map(function (query) { return execQuery(table, query)[0]; });
        collections.push.apply(collections, __spread(additions));
    }
    return collections;
};

var DexieCollection = /** @class */ (function () {
    function DexieCollection(dexie, name) {
        this.table = dexie.table(name);
        this.collection = this.table.toCollection();
    }
    DexieCollection.prototype.getCollection = function () {
        return this.collection;
    };
    DexieCollection.prototype.getTable = function () {
        return this.table;
    };
    DexieCollection.prototype.primaryKeyName = function () {
        return this.table.schema.primKey.keyPath || '';
    };
    DexieCollection.prototype.put = function (item) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.table.put(item)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DexieCollection.prototype.bulkPut = function (array) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.table.bulkPut(array)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DexieCollection.prototype.get = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.table.get(key)];
                    case 1:
                        result = _a.sent();
                        if (result) {
                            return [2 /*return*/, result];
                        }
                        return [2 /*return*/, null];
                }
            });
        });
    };
    DexieCollection.prototype.delete = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.table.delete(key)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DexieCollection.prototype.bulkDelete = function (array) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.table.bulkDelete(array)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DexieCollection.prototype.update = function (key, changes) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.table.update(key, changes)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DexieCollection.prototype.clear = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.table.clear()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DexieCollection.prototype.getAll = function (query, queryOption) {
        if (queryOption === void 0) { queryOption = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var cols, sortBy, desc, compute, col_1, result_1, sorted_1, result_2, sorted, result, ids, primaryKey;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cols = execQuery(this.table, query);
                        sortBy = queryOption.sortBy, desc = queryOption.desc;
                        if (cols.length === 0) {
                            // empty
                            return [2 /*return*/, []];
                        }
                        if (!(cols.length === 1)) return [3 /*break*/, 5];
                        compute = function () { return __awaiter(_this, void 0, void 0, function () {
                            var result;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        result = [];
                                        return [4 /*yield*/, col_1.each(function (item) {
                                                result.push(item);
                                            })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/, result];
                                }
                            });
                        }); };
                        col_1 = cols[0];
                        if (!sortBy) return [3 /*break*/, 4];
                        if (!(typeof sortBy === 'function')) return [3 /*break*/, 2];
                        return [4 /*yield*/, compute()];
                    case 1:
                        result_1 = _a.sent();
                        sorted_1 = result_1.sort(sortBy);
                        return [2 /*return*/, desc ? sorted_1.reverse() : sorted_1];
                    case 2:
                        col_1 = desc ? col_1.reverse() : col_1;
                        return [4 /*yield*/, compute()];
                    case 3:
                        result_2 = _a.sent();
                        sorted = result_2.sort(function (a, b) {
                            if (a[sortBy] < b[sortBy]) {
                                return -1;
                            }
                            if (a[sortBy] > b[sortBy]) {
                                return 1;
                            }
                            return 0;
                        });
                        return [2 /*return*/, desc ? sorted.reverse() : sorted];
                    case 4:
                        if (desc) {
                            col_1 = col_1.reverse();
                        }
                        return [2 /*return*/, compute()];
                    case 5:
                        result = [];
                        ids = {};
                        primaryKey = this.primaryKeyName();
                        return [4 /*yield*/, Promise.all(cols.map(function (c) {
                                return c.each(function (item) {
                                    if (!ids[item[primaryKey]]) {
                                        ids[item[primaryKey]] = true;
                                        result.push(item);
                                    }
                                });
                            }))];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    DexieCollection.prototype.count = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var cols, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        cols = execQuery(this.table, query);
                        if (cols.length === 1) {
                            return [2 /*return*/, cols[0].count()];
                        }
                        _b = (_a = _).sum;
                        return [4 /*yield*/, Promise.all(cols.map(function (col) { return col.count(); }))];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    DexieCollection.prototype.first = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAll(query)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DexieCollection.prototype.last = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAll(query)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[result.length - 1]];
                }
            });
        });
    };
    return DexieCollection;
}());

var DexieDB = /** @class */ (function () {
    function DexieDB(schema) {
        var name = schema.name;
        this.db = new Dexie(name);
        this._initSchema(schema);
    }
    DexieDB.prototype.ensureDBOpened = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.db.isOpen()) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.db.open()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    DexieDB.prototype.open = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureDBOpened()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DexieDB.prototype.isOpen = function () {
        return this.db.isOpen();
    };
    DexieDB.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isOpen()) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.db.close()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    DexieDB.prototype.delete = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.delete()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DexieDB.prototype.getCollection = function (name) {
        return new DexieCollection(this.db, name);
    };
    DexieDB.prototype.getTransaction = function (mode, collections, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var tables;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(mode && collections && Array.isArray(collections))) return [3 /*break*/, 2];
                        tables = collections.map(function (c) {
                            return c.getTable();
                        });
                        return [4 /*yield*/, this.db.transaction(mode, tables, callback)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        callback();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DexieDB.prototype._initSchema = function (schema) {
        var _this = this;
        var versions = schema.schema;
        Object.keys(versions).forEach(function (version) {
            var sch = versions[version];
            var dexieSchema = {};
            var callbacks = {};
            Object.keys(sch).forEach(function (tb) {
                var _a = sch[tb], unique = _a.unique, _b = _a.indices, indices = _b === void 0 ? [] : _b, onUpgrade = _a.onUpgrade;
                var def = "" + unique + (indices.length ? ", " + indices.join(', ') : '');
                dexieSchema[tb] = def;
                if (onUpgrade) {
                    callbacks[tb] = onUpgrade;
                }
            });
            var v = _this.db.version(Number(version)).stores(dexieSchema);
            if (Object.keys(callbacks).length) {
                v.upgrade(function (tx) {
                    return Promise.all(Object.entries(callbacks).map(function (_a) {
                        var _b = __read(_a, 2), tb = _b[0], onUpgrade = _b[1];
                        return tx
                            .table(tb)
                            .toCollection()
                            .modify(function (item) { return onUpgrade(item); });
                    }));
                });
            }
        });
    };
    return DexieDB;
}());

var KVStorage = /** @class */ (function () {
    function KVStorage(storage) {
        this.storage = storage;
    }
    KVStorage.prototype.get = function (key) {
        var value = this.storage.getItem(String(key));
        if (value) {
            return this.deserialize(value);
        }
        return null;
    };
    KVStorage.prototype.put = function (key, value) {
        var serialized = this.serialize(value);
        if (serialized === undefined)
            return;
        this.storage.setItem(String(key), serialized);
    };
    KVStorage.prototype.remove = function (key) {
        this.storage.removeItem(String(key));
    };
    KVStorage.prototype.clear = function () {
        this.storage.clear();
    };
    KVStorage.prototype.serialize = function (value) {
        return JSON.stringify(value);
    };
    KVStorage.prototype.deserialize = function (value) {
        try {
            return JSON.parse(value);
        }
        catch (err) {
            return value;
        }
    };
    return KVStorage;
}());

/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-05-30 18:31:06
 * Copyright © RingCentral. All rights reserved.
 */
// In-memory implementation for when localStorage/sessionStorage is not supported, for example
// in Safari private mode, and when Content Settings prevents from setting any data in Chrome
function storageFactory(storage) {
    var inMemoryStorage = {};
    // let length: number = 0;
    function isSupported() {
        try {
            var randomKey = '__some_random_key_you_are_not_going_to_use__';
            storage.setItem(randomKey, randomKey);
            storage.removeItem(randomKey);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    return {
        // get length(): number {
        //   if (isSupported()) {
        //     return storage.length;
        //   }
        //   return length;
        // },
        getItem: function (key) {
            if (isSupported()) {
                return storage.getItem(key);
            }
            return inMemoryStorage[key] || null;
        },
        setItem: function (key, value) {
            if (isSupported()) {
                storage.setItem(key, value);
            }
            else {
                inMemoryStorage[key] = "" + value;
                // length += 1;
            }
        },
        removeItem: function (key) {
            if (isSupported()) {
                storage.removeItem(key);
            }
            else {
                delete inMemoryStorage[key];
                // length -= 1;
            }
        },
        clear: function () {
            if (isSupported()) {
                storage.clear();
            }
            else {
                inMemoryStorage = {};
                // length = 0;
            }
        },
    };
}

/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-05-31 13:46:02
 * Copyright © RingCentral. All rights reserved.
 */

/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-05-31 13:45:27
 * Copyright © RingCentral. All rights reserved.
 */

(function (DatabaseType) {
    DatabaseType["DexieDB"] = "dexie";
    DatabaseType["LokiDB"] = "loki";
})(exports.DatabaseType || (exports.DatabaseType = {}));

var DBManager = /** @class */ (function () {
    function DBManager() {
    }
    DBManager.prototype.initDatabase = function (schema, type) {
        this.db = new DexieDB(schema);
    };
    DBManager.prototype.openDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.open()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DBManager.prototype.closeDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.close()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DBManager.prototype.deleteDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.delete()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DBManager.prototype.isDatabaseOpen = function () {
        return this.db && this.db.isOpen();
    };
    DBManager.prototype.getDatabase = function () {
        return this.db;
    };
    return DBManager;
}());

/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-27 23:31:46
 * Copyright © RingCentral. All rights reserved.
 */
var KVStorageManager = /** @class */ (function () {
    function KVStorageManager() {
        this.kvStorage = new KVStorage(storageFactory(window.localStorage));
    }
    KVStorageManager.prototype.clear = function () {
        this.kvStorage.clear();
    };
    KVStorageManager.prototype.getStorage = function () {
        return this.kvStorage;
    };
    return KVStorageManager;
}());

/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-05-31 13:45:31
 * Copyright © RingCentral. All rights reserved.
 */

/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-05-16 14:22:56
 * Copyright © RingCentral. All rights reserved.
 */

(function (HTTP_STATUS_CODE) {
    HTTP_STATUS_CODE[HTTP_STATUS_CODE["DEFAULT"] = 0] = "DEFAULT";
    HTTP_STATUS_CODE[HTTP_STATUS_CODE["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    HTTP_STATUS_CODE[HTTP_STATUS_CODE["FORBIDDEN"] = 403] = "FORBIDDEN";
    HTTP_STATUS_CODE[HTTP_STATUS_CODE["BAD_GATEWAY"] = 502] = "BAD_GATEWAY";
    HTTP_STATUS_CODE[HTTP_STATUS_CODE["SERVICE_UNAVAILABLE"] = 503] = "SERVICE_UNAVAILABLE";
})(exports.HTTP_STATUS_CODE || (exports.HTTP_STATUS_CODE = {}));

(function (NETWORK_METHOD) {
    NETWORK_METHOD["GET"] = "get";
    NETWORK_METHOD["DELETE"] = "delete";
    NETWORK_METHOD["HEAD"] = "head";
    NETWORK_METHOD["OPTIONS"] = "options";
    NETWORK_METHOD["POST"] = "post";
    NETWORK_METHOD["PUT"] = "put";
    NETWORK_METHOD["PATCH"] = "patch";
})(exports.NETWORK_METHOD || (exports.NETWORK_METHOD = {}));

(function (REQUEST_PRIORITY) {
    REQUEST_PRIORITY[REQUEST_PRIORITY["SPECIFIC"] = 0] = "SPECIFIC";
    REQUEST_PRIORITY[REQUEST_PRIORITY["HIGH"] = 1] = "HIGH";
    REQUEST_PRIORITY[REQUEST_PRIORITY["NORMAL"] = 2] = "NORMAL";
    REQUEST_PRIORITY[REQUEST_PRIORITY["LOW"] = 3] = "LOW";
})(exports.REQUEST_PRIORITY || (exports.REQUEST_PRIORITY = {}));

(function (NETWORK_VIA) {
    NETWORK_VIA[NETWORK_VIA["HTTP"] = 0] = "HTTP";
    NETWORK_VIA[NETWORK_VIA["SOCKET"] = 1] = "SOCKET";
    NETWORK_VIA[NETWORK_VIA["ALL"] = 2] = "ALL";
})(exports.NETWORK_VIA || (exports.NETWORK_VIA = {}));

(function (CONSUMER_MAX_QUEUE_COUNT) {
    CONSUMER_MAX_QUEUE_COUNT[CONSUMER_MAX_QUEUE_COUNT["HTTP"] = 5] = "HTTP";
    CONSUMER_MAX_QUEUE_COUNT[CONSUMER_MAX_QUEUE_COUNT["SOCKET"] = 5] = "SOCKET";
})(exports.CONSUMER_MAX_QUEUE_COUNT || (exports.CONSUMER_MAX_QUEUE_COUNT = {}));

(function (REQUEST_WEIGHT) {
    REQUEST_WEIGHT[REQUEST_WEIGHT["HIGH"] = 20] = "HIGH";
    REQUEST_WEIGHT[REQUEST_WEIGHT["NORMAL"] = 10] = "NORMAL";
})(exports.REQUEST_WEIGHT || (exports.REQUEST_WEIGHT = {}));

(function (NETWORK_FAIL_TYPE) {
    NETWORK_FAIL_TYPE["CANCELLED"] = "CANCELLED";
    NETWORK_FAIL_TYPE["SERVER_ERROR"] = "SERVER ERROR";
    NETWORK_FAIL_TYPE["TIME_OUT"] = "TIME OUT";
    NETWORK_FAIL_TYPE["NOT_NETWORK_CONNECTION"] = "NOT NETWORK CONNECTION";
    NETWORK_FAIL_TYPE["UNAUTHORIZED"] = "UNAUTHORIZED";
    NETWORK_FAIL_TYPE["BAD_REQUEST"] = "BAD REQUEST";
})(exports.NETWORK_FAIL_TYPE || (exports.NETWORK_FAIL_TYPE = {}));

(function (SURVIVAL_MODE) {
    SURVIVAL_MODE["NORMAL"] = "normal";
    SURVIVAL_MODE["SURVIVAL"] = "survival";
    SURVIVAL_MODE["OFFLINE"] = "offline";
})(exports.SURVIVAL_MODE || (exports.SURVIVAL_MODE = {}));

(function (NETWORK_REQUEST_EXECUTOR_STATUS) {
    NETWORK_REQUEST_EXECUTOR_STATUS["IDLE"] = "idle";
    NETWORK_REQUEST_EXECUTOR_STATUS["EXECUTING"] = "executing";
    NETWORK_REQUEST_EXECUTOR_STATUS["PAUSE"] = "pause";
    NETWORK_REQUEST_EXECUTOR_STATUS["COMPLETION"] = "completion";
})(exports.NETWORK_REQUEST_EXECUTOR_STATUS || (exports.NETWORK_REQUEST_EXECUTOR_STATUS = {}));

var BaseClient = /** @class */ (function () {
    function BaseClient() {
        this.tasks = new Map();
    }
    BaseClient.prototype.request = function (request, listener) {
        this.tasks[request.id] = request;
    };
    BaseClient.prototype.cancelRequest = function (request) {
        this.tasks.delete(request.id);
    };
    BaseClient.prototype.isNetworkReachable = function () {
        return true;
    };
    return BaseClient;
}());

/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-05-15 15:34:20
 * Copyright © RingCentral. All rights reserved.
 */
var BaseResponse = /** @class */ (function () {
    function BaseResponse(data, status, statusText, headers, retryAfter, request) {
        this.data = data;
        this.status = status;
        this.statusText = statusText;
        this.headers = headers;
        this.retryAfter = retryAfter;
        this.data = data;
        this.status = status;
        this.statusText = statusText;
        this.headers = headers;
        this.retryAfter = retryAfter;
        this.request = request;
    }
    return BaseResponse;
}());

var NetworkResponseBuilder = /** @class */ (function () {
    function NetworkResponseBuilder() {
        this.data = {};
        this.statusText = '';
        this.headers = {};
        this.retryAfter = 6000;
    }
    /**
     * Setter retryAfter
     * @param {number} value
     */
    NetworkResponseBuilder.prototype.setRetryAfter = function (value) {
        this.retryAfter = value;
        return this;
    };
    /**
     * Setter data
     * @param {object } value
     */
    NetworkResponseBuilder.prototype.setData = function (value) {
        this.data = value;
        return this;
    };
    /**
     * Setter status
     * @param {HTTP_STATUS_CODE} value
     */
    NetworkResponseBuilder.prototype.setStatus = function (value) {
        this.status = value;
        return this;
    };
    /**
     * Setter statusText
     * @param {string} value
     */
    NetworkResponseBuilder.prototype.setStatusText = function (value) {
        this.statusText = value;
        return this;
    };
    /**
     * Setter headers
     * @param {object } value
     */
    NetworkResponseBuilder.prototype.setHeaders = function (value) {
        this.headers = value;
        return this;
    };
    /**
     * Setter request
     * @param {Request} value
     */
    NetworkResponseBuilder.prototype.setRequest = function (value) {
        this.request = value;
        return this;
    };
    return NetworkResponseBuilder;
}());

var HttpResponseBuilder = /** @class */ (function (_super) {
    __extends(HttpResponseBuilder, _super);
    function HttpResponseBuilder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HttpResponseBuilder.prototype.build = function () {
        return new HttpResponse(this);
    };
    return HttpResponseBuilder;
}(NetworkResponseBuilder));

var HttpResponse = /** @class */ (function (_super) {
    __extends(HttpResponse, _super);
    function HttpResponse(builder) {
        return _super.call(this, builder.data, builder.status, builder.statusText, builder.headers, builder.retryAfter, builder.request) || this;
    }
    Object.defineProperty(HttpResponse, "builder", {
        get: function () {
            return new HttpResponseBuilder();
        },
        enumerable: true,
        configurable: true
    });
    return HttpResponse;
}(BaseResponse));

var Http = /** @class */ (function (_super) {
    __extends(Http, _super);
    function Http() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Http.prototype.request = function (request, listener) {
        var _this = this;
        _super.prototype.request.call(this, request, listener);
        this.tasks[request.id] = request;
        var CancelToken = axios.CancelToken;
        var method = request.method, headers = request.headers, host = request.host, path = request.path, timeout = request.timeout, _a = request.requestConfig, requestConfig = _a === void 0 ? {} : _a;
        var options = {
            method: method,
            headers: headers,
            timeout: timeout,
            baseURL: host,
            url: path,
            withCredentials: true,
            data: {},
            params: {},
            cancelToken: new CancelToken(function (cancel) {
                _this.tasks[request.id].cancel = cancel;
            }),
        };
        if (request.data) {
            options.data = request.data;
        }
        if (request.params) {
            options.params = request.params;
        }
        if (Object.keys(requestConfig).length) {
            Object.assign(options, requestConfig);
        }
        axios(options)
            .then(function (res) {
            delete _this.tasks[request.id];
            var data = res.data, status = res.status, statusText = res.statusText;
            var response = HttpResponse.builder
                .setData(data)
                .setStatus(status)
                .setStatusText(statusText)
                .setRequest(request)
                .setHeaders(res.headers)
                .build();
            listener.onSuccess(response);
        })
            .catch(function (err) {
            delete _this.tasks[request.id];
            var _a = err.response, response = _a === void 0 ? {} : _a, code = err.code, message = err.message;
            var data = response.data;
            var status = response.status, statusText = response.statusText;
            if (code === exports.NETWORK_FAIL_TYPE.TIME_OUT) {
                status = 0;
                statusText = exports.NETWORK_FAIL_TYPE.TIME_OUT;
            }
            if (code === exports.NETWORK_FAIL_TYPE.CANCELLED) {
                status = 0;
                statusText = exports.NETWORK_FAIL_TYPE.CANCELLED;
            }
            var res = HttpResponse.builder
                .setData(data)
                .setStatus(status)
                .setStatusText(statusText || message)
                .setHeaders(response.headers)
                .setRequest(request)
                .build();
            listener.onFailure(res);
        });
    };
    return Http;
}(BaseClient));

var BaseRequest = /** @class */ (function () {
    function BaseRequest(id, path, method, data, headers, params) {
        this.id = id;
        this.path = path;
        this.method = method;
        this.data = data;
        this.headers = headers;
        this.params = params;
        this.id = id;
        this.path = path;
        this.method = method;
        this.data = data;
        this.headers = headers;
        this.params = params;
    }
    BaseRequest.prototype.needAuth = function () {
        throw new Error('Method not implemented.');
    };
    return BaseRequest;
}());

var HttpRequest = /** @class */ (function (_super) {
    __extends(HttpRequest, _super);
    function HttpRequest(builder) {
        var _this = _super.call(this, builder.id, builder.path, builder.method, builder.data, builder.headers, builder.params) || this;
        _this.authFree = builder.authFree;
        _this.host = builder.host;
        _this.handlerType = builder.handlerType;
        _this.requestConfig = builder.requestConfig;
        _this.timeout = builder.timeout;
        _this.retryCount = builder.retryCount;
        _this.priority = builder.priority;
        _this.via = builder.via;
        return _this;
    }
    HttpRequest.prototype.needAuth = function () {
        return !this.authFree;
    };
    return HttpRequest;
}(BaseRequest));

/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:44:01
 * Copyright © RingCentral. All rights reserved.
 */

/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:43:37
 * Copyright © RingCentral. All rights reserved.
 */

var SocketResponse = /** @class */ (function (_super) {
    __extends(SocketResponse, _super);
    function SocketResponse() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SocketResponse;
}(HttpResponse));

var SocketResponseBuilder = /** @class */ (function (_super) {
    __extends(SocketResponseBuilder, _super);
    function SocketResponseBuilder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SocketResponseBuilder.prototype.options = function (options) {
        if (options) {
            this.data = options.body || {};
            this.headers = _.pick(options, [
                'Content-Type',
                'X-Frame-Options',
                'X-Request-Id',
            ]);
            this.status = 200;
            if (options.request) {
                this.request = __assign({}, options.request, { params: options.request.parameters });
            }
        }
        return this;
    };
    SocketResponseBuilder.prototype.build = function () {
        return new SocketResponse(this);
    };
    return SocketResponseBuilder;
}(NetworkResponseBuilder));

var LoggingEvent = /** @class */ (function () {
    function LoggingEvent(level, message, logger) {
        this._startTime = new Date();
        this._message = message;
        this._level = level;
        this._logger = logger;
    }
    LoggingEvent.prototype.getFormattedTimestamp = function () {
        if (this._logger) {
            return this._logger.getFormattedTimestamp(this._startTime);
        }
        return this._startTime.toISOString();
    };
    LoggingEvent.prototype.getLevel = function () {
        return this._level;
    };
    LoggingEvent.prototype.getMessage = function () {
        return this._message;
    };
    LoggingEvent.prototype.getStartTimestamp = function () {
        return this._startTime.getTime();
    };
    return LoggingEvent;
}());

var _a;

(function (LOG_LEVEL) {
    LOG_LEVEL[LOG_LEVEL["OFF"] = Number.MAX_VALUE] = "OFF";
    LOG_LEVEL[LOG_LEVEL["FATAL"] = 50000] = "FATAL";
    LOG_LEVEL[LOG_LEVEL["ERROR"] = 40000] = "ERROR";
    LOG_LEVEL[LOG_LEVEL["WARN"] = 30000] = "WARN";
    LOG_LEVEL[LOG_LEVEL["INFO"] = 20000] = "INFO";
    LOG_LEVEL[LOG_LEVEL["DEBUG"] = 10000] = "DEBUG";
    LOG_LEVEL[LOG_LEVEL["TRACE"] = 5000] = "TRACE";
    LOG_LEVEL[LOG_LEVEL["ALL"] = Number.MIN_VALUE] = "ALL";
})(exports.LOG_LEVEL || (exports.LOG_LEVEL = {}));
var LOG_LEVEL_STRING = (_a = {},
    _a[exports.LOG_LEVEL.FATAL] = 'FATAL',
    _a[exports.LOG_LEVEL.ERROR] = 'ERROR',
    _a[exports.LOG_LEVEL.WARN] = 'WARN',
    _a[exports.LOG_LEVEL.INFO] = 'INFO',
    _a[exports.LOG_LEVEL.DEBUG] = 'DEBUG',
    _a[exports.LOG_LEVEL.TRACE] = 'TRACE',
    _a);
var DATE_FORMATTER;
(function (DATE_FORMATTER) {
    DATE_FORMATTER["DEFAULT_DATE_FORMAT"] = "yyyy-MM-ddThh:mm:ssO";
})(DATE_FORMATTER || (DATE_FORMATTER = {}));
var LINE_SEP = '\n';

var AppenderAbstract = /** @class */ (function () {
    function AppenderAbstract() {
    }
    AppenderAbstract.prototype.setLogger = function (logger) {
        this.logger = logger;
    };
    AppenderAbstract.prototype.clear = function () {
        this.doClear();
    };
    AppenderAbstract.prototype.log = function (loggingEvent) {
        this.doLog(loggingEvent);
    };
    return AppenderAbstract;
}());

var emitter = new eventemitter2.EventEmitter2();

var PersistentLogAppender = /** @class */ (function (_super) {
    __extends(PersistentLogAppender, _super);
    function PersistentLogAppender() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.LOG_SYNC_WEIGHT = 100;
        _this._loggingEvents = [];
        _this._logSize = 0;
        _this.LOG_SYNC_LENGTH = 256 * 1024;
        return _this;
    }
    PersistentLogAppender.prototype.doLog = function (loggingEvent) {
        this._loggingEvents.push(loggingEvent);
        this._logSize = this._logSize + loggingEvent.getMessage().length;
        if (this._logSize > this.LOG_SYNC_LENGTH ||
            this._loggingEvents.length > this.LOG_SYNC_WEIGHT) {
            emitter.emitAsync('doAppend', true);
            this._logSize = 0;
        }
    };
    PersistentLogAppender.prototype.doAppend = function () {
        return __awaiter(this, void 0, void 0, function () {
            var logs, firstKey, lastKey, key, category, store;
            return __generator(this, function (_a) {
                if (!this._loggingEvents.length) {
                    return [2 /*return*/];
                }
                logs = this._loggingEvents.map(this.format.bind(this));
                firstKey = this._loggingEvents[0].getStartTimestamp();
                lastKey = this._loggingEvents[this._loggingEvents.length - 1].getStartTimestamp();
                key = firstKey + " - " + lastKey;
                this._loggingEvents = [];
                category = this.logger.getCategory();
                store = this._getStore(category);
                store.setItem(key, logs);
                return [2 /*return*/];
            });
        });
    };
    PersistentLogAppender.prototype.doClear = function () {
        return __awaiter(this, void 0, void 0, function () {
            var category;
            return __generator(this, function (_a) {
                if (this._getedKeyName) {
                    this.doRemove(this._getedKeyName);
                    return [2 /*return*/];
                }
                category = this.logger.getCategory();
                return [2 /*return*/, this._getStore(category).clear()];
            });
        });
    };
    PersistentLogAppender.prototype.doRemove = function (keys) {
        return __awaiter(this, void 0, void 0, function () {
            var category, store, storeHandlers;
            return __generator(this, function (_a) {
                category = this.logger.getCategory();
                store = this._getStore(category);
                storeHandlers = [];
                if (Array.isArray(keys)) {
                    keys.forEach(function (key) {
                        storeHandlers.push(store.removeItem(key));
                    });
                }
                else {
                    storeHandlers.push(store.removeItem(keys));
                }
                return [2 /*return*/, Promise.all(storeHandlers)];
            });
        });
    };
    PersistentLogAppender.prototype.format = function (loggingEvent) {
        var level = loggingEvent.getLevel();
        var message = loggingEvent.getMessage();
        var category = this.logger.getCategory();
        var levelStr = LOG_LEVEL_STRING[level];
        var formattedTimestamp = loggingEvent.getFormattedTimestamp();
        return category + " [" + formattedTimestamp + "] [" + levelStr + "]: " + message;
    };
    PersistentLogAppender.prototype.getLogs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var category, store, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        category = this.logger.getCategory();
                        store = this._getStore(category);
                        _a = this;
                        return [4 /*yield*/, store.key(0)];
                    case 1:
                        _a._getedKeyName = _b.sent();
                        return [2 /*return*/, store.getItem(this._getedKeyName)];
                }
            });
        });
    };
    PersistentLogAppender.prototype._getStore = function (name) {
        return localforage.createInstance({
            name: name,
            storeName: 'log',
        });
    };
    return PersistentLogAppender;
}(AppenderAbstract));

var Logger = /** @class */ (function () {
    function Logger(name) {
        this._appenders = new Map();
        this._level = exports.LOG_LEVEL.FATAL;
        this._dateFormat = DATE_FORMATTER.DEFAULT_DATE_FORMAT;
        this._category = name;
    }
    Logger.prototype.addAppender = function (name, appender) {
        appender.setLogger(this);
        this._appenders.set(name, appender);
    };
    Logger.prototype.removeAppender = function (name) {
        this._appenders.delete(name);
    };
    Logger.prototype.setAppenders = function (appenders) {
        var _this = this;
        this.clear();
        this._appenders = appenders;
        this._appenders.forEach(function (appender) {
            appender.setLogger(_this);
        });
    };
    Logger.prototype.getAppenders = function () {
        return this._appenders;
    };
    Logger.prototype.setLevel = function (level) {
        this._level = level;
    };
    Logger.prototype.clear = function () {
        this._appenders.forEach(function (appender) {
            appender.clear();
        });
    };
    Logger.prototype.trace = function (message) {
        this.log(exports.LOG_LEVEL.TRACE, message);
    };
    Logger.prototype.debug = function (message) {
        this.log(exports.LOG_LEVEL.DEBUG, message);
    };
    Logger.prototype.info = function (message) {
        this.log(exports.LOG_LEVEL.INFO, message);
    };
    Logger.prototype.warn = function (message) {
        this.log(exports.LOG_LEVEL.WARN, message);
    };
    Logger.prototype.error = function (message) {
        this.log(exports.LOG_LEVEL.ERROR, message);
    };
    Logger.prototype.fatal = function (message) {
        this.log(exports.LOG_LEVEL.FATAL, message);
    };
    /**
     * Set the date format of logger. Following switches are supported:
     * <ul>
     * <li>yyyy - The year</li>
     * <li>MM - the month</li>
     * <li>dd - the day of month<li>
     * <li>hh - the hour<li>
     * <li>mm - minutes</li>
     * <li>O - timezone offset</li>
     * </ul>
     * @param {String} format format String for the date
     * @see {@getTimestamp}
     */
    Logger.prototype.setDateFormat = function (format) {
        this._dateFormat = format;
    };
    Logger.prototype.setDateFormatter = function (dateformatter) {
        this._dateFormatter = dateformatter;
    };
    Logger.prototype.getFormattedTimestamp = function (date) {
        return this._dateFormatter.formatDate(date, this._dateFormat);
    };
    Logger.prototype.getCategory = function () {
        return this._category;
    };
    Logger.prototype.canDoLog = function (logLevel) {
        if (this._level <= logLevel) {
            return true;
        }
        return false;
    };
    Logger.prototype.log = function (logLevel, message) {
        if (this.canDoLog(logLevel)) {
            this._dolog(logLevel, message);
        }
    };
    Logger.prototype.doAppend = function () {
        return __awaiter(this, void 0, void 0, function () {
            var doAppends;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        doAppends = [];
                        this._appenders.forEach(function (appender) {
                            if (appender instanceof PersistentLogAppender) {
                                doAppends.push(appender.doAppend());
                            }
                        });
                        return [4 /*yield*/, Promise.all(doAppends)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Logger.prototype._dolog = function (logLevel, message) {
        var loggingEvent = new LoggingEvent(logLevel, message, this);
        this._appenders.forEach(function (appender) {
            appender.log(loggingEvent);
        });
    };
    return Logger;
}());

var BrowserConsoleAppender = /** @class */ (function (_super) {
    __extends(BrowserConsoleAppender, _super);
    function BrowserConsoleAppender() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BrowserConsoleAppender.prototype.doLog = function (loggingEvent) {
        var level = loggingEvent.getLevel();
        var browserConsole;
        switch (level) {
            case exports.LOG_LEVEL.FATAL:
                browserConsole = window.console.error;
                break;
            case exports.LOG_LEVEL.ERROR:
                browserConsole = window.console.error;
                break;
            case exports.LOG_LEVEL.WARN:
                browserConsole = window.console.warn;
                break;
            case exports.LOG_LEVEL.INFO:
                browserConsole = window.console.info;
                break;
            case exports.LOG_LEVEL.DEBUG:
                browserConsole = window.console.debug;
                break;
            case exports.LOG_LEVEL.TRACE:
                browserConsole = window.console.trace;
                break;
            default:
                browserConsole = window.console.log;
        }
        browserConsole = browserConsole.bind(window.console);
        browserConsole(this.format(loggingEvent));
    };
    BrowserConsoleAppender.prototype.doAppend = function () {
        var loggingEvent = new LoggingEvent(exports.LOG_LEVEL.INFO, 'do append', this.logger);
        this.doLog(loggingEvent);
    };
    BrowserConsoleAppender.prototype.doClear = function () {
        window.console.clear();
    };
    BrowserConsoleAppender.prototype.format = function (loggingEvent) {
        var level = loggingEvent.getLevel();
        var message = loggingEvent.getMessage();
        var category = this.logger.getCategory();
        var levelStr = LOG_LEVEL_STRING[level];
        var formattedTimestamp = loggingEvent.getFormattedTimestamp();
        return category + " [" + formattedTimestamp + "] [" + levelStr + "]: " + message + LINE_SEP;
    };
    return BrowserConsoleAppender;
}(AppenderAbstract));

var DateFormatter = /** @class */ (function () {
    function DateFormatter() {
    }
    DateFormatter.prototype.formatDate = function (vDate, vFormat) {
        var vDay = this.addZero(vDate.getDate());
        var vMonth = this.addZero(vDate.getMonth() + 1);
        var vYearLong = this.addZero(vDate.getFullYear());
        var vYearShort = this.addZero(Number(vDate
            .getFullYear()
            .toString()
            .substring(3, 4)));
        var vYear = vFormat.indexOf('yyyy') > -1 ? vYearLong : vYearShort;
        var vHour = this.addZero(vDate.getHours());
        var vMinute = this.addZero(vDate.getMinutes());
        var vSecond = this.addZero(vDate.getSeconds());
        var vTimeZone = this.O(vDate);
        var vDateString = vFormat
            .replace(/dd/g, vDay)
            .replace(/MM/g, vMonth)
            .replace(/y{1,4}/g, vYear);
        vDateString = vDateString
            .replace(/hh/g, vHour)
            .replace(/mm/g, vMinute)
            .replace(/ss/g, vSecond);
        vDateString = vDateString.replace(/O/g, vTimeZone);
        return vDateString;
    };
    DateFormatter.prototype.formatUTCDate = function (vDate, vFormat) {
        var vDay = this.addZero(vDate.getUTCDate());
        var vMonth = this.addZero(vDate.getUTCMonth() + 1);
        var vYearLong = this.addZero(vDate.getUTCFullYear());
        var vYearShort = this.addZero(Number(vDate
            .getUTCFullYear()
            .toString()
            .substring(3, 4)));
        var vYear = vFormat.indexOf('yyyy') > -1 ? vYearLong : vYearShort;
        var vHour = this.addZero(vDate.getUTCHours());
        var vMinute = this.addZero(vDate.getUTCMinutes());
        var vSecond = this.addZero(vDate.getUTCSeconds());
        var vDateString = vFormat
            .replace(/dd/g, vDay)
            .replace(/MM/g, vMonth)
            .replace(/y{1,4}/g, vYear);
        vDateString = vDateString
            .replace(/hh/g, vHour)
            .replace(/mm/g, vMinute)
            .replace(/ss/g, vSecond);
        return vDateString;
    };
    DateFormatter.prototype.addZero = function (vNumber) {
        return (vNumber < 10 ? '0' : '') + vNumber;
    };
    // tslint:disable-next-line
    DateFormatter.prototype.O = function (date) {
        // Difference to Greenwich time (GMT) in hours
        var os = Math.abs(date.getTimezoneOffset());
        var h = String(Math.floor(os / 60));
        var m = String(os % 60);
        if (h.length === 1)
            h = '0' + h;
        if (m.length === 1)
            m = '0' + m;
        return date.getTimezoneOffset() < 0 ? '+' + h + m : '-' + h + m;
    };
    return DateFormatter;
}());

var LogManager = /** @class */ (function () {
    function LogManager() {
        var _this = this;
        this._dateFormatter = new DateFormatter();
        this._overThresholdCallback = null;
        this._loggers = new Map();
        this.initMainLogger();
    }
    Object.defineProperty(LogManager, "Instance", {
        get: function () {
            this._instance = this._instance || (this._instance = new this());
            return this._instance;
        },
        enumerable: true,
        configurable: true
    });
    LogManager.prototype.doAppend = function (overThreshold) {
        if (overThreshold === void 0) { overThreshold = false; }
        return __awaiter(this, void 0, void 0, function () {
            var doAppends;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        doAppends = [];
                        this._loggers.forEach(function (logger) {
                            doAppends.push(logger.doAppend());
                        });
                        return [4 /*yield*/, Promise.all(doAppends)];
                    case 1:
                        _a.sent();
                        if (overThreshold && this._overThresholdCallback) {
                            // notifiy over threshold to do upload
                            this._overThresholdCallback();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    LogManager.prototype.getLogger = function (categoryName) {
        var logger = this._loggers.get(categoryName);
        if (!logger) {
            // Create the logger for this name if it doesn't already exist
            logger = new Logger(categoryName);
            logger.setDateFormatter(this._dateFormatter);
            logger.addAppender('browserConsole', new BrowserConsoleAppender());
            logger.addAppender('persistentLog', new PersistentLogAppender());
            this._loggers.set(categoryName, logger);
        }
        return logger;
    };
    LogManager.prototype.getMainLogger = function () {
        return this.getLogger('MAIN');
    };
    LogManager.prototype.initMainLogger = function () {
        var defaultLogger = this.getMainLogger();
        defaultLogger.setLevel(exports.LOG_LEVEL.ALL);
    };
    LogManager.prototype.setOverThresholdCallback = function (cb) {
        this._overThresholdCallback = cb;
    };
    LogManager.prototype.setAllLoggerLevel = function (level) {
        this._loggers.forEach(function (logger) {
            logger.setLevel(level);
        });
    };
    LogManager.prototype.windowError = function (msg, url, line) {
        var message = 'Error in (' +
            (url || window.location) +
            ') on line ' +
            line +
            ' with message (' +
            msg +
            ')';
        this.getMainLogger().fatal(message);
    };
    LogManager.prototype.getLogs = function (categorys) {
        return __awaiter(this, void 0, void 0, function () {
            var iterable, handleCategorys;
            var _this = this;
            return __generator(this, function (_a) {
                iterable = [];
                handleCategorys = categorys || Array.from(this._loggers.keys());
                handleCategorys.map(function (name) { return _this._loggers.get(name); }).forEach(function (logger) {
                    if (logger) {
                        logger.getAppenders().forEach(function (apppender) {
                            if (apppender instanceof PersistentLogAppender) {
                                iterable.push(apppender.getLogs());
                            }
                        });
                    }
                });
                return [2 /*return*/, Promise.all(iterable).then(function (res) {
                        var logs = {};
                        res.forEach(function (value, index) {
                            logs[handleCategorys[index]] = [].concat.apply([], value);
                        });
                        return logs;
                    })];
            });
        });
    };
    LogManager.prototype.clearLogs = function (categorys) {
        return __awaiter(this, void 0, void 0, function () {
            var iterable, handleCategorys;
            var _this = this;
            return __generator(this, function (_a) {
                iterable = [];
                handleCategorys = categorys || Array.from(this._loggers.keys());
                handleCategorys.map(function (name) { return _this._loggers.get(name); }).forEach(function (logger) {
                    if (logger) {
                        logger.getAppenders().forEach(function (apppender) {
                            if (apppender instanceof PersistentLogAppender) {
                                iterable.push(apppender.doClear());
                            }
                        });
                    }
                });
                return [2 /*return*/, Promise.all(iterable)];
            });
        });
    };
    return LogManager;
}());

var logManager = LogManager.Instance;
var mainLogger = logManager.getMainLogger();
var networkLogger = logManager.getLogger('NETWORK');
emitter.on('doAppend', function (overThreshold) {
    logManager.doAppend(overThreshold);
});

var SocketRequestHelper = /** @class */ (function () {
    function SocketRequestHelper() {
        this.emitter = new eventemitter2.EventEmitter2();
        this.requestTimerMap = new Map();
    }
    SocketRequestHelper.prototype.newRequest = function (request) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._registerRequestListener(request.id, resolve);
            _this._setRequestTimer(request, reject);
        });
    };
    SocketRequestHelper.prototype.newResponse = function (response) {
        var socketResponse = new SocketResponseBuilder()
            .options(response)
            .build();
        if (socketResponse.request && socketResponse.request.params) {
            var requestId = socketResponse.request
                .params.request_id;
            this._removeRequestTimer(requestId);
            this._handleRegisteredRequest(requestId, socketResponse);
        }
    };
    SocketRequestHelper.prototype._registerRequestListener = function (requestId, resolve) {
        this.emitter.once(requestId, resolve);
    };
    SocketRequestHelper.prototype._handleRegisteredRequest = function (requestId, response) {
        mainLogger.info("[Socket]: Handle request:" + requestId);
        this.emitter.emit(requestId, response);
    };
    SocketRequestHelper.prototype._setRequestTimer = function (request, reject) {
        var timerId = window.setTimeout(this._onRequestTimeout, request.timeout, request.id, reject);
        this.requestTimerMap.set(request.id, timerId);
    };
    SocketRequestHelper.prototype._removeRequestTimer = function (requestId) {
        var timerId = this.requestTimerMap.get(requestId);
        window.clearTimeout(timerId);
    };
    SocketRequestHelper.prototype._onRequestTimeout = function (requestId, reject) {
        mainLogger.info('[Socket]: request timeout');
        var response = new SocketResponseBuilder()
            .setStatus(0)
            .setStatusText(exports.NETWORK_FAIL_TYPE.TIME_OUT)
            .build();
        reject(response);
    };
    return SocketRequestHelper;
}());

var SocketClient = /** @class */ (function () {
    function SocketClient(socketServer) {
        var _this = this;
        this.socketRequestHelper = new SocketRequestHelper();
        this.socket = io("https://" + socketServer, {
            transports: ['polling', 'websocket'],
            autoConnect: false,
            reconnection: true,
            reconnectionDelay: 5000,
            reconnectionDelayMax: 25000,
            forceNew: true,
        });
        this.socket.on('response', function (response) {
            _this.socketRequestHelper.newResponse(response);
        });
        SocketClient.get = function () {
            return _this;
        };
    }
    SocketClient.prototype.request = function (request) {
        var socketRequestPromise = this.socketRequestHelper.newRequest(request);
        this.socket.emit('request', request);
        return socketRequestPromise;
    };
    SocketClient.prototype.isClientAvailable = function () {
        return this.socket && this.socket.connected;
    };
    return SocketClient;
}());

var Socket = /** @class */ (function (_super) {
    __extends(Socket, _super);
    function Socket() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Socket.prototype.request = function (request, listener) {
        _super.prototype.request.call(this, request, listener);
        var socketRequest = request;
        if (request.params) {
            socketRequest.parameters = request.params;
        }
        var socket = SocketClient.get();
        if (socket) {
            socket.request(socketRequest).then(function (response) {
                listener.onSuccess(response);
            }, function (response) {
                listener.onFailure(response);
            });
        }
    };
    Socket.prototype.isNetworkReachable = function () {
        var socket = SocketClient.get && SocketClient.get();
        return socket && socket.isClientAvailable();
    };
    return Socket;
}(BaseClient));

var SocketRequest = /** @class */ (function (_super) {
    __extends(SocketRequest, _super);
    function SocketRequest(builder) {
        var _this = _super.call(this, builder) || this;
        _this.parameters = {};
        _this.uri = '';
        _this.params = __assign({}, builder.params, builder.data, { request_id: builder.id });
        _this.uri = builder.path;
        _this.via = exports.NETWORK_VIA.SOCKET;
        return _this;
    }
    return SocketRequest;
}(HttpRequest));

/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:43:35
 * Copyright © RingCentral. All rights reserved.
 */

/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-05-03 15:19:18
 * Copyright © RingCentral. All rights reserved.
 */
var Manager = /** @class */ (function () {
    function Manager() {
        this.httpClient = new Http();
        this.socketClient = new Socket();
    }
    Manager.prototype.getApiClient = function (via) {
        var client = this.httpClient;
        switch (via) {
            case exports.NETWORK_VIA.HTTP:
                client = this.httpClient;
                break;
            case exports.NETWORK_VIA.SOCKET:
                client = this.socketClient;
                break;
            default:
                break;
        }
        return client;
    };
    Manager.prototype.getAvailableClientType = function () {
        if (this.socketClient.isNetworkReachable()) {
            return exports.NETWORK_VIA.SOCKET;
        }
        return exports.NETWORK_VIA.HTTP;
    };
    return Manager;
}());

/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:41:34
 * Copyright © RingCentral. All rights reserved.
 */
var RequestTask = /** @class */ (function () {
    function RequestTask(request) {
        var _a;
        var REQUEST_PRIORITY_WEIGHT = (_a = {},
            _a[exports.REQUEST_PRIORITY.NORMAL] = exports.REQUEST_WEIGHT.NORMAL,
            _a[exports.REQUEST_PRIORITY.HIGH] = exports.REQUEST_WEIGHT.HIGH,
            _a[exports.REQUEST_PRIORITY.SPECIFIC] = exports.REQUEST_WEIGHT.HIGH,
            _a);
        this.request = request;
        this.weight = REQUEST_PRIORITY_WEIGHT[this.request.priority];
    }
    RequestTask.prototype.priority = function () {
        return this.request.priority;
    };
    RequestTask.prototype.setRequestPriority = function (priority) {
        this.request.priority = priority;
        switch (priority) {
            case exports.REQUEST_PRIORITY.NORMAL:
                if (this.weight < exports.REQUEST_WEIGHT.NORMAL) {
                    this.weight = exports.REQUEST_WEIGHT.NORMAL;
                }
                break;
            case exports.REQUEST_PRIORITY.HIGH:
                if (this.weight < exports.REQUEST_WEIGHT.HIGH) {
                    this.weight = exports.REQUEST_WEIGHT.HIGH;
                }
                break;
            case exports.REQUEST_PRIORITY.SPECIFIC:
                if (this.weight < exports.REQUEST_WEIGHT.HIGH) {
                    this.weight = exports.REQUEST_WEIGHT.HIGH;
                }
                break;
            default:
                this.weight = 0;
        }
    };
    RequestTask.prototype.via = function () {
        return this.request.via;
    };
    RequestTask.prototype.incrementTaskWeight = function () {
        this.weight = this.weight + 1;
    };
    return RequestTask;
}());

/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:41:48
 * Copyright © RingCentral. All rights reserved.
 */
var NetworkRequestHandler = /** @class */ (function () {
    function NetworkRequestHandler(tokenManager, type) {
        this.pendingTasks = new Map();
        this.consumers = new Map();
        this.isPause = false;
        this.type = type;
        this.tokenManager = tokenManager;
        this.init();
    }
    NetworkRequestHandler.prototype.init = function () {
        this.initPendingTasks();
    };
    NetworkRequestHandler.prototype.initPendingTasks = function () {
        this.pendingTasks.set(exports.REQUEST_PRIORITY.SPECIFIC, []);
        this.pendingTasks.set(exports.REQUEST_PRIORITY.HIGH, []);
        this.pendingTasks.set(exports.REQUEST_PRIORITY.NORMAL, []);
        this.pendingTasks.set(exports.REQUEST_PRIORITY.LOW, []);
    };
    NetworkRequestHandler.prototype.addApiRequest = function (request, isTail) {
        if (this.isSurvivalModeEnabled()) {
            if (this.isInSurvivalMode() &&
                !this.canHandleSurvivalMode(request.path)) {
                this._callXApiResponseCallback(exports.NETWORK_FAIL_TYPE.SERVER_ERROR, request);
                return;
            }
        }
        var task = new RequestTask(request);
        this.appendTask(task, isTail);
        this.notifyRequestArrived(request.via);
    };
    NetworkRequestHandler.prototype.pause = function () {
        this.isPause = true;
    };
    NetworkRequestHandler.prototype.resume = function () {
        this.isPause = false;
        this.notifyRequestArrived(exports.NETWORK_VIA.ALL);
    };
    NetworkRequestHandler.prototype.cancelAll = function () {
        this.cancelAllPendingTasks();
        this.cancelAllConsumers();
    };
    NetworkRequestHandler.prototype.cancelRequest = function (request) {
        if (this.isRequestInPending(request)) {
            this.deletePendingRequest(request);
            this._callXApiResponseCallback(exports.NETWORK_FAIL_TYPE.CANCELLED, request);
        }
        else {
            var consumer = this.consumers.get(request.via);
            if (consumer) {
                consumer.onCancelRequest(request);
            }
        }
    };
    NetworkRequestHandler.prototype.notifyTokenRefreshed = function () {
        this.consumers.forEach(function (consumer) {
            consumer.onTokenRefreshed();
        });
    };
    NetworkRequestHandler.prototype.produceRequest = function (via) {
        var _this = this;
        var task;
        Object.keys(exports.REQUEST_PRIORITY).some(function (index) {
            var priority = exports.REQUEST_PRIORITY[index];
            if (!_this.canProduceRequest(priority)) {
                return false;
            }
            task = _this._nextTaskInQueue(via, _this.pendingTasks.get(priority));
            if (task) {
                return true;
            }
            return false;
        });
        if (task) {
            task = task;
            this._changeTaskWeight(exports.REQUEST_WEIGHT.HIGH, this.pendingTasks.get(exports.REQUEST_PRIORITY.NORMAL), this.pendingTasks.get(exports.REQUEST_PRIORITY.HIGH));
            this._changeTaskWeight(exports.REQUEST_WEIGHT.NORMAL, this.pendingTasks.get(exports.REQUEST_PRIORITY.LOW), this.pendingTasks.get(exports.REQUEST_PRIORITY.NORMAL));
            return task.request;
        }
        return undefined;
    };
    NetworkRequestHandler.prototype.canProduceRequest = function (priority) {
        return !this.isPause || priority === exports.REQUEST_PRIORITY.SPECIFIC;
    };
    NetworkRequestHandler.prototype.addRequestConsumer = function (via, consumer) {
        this.consumers.set(via, consumer);
    };
    NetworkRequestHandler.prototype.getRequestConsumer = function (via) {
        return this.consumers.get(via);
    };
    NetworkRequestHandler.prototype.getOAuthTokenManager = function () {
        return this.tokenManager;
    };
    NetworkRequestHandler.prototype.notifyRequestArrived = function (handleVia) {
        if (handleVia === exports.NETWORK_VIA.ALL) {
            this.consumers.forEach(function (consumer) {
                if (consumer) {
                    consumer.onConsumeArrived();
                }
            });
        }
        else {
            var consumer = this.consumers.get(handleVia);
            if (consumer) {
                consumer.onConsumeArrived();
            }
        }
    };
    NetworkRequestHandler.prototype.appendTask = function (task, isTail) {
        var queue = this.pendingTasks.get(task.priority());
        if (queue) {
            if (isTail) {
                queue.push(task);
            }
            else {
                queue.unshift(task);
            }
        }
    };
    NetworkRequestHandler.prototype.cancelAllConsumers = function () {
        this.consumers.forEach(function (consumer) {
            consumer.onCancelAll();
        });
    };
    NetworkRequestHandler.prototype.cancelAllPendingTasks = function () {
        var _this = this;
        this.pendingTasks.forEach(function (queue) {
            queue.forEach(function (task) {
                _this._callXApiResponseCallback(exports.NETWORK_FAIL_TYPE.CANCELLED, task.request);
            });
        });
        this.initPendingTasks();
    };
    NetworkRequestHandler.prototype.isRequestInPending = function (request) {
        var exist = false;
        this.pendingTasks.forEach(function (queue) {
            queue.some(function (task) {
                if (task.request.id === request.id) {
                    exist = true;
                    return true;
                }
                return false;
            });
            if (exist) {
                return true;
            }
            return false;
        });
        return exist;
    };
    NetworkRequestHandler.prototype.deletePendingRequest = function (request) {
        var exist = false;
        this.pendingTasks.forEach(function (queue) {
            queue.some(function (task, index) {
                if (task.request.id === request.id) {
                    exist = true;
                    queue.splice(index, 1);
                    return true;
                }
                return false;
            });
            if (exist) {
                return true;
            }
            return false;
        });
    };
    NetworkRequestHandler.prototype.setNetworkRequestSurvivalMode = function (mode) {
        this.networkRequestSurvivalMode = mode;
    };
    NetworkRequestHandler.prototype.isSurvivalModeEnabled = function () {
        return !!this.networkRequestSurvivalMode;
    };
    NetworkRequestHandler.prototype.isInSurvivalMode = function () {
        return (this.networkRequestSurvivalMode &&
            this.networkRequestSurvivalMode.isSurvivalMode());
    };
    NetworkRequestHandler.prototype.canHandleSurvivalMode = function (uri) {
        return (this.networkRequestSurvivalMode &&
            this.networkRequestSurvivalMode.canSupportSurvivalMode(uri));
    };
    NetworkRequestHandler.prototype.onAccessTokenInvalid = function (handlerType) {
        this.tokenManager.refreshOAuthToken(handlerType);
    };
    NetworkRequestHandler.prototype.onSurvivalModeDetected = function (mode, retryAfter) {
        if (this.isSurvivalModeEnabled() && this.networkRequestSurvivalMode) {
            var interval = retryAfter ? retryAfter * 1000 : 4000;
            this.networkRequestSurvivalMode.setSurvivalMode(mode, interval);
            this.cancelAllPendingTasks();
        }
    };
    NetworkRequestHandler.prototype._callXApiResponseCallback = function (type, request) {
        var response = HttpResponse.builder
            .setRequest(request)
            .setStatusText(type)
            .build();
        if (request.callback) {
            request.callback(response);
        }
    };
    NetworkRequestHandler.prototype._nextTaskInQueue = function (via, queue) {
        var result;
        if (queue) {
            queue.some(function (task, index) {
                if (task.via() === via) {
                    result = task;
                    queue.splice(index, 1);
                    return true;
                }
                return false;
            });
        }
        return result;
    };
    NetworkRequestHandler.prototype._changeTaskWeight = function (weight, source, target) {
        if (!source || !target) {
            return;
        }
        var findTask = null;
        var taskIndex = -1;
        source.forEach(function (task, index) {
            task.incrementTaskWeight();
            if (task.weight >= weight && !findTask) {
                findTask = task;
                taskIndex = index;
            }
        });
        if (findTask !== null) {
            findTask = findTask;
            if (weight === exports.REQUEST_WEIGHT.HIGH) {
                findTask.setRequestPriority(exports.REQUEST_PRIORITY.HIGH);
            }
            else if (weight === exports.REQUEST_WEIGHT.NORMAL) {
                findTask.setRequestPriority(exports.REQUEST_PRIORITY.NORMAL);
            }
            source.splice(taskIndex, 1);
            target.push(findTask);
        }
    };
    return NetworkRequestHandler;
}());

var OAuthTokenManager = /** @class */ (function () {
    function OAuthTokenManager() {
        this.tokenHandlers = new Map();
    }
    Object.defineProperty(OAuthTokenManager, "Instance", {
        get: function () {
            this._instance = this._instance || (this._instance = new this());
            return this._instance;
        },
        enumerable: true,
        configurable: true
    });
    OAuthTokenManager.prototype.addOAuthTokenHandler = function (handler) {
        this.tokenHandlers.set(handler.type, handler);
    };
    OAuthTokenManager.prototype.getOAuthTokenHandler = function (type) {
        return this.tokenHandlers.get(type);
    };
    OAuthTokenManager.prototype.setOAuthToken = function (token, type) {
        var tokenHandler = this.getOAuthTokenHandler(type);
        if (tokenHandler) {
            tokenHandler.token = token;
        }
    };
    OAuthTokenManager.prototype.clearOAuthToken = function () {
        this.tokenHandlers.forEach(function (handler) {
            handler.clearOAuthToken();
        });
    };
    OAuthTokenManager.prototype.refreshOAuthToken = function (type) {
        var tokenHandler = this.getOAuthTokenHandler(type);
        if (tokenHandler) {
            tokenHandler.refreshOAuthToken();
        }
    };
    return OAuthTokenManager;
}());

function doLog(response) {
    var request = response.request;
    delete response.request;
    var log = "\n    request:\n      " + JSON.stringify(request) + "\n    response:\n      " + JSON.stringify(response) + "\n  ";
    networkLogger.info(log);
}

var NetworkRequestExecutor = /** @class */ (function () {
    function NetworkRequestExecutor(request, client) {
        this.retryCount = 10;
        this.status = exports.NETWORK_REQUEST_EXECUTOR_STATUS.IDLE;
        this.isComplete = false;
        this.request = request;
        this.via = request.via;
        this.handlerType = request.handlerType;
        this.retryCount = request.retryCount;
        this.client = client;
    }
    NetworkRequestExecutor.prototype.onSuccess = function (response) {
        if (this._isCompletion()) {
            return;
        }
        this.status = exports.NETWORK_REQUEST_EXECUTOR_STATUS.COMPLETION;
        this._callXApiResponseCallback(response);
        doLog(response);
    };
    NetworkRequestExecutor.prototype.onFailure = function (response) {
        if (this._isCompletion()) {
            return;
        }
        if (response.statusText !== exports.NETWORK_FAIL_TYPE.TIME_OUT) {
            this.status = exports.NETWORK_REQUEST_EXECUTOR_STATUS.COMPLETION;
            this._callXApiResponseCallback(response);
            doLog(response);
        }
        else {
            this._retry();
        }
    };
    NetworkRequestExecutor.prototype.getRequest = function () {
        return this.request;
    };
    NetworkRequestExecutor.prototype.execute = function () {
        if (this.client.isNetworkReachable()) {
            this.status = exports.NETWORK_REQUEST_EXECUTOR_STATUS.EXECUTING;
            this._performNetworkRequest();
        }
        else {
            this.status = exports.NETWORK_REQUEST_EXECUTOR_STATUS.COMPLETION;
            this._callXApiResponse(0, exports.NETWORK_FAIL_TYPE.NOT_NETWORK_CONNECTION);
        }
    };
    NetworkRequestExecutor.prototype.cancel = function () {
        if (this._isCompletion()) {
            return;
        }
        this.status = exports.NETWORK_REQUEST_EXECUTOR_STATUS.COMPLETION;
        this._cancelClientRequest();
        this._callXApiResponse(0, exports.NETWORK_FAIL_TYPE.CANCELLED);
    };
    NetworkRequestExecutor.prototype.isPause = function () {
        return this.status === exports.NETWORK_REQUEST_EXECUTOR_STATUS.PAUSE;
    };
    NetworkRequestExecutor.prototype._isCompletion = function () {
        return this.status === exports.NETWORK_REQUEST_EXECUTOR_STATUS.COMPLETION;
    };
    NetworkRequestExecutor.prototype._performNetworkRequest = function () {
        this.client.request(this.request, this);
    };
    NetworkRequestExecutor.prototype._notifyCompletion = function () {
        if (this.listener) {
            this.listener.onConsumeFinished(this);
        }
    };
    NetworkRequestExecutor.prototype._retry = function () {
        if (this.retryCount > 0) {
            this.execute();
            this.retryCount -= 1;
        }
        else {
            this.status = exports.NETWORK_REQUEST_EXECUTOR_STATUS.COMPLETION;
            this._cancelClientRequest();
            this._callXApiResponse(0, exports.NETWORK_FAIL_TYPE.TIME_OUT);
        }
    };
    NetworkRequestExecutor.prototype._cancelClientRequest = function () {
        this.client.cancelRequest(this.request);
    };
    NetworkRequestExecutor.prototype._callXApiResponseCallback = function (response) {
        switch (response.status) {
            case exports.HTTP_STATUS_CODE.UNAUTHORIZED:
                this._handle401XApiCompletionCallback(response);
                break;
            case exports.HTTP_STATUS_CODE.FORBIDDEN:
                this._handle403XApiCompletionCallback(response);
                break;
            case exports.HTTP_STATUS_CODE.BAD_GATEWAY:
                this._handle502XApiCompletionCallback(response);
                break;
            case exports.HTTP_STATUS_CODE.SERVICE_UNAVAILABLE:
                this._handle503XApiCompletionCallback(response);
                break;
            default:
                this._callXApiCompletionCallback(response);
        }
    };
    NetworkRequestExecutor.prototype._callXApiResponse = function (status, statusText) {
        var response = HttpResponse.builder
            .setStatus(status)
            .setStatusText(statusText)
            .setRequest(this.request)
            .build();
        this._callXApiResponseCallback(response);
    };
    NetworkRequestExecutor.prototype._callXApiCompletionCallback = function (response) {
        var callback = this.request.callback;
        if (callback) {
            this._notifyCompletion();
            callback(response);
        }
    };
    NetworkRequestExecutor.prototype._handle401XApiCompletionCallback = function (response) {
        this.status = exports.NETWORK_REQUEST_EXECUTOR_STATUS.PAUSE;
        this.responseListener.onAccessTokenInvalid(this.handlerType);
    };
    NetworkRequestExecutor.prototype._handle403XApiCompletionCallback = function (response) {
        this.status = exports.NETWORK_REQUEST_EXECUTOR_STATUS.PAUSE;
        this.responseListener.onAccessTokenInvalid(this.handlerType);
    };
    NetworkRequestExecutor.prototype._handle502XApiCompletionCallback = function (response) {
        this.responseListener.onSurvivalModeDetected(exports.SURVIVAL_MODE.OFFLINE, 0);
    };
    NetworkRequestExecutor.prototype._handle503XApiCompletionCallback = function (response) {
        var retryAfter = response.retryAfter;
        this.responseListener.onSurvivalModeDetected(exports.SURVIVAL_MODE.SURVIVAL, retryAfter);
    };
    return NetworkRequestExecutor;
}());

var NetworkRequestConsumer = /** @class */ (function () {
    function NetworkRequestConsumer(producer, client, maxQueueCount, via, responseListener, networkRequestDecorator) {
        this._executorQueue = new Map();
        this._producer = producer;
        this._client = client;
        this._maxQueueCount = maxQueueCount;
        this._via = via;
        this._responseListener = responseListener;
        this._networkRequestDecorator = networkRequestDecorator;
    }
    NetworkRequestConsumer.prototype.onConsumeArrived = function () {
        this._consume();
    };
    NetworkRequestConsumer.prototype.onCancelAll = function () {
        this._executorQueue.forEach(function (executor) {
            executor.cancel();
        });
    };
    NetworkRequestConsumer.prototype.onCancelRequest = function (request) {
        var executor = this._getExecutor(request.id);
        if (executor) {
            executor.cancel();
        }
    };
    NetworkRequestConsumer.prototype.onTokenRefreshed = function () {
        this._executorQueue.forEach(function (executor) {
            if (executor.isPause()) {
                executor.execute();
            }
        });
    };
    NetworkRequestConsumer.prototype.onConsumeFinished = function (executor) {
        this._removeExecutor(executor);
        this._consume();
    };
    NetworkRequestConsumer.prototype._consume = function () {
        if (!this._canHandleRequest()) {
            return;
        }
        var request = this._producer.produceRequest(this._via);
        if (!request) {
            return;
        }
        var executor = new NetworkRequestExecutor(request, this._client);
        executor.responseListener = this._responseListener;
        executor.listener = this;
        var decoratedExecutor = this._networkRequestDecorator.setExecutor(executor);
        this._addExecutor(decoratedExecutor);
        decoratedExecutor.execute();
    };
    NetworkRequestConsumer.prototype._canHandleRequest = function () {
        return this._executorQueue.size < this._maxQueueCount;
    };
    NetworkRequestConsumer.prototype._addExecutor = function (executor) {
        this._executorQueue.set(executor.getRequest().id, executor);
    };
    NetworkRequestConsumer.prototype._removeExecutor = function (executor) {
        var requestId = executor.getRequest().id;
        this._executorQueue.delete(requestId);
    };
    NetworkRequestConsumer.prototype._getExecutor = function (requestId) {
        return this._executorQueue.get(requestId);
    };
    return NetworkRequestConsumer;
}());

/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-05-03 11:28:10
 * Copyright © RingCentral. All rights reserved.
 */
var config = {
    rcConfig: {
        rc: { clientId: '', clientSecret: '' },
        glip2: { clientId: '', clientSecret: '' },
    },
    beforeExpired: 5 * 60 * 1000,
    timeout: 600 * 1000,
    dbAdapter: 'dexie',
    survivalModeUris: {},
};

/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-05-03 11:25:17
 * Copyright © RingCentral. All rights reserved.
 */
var DEFAULT_BEFORE_EXPIRED = config.beforeExpired;
var DEFAULT_TIMEOUT_INTERVAL = config.timeout;
var SURVIVAL_MODE_URIS = config.survivalModeUris;

/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:41:44
 * Copyright © RingCentral. All rights reserved.
 */
var NetworkRequestSurvivalMode = /** @class */ (function () {
    function NetworkRequestSurvivalMode() {
        this.survivalModeURIs = SURVIVAL_MODE_URIS;
        this.survivalMode = exports.SURVIVAL_MODE.NORMAL;
    }
    NetworkRequestSurvivalMode.prototype.canSupportSurvivalMode = function (uri) {
        return Object.values(this.survivalModeURIs).includes(uri);
    };
    NetworkRequestSurvivalMode.prototype.isSurvivalMode = function () {
        return this.survivalMode !== exports.SURVIVAL_MODE.NORMAL;
    };
    NetworkRequestSurvivalMode.prototype.setSurvivalMode = function (mode, interval) {
        if (this.isSurvivalMode()) {
            return;
        }
        this.survivalMode = mode;
        this.setupTimer(interval);
    };
    NetworkRequestSurvivalMode.prototype.setupTimer = function (interval) {
        var _this = this;
        this.timer = setTimeout(function () {
            _this.backToNormal();
        }, interval);
    };
    NetworkRequestSurvivalMode.prototype.clearTimer = function () {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    };
    NetworkRequestSurvivalMode.prototype.backToNormal = function () {
        this.clearTimer();
        this.survivalMode = exports.SURVIVAL_MODE.NORMAL;
    };
    return NetworkRequestSurvivalMode;
}());

var NetworkRequestDecorator = /** @class */ (function () {
    function NetworkRequestDecorator(decoration) {
        this.decoration = decoration;
    }
    NetworkRequestDecorator.prototype.setExecutor = function (executor) {
        this.executor = executor;
        return this;
    };
    NetworkRequestDecorator.prototype.cancel = function () {
        this.executor.cancel();
    };
    NetworkRequestDecorator.prototype.isPause = function () {
        this.executor.isPause();
    };
    NetworkRequestDecorator.prototype.getRequest = function () {
        return this.executor.getRequest();
    };
    NetworkRequestDecorator.prototype.execute = function () {
        if (this.executor) {
            this.decoration.decorate(this.getRequest());
            this.executor.execute();
        }
    };
    return NetworkRequestDecorator;
}());

/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-05-03 13:51:11
 * Copyright © RingCentral. All rights reserved.
 */
var NetworkManager = /** @class */ (function () {
    function NetworkManager() {
        this.clientManager = new Manager();
        this.handlers = new Map();
        this.tokenManager = OAuthTokenManager.Instance;
    }
    Object.defineProperty(NetworkManager, "Instance", {
        get: function () {
            this._instance = this._instance || (this._instance = new this());
            return this._instance;
        },
        enumerable: true,
        configurable: true
    });
    NetworkManager.prototype.addApiRequest = function (request, isTail) {
        if (isTail === void 0) { isTail = true; }
        var handler = this.networkRequestHandler(request.handlerType);
        if (handler) {
            handler.addApiRequest(request, isTail);
        }
    };
    NetworkManager.prototype.pause = function () {
        this.handlers.forEach(function (handler) {
            handler.pause();
        });
    };
    NetworkManager.prototype.resume = function () {
        this.handlers.forEach(function (handler) {
            handler.resume();
        });
    };
    NetworkManager.prototype.cancelAll = function () {
        this.handlers.forEach(function (handler) {
            handler.cancelAll();
        });
    };
    NetworkManager.prototype.cancelRequest = function (request) {
        var handler = this.networkRequestHandler(request.handlerType);
        if (handler) {
            handler.cancelRequest(request);
        }
    };
    NetworkManager.prototype.getTokenManager = function () {
        return this.tokenManager;
    };
    NetworkManager.prototype.setOAuthToken = function (token, handlerType) {
        if (_.isEmpty(this.tokenManager)) {
            throw new Error('token manager can not be null.');
        }
        if (this.tokenManager) {
            this.tokenManager.setOAuthToken(token, handlerType);
        }
    };
    NetworkManager.prototype.clearToken = function () {
        if (this.tokenManager) {
            this.tokenManager.clearOAuthToken();
        }
    };
    NetworkManager.prototype.addNetworkRequestHandler = function (handler) {
        this.handlers.set(handler.type, handler);
    };
    NetworkManager.prototype.networkRequestHandler = function (type) {
        return this.handlers.get(type);
    };
    NetworkManager.prototype.addRequestConsumer = function (handler, via, consumer) {
        handler.addRequestConsumer(via, consumer);
    };
    NetworkManager.prototype.initNetworkRequestBaseHandler = function (handlerType, hasSurvivalMode, decorator) {
        if (hasSurvivalMode === void 0) { hasSurvivalMode = false; }
        if (_.isEmpty(this.tokenManager) || !this.tokenManager) {
            throw new Error('token manager can not be null.');
        }
        var finalDecorator = new NetworkRequestDecorator(decorator);
        var handler = new NetworkRequestHandler(this.tokenManager, handlerType);
        var httpVia = exports.NETWORK_VIA.HTTP;
        var httpConsumer = new NetworkRequestConsumer(handler, this.clientManager.getApiClient(httpVia), exports.CONSUMER_MAX_QUEUE_COUNT.HTTP, httpVia, handler, finalDecorator);
        this.addRequestConsumer(handler, httpVia, httpConsumer);
        var socketVia = exports.NETWORK_VIA.SOCKET;
        var socketConsumer = new NetworkRequestConsumer(handler, this.clientManager.getApiClient(socketVia), exports.CONSUMER_MAX_QUEUE_COUNT.SOCKET, socketVia, handler, finalDecorator);
        this.addRequestConsumer(handler, socketVia, socketConsumer);
        if (hasSurvivalMode) {
            var survivalMode = new NetworkRequestSurvivalMode();
            handler.setNetworkRequestSurvivalMode(survivalMode);
        }
        this.addNetworkRequestHandler(handler);
        return handler;
    };
    return NetworkManager;
}());

/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:41:41
 * Copyright © RingCentral. All rights reserved.
 */
var OAuthTokenHandler = /** @class */ (function () {
    function OAuthTokenHandler(type, cumstumizedHandler, token, basic, listener, isOAuthTokenRefreshing) {
        if (isOAuthTokenRefreshing === void 0) { isOAuthTokenRefreshing = false; }
        this.type = type;
        this.token = token;
        this.basic = basic;
        this.listener = listener;
        this.isOAuthTokenRefreshing = isOAuthTokenRefreshing;
    }
    OAuthTokenHandler.prototype.clearOAuthToken = function () {
        this.token = undefined;
    };
    OAuthTokenHandler.prototype.getBasic = function () {
        return this.basic;
    };
    OAuthTokenHandler.prototype.accessToken = function () {
        /* eslint-disable camelcase */
        if (this.token) {
            var access_token = this.token.access_token;
            if (access_token) {
                return access_token;
            }
        }
        /* eslint-enable camelcase */
        return '';
    };
    OAuthTokenHandler.prototype.isOAuthTokenAvailable = function () {
        var token = this.token;
        return !_.isEmpty(token);
    };
    OAuthTokenHandler.prototype.isOAuthAccessTokenExpired = function () {
        return this.willAccessTokenExpired() && this.isAccessTokenExpired();
    };
    OAuthTokenHandler.prototype.isAccessTokenExpired = function () {
        return this.isTokenExpired(true);
    };
    OAuthTokenHandler.prototype.isRefreshTokenExpired = function () {
        return this.isTokenExpired(false);
    };
    OAuthTokenHandler.prototype.isTokenExpired = function (isAccessToken) {
        if (!this.token || !this.token.timestamp) {
            return true;
        }
        var _a = this.token, timestamp = _a.timestamp, accessTokenExpireIn = _a.accessTokenExpireIn, refreshTokenExpireIn = _a.refreshTokenExpireIn;
        var isInvalid = isAccessToken
            ? !accessTokenExpireIn
            : !refreshTokenExpireIn;
        if (isInvalid) {
            return true;
        }
        var accessTokenExpireInMillisecond = accessTokenExpireIn * 1000;
        var duration = isAccessToken
            ? accessTokenExpireInMillisecond - DEFAULT_BEFORE_EXPIRED
            : refreshTokenExpireIn * 1000;
        var now = Date.now();
        if (now < timestamp) {
            return true;
        }
        if (now > timestamp + duration) {
            return true;
        }
        return false;
    };
    /**
     * @override
     */
    OAuthTokenHandler.prototype.isAccessTokenRefreshable = function () {
        return !!this.token && this.type.tokenRefreshable;
    };
    /**
     * @override
     */
    OAuthTokenHandler.prototype.doRefreshToken = function (token) {
        return this.type.doRefreshToken(token);
    };
    /**
     * @override
     */
    OAuthTokenHandler.prototype.willAccessTokenExpired = function () {
        return this.type.tokenExpirable;
    };
    OAuthTokenHandler.prototype.refreshOAuthToken = function () {
        var _this = this;
        if (!this.isOAuthTokenRefreshing) {
            this.isOAuthTokenRefreshing = true;
            if (this.isAccessTokenRefreshable()) {
                if (this.isRefreshTokenExpired()) {
                    this._notifyRefreshTokenFailure();
                    return;
                }
                if (this.token) {
                    this.doRefreshToken(this.token)
                        .then(function (token) {
                        if (token) {
                            _this.token = token;
                            _this._notifyRefreshTokenSuccess(token);
                        }
                    })
                        .catch(function () {
                        _this._notifyRefreshTokenFailure();
                    });
                }
            }
            else {
                this._notifyRefreshTokenFailure();
            }
        }
        else {
            this._notifyRefreshTokenFailure();
        }
    };
    OAuthTokenHandler.prototype._resetOAuthTokenRefreshingFlag = function () {
        this.isOAuthTokenRefreshing = false;
    };
    OAuthTokenHandler.prototype._notifyRefreshTokenFailure = function () {
        this._resetOAuthTokenRefreshingFlag();
        if (this.listener) {
            this.listener.onRefreshTokenFailure(this.type);
        }
    };
    OAuthTokenHandler.prototype._notifyRefreshTokenSuccess = function (token) {
        this._resetOAuthTokenRefreshingFlag();
        if (this.listener) {
            this.listener.onRefreshTokenSuccess(this.type, token);
        }
    };
    return OAuthTokenHandler;
}());

var NetworkSetup = /** @class */ (function () {
    function NetworkSetup() {
    }
    NetworkSetup.setup = function (types) {
        types.forEach(function (type) {
            var tokenHandler = new OAuthTokenHandler(type, new /** @class */ (function () {
                function class_1() {
                }
                class_1.prototype.isAccessTokenRefreshable = function () {
                    return type.tokenRefreshable;
                };
                class_1.prototype.doRefreshToken = function (token) {
                    return type.doRefreshToken(token);
                };
                class_1.prototype.willAccessTokenExpired = function () {
                    return type.tokenExpirable;
                };
                return class_1;
            }())());
            var decoration = type.requestDecoration(tokenHandler);
            var handler = NetworkManager.Instance.initNetworkRequestBaseHandler(type, type.survivalModeSupportable, new /** @class */ (function () {
                function class_2() {
                }
                class_2.prototype.decorate = function (request) {
                    return decoration(request);
                };
                return class_2;
            }())());
            tokenHandler.listener = new TokenRefreshListener(tokenHandler, handler);
            tokenHandler.basic = type.basic();
            OAuthTokenManager.Instance.addOAuthTokenHandler(tokenHandler);
        });
    };
    return NetworkSetup;
}());
var TokenRefreshListener = /** @class */ (function () {
    function TokenRefreshListener(tokenHandler, requestHandler) {
        this.tokenHandler = tokenHandler;
        this.requestHandler = requestHandler;
        this.tokenHandler = tokenHandler;
        this.requestHandler = requestHandler;
    }
    TokenRefreshListener.prototype.onRefreshTokenSuccess = function (handlerType, token) {
        if (_.isEmpty(token)) {
            throw new Error('token can not be null.');
        }
        this.tokenHandler.token = token;
        this.requestHandler.notifyTokenRefreshed();
    };
    TokenRefreshListener.prototype.onRefreshTokenFailure = function (handlerType) {
        this.requestHandler.cancelAll();
    };
    return TokenRefreshListener;
}());

/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-05-15 14:05:59
 * Copyright © RingCentral. All rights reserved.
 */
var Token = /** @class */ (function () {
    function Token(access_token, refreshToken) {
        this.accessTokenExpireIn = 1;
        this.refreshTokenExpireIn = 1;
        this.access_token = access_token;
        this.timestamp = Date.now();
        this.refreshToken = refreshToken;
    }
    return Token;
}());

/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-22 15:03:27
 * Copyright © RingCentral. All rights reserved.
 */
var AbstractHandleType = /** @class */ (function () {
    function AbstractHandleType() {
        this.defaultVia = exports.NETWORK_VIA.HTTP;
        this.survivalModeSupportable = false;
        this.tokenExpirable = false;
        this.tokenRefreshable = false;
    }
    AbstractHandleType.prototype.doRefreshToken = function (token) {
        return new Promise(function (token) { return token; });
    };
    AbstractHandleType.prototype.basic = function () {
        return '';
    };
    AbstractHandleType.prototype.requestDecoration = function (tokenHandler) {
        return function (request) {
            return request;
        };
    };
    return AbstractHandleType;
}());

/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:40:58
 * Copyright © RingCentral. All rights reserved.
 */
function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = ((d + Math.random() * 16) % 16) | 0; // eslint-disable-line
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x7) | 0x8).toString(16); // eslint-disable-line
    });
    return uuid;
}
var generateIncrementId = {
    latestId: 1,
    get: function () {
        if (!this.latestId) {
            this.latestId = 1;
        }
        else {
            this.latestId += 1;
        }
        return this.latestId.toString();
    },
};

/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:43:31
 * Copyright © RingCentral. All rights reserved.
 */
var NetworkRequestBuilder = /** @class */ (function () {
    function NetworkRequestBuilder() {
        this.id = '';
        this.path = '';
        this.requestConfig = {};
        this.retryCount = 0;
        this.timeout = config.timeout;
        this.priority = exports.REQUEST_PRIORITY.NORMAL;
        this.via = exports.NETWORK_VIA.HTTP;
        this.method = exports.NETWORK_METHOD.GET;
    }
    NetworkRequestBuilder.prototype.options = function (options) {
        var host = options.host, path = options.path, method = options.method, handlerType = options.handlerType, params = options.params, data = options.data, headers = options.headers, authFree = options.authFree, requestConfig = options.requestConfig;
        this.headers = headers || {};
        this.authFree = authFree || false;
        this.method = method;
        this.host = host || '';
        this.path = path;
        this.handlerType = handlerType;
        this.params = params || {};
        this.data = data || {};
        this.requestConfig = requestConfig || {};
        return this;
    };
    /**
     * Setter handlerType
     * @param {IHandleType} value
     */
    NetworkRequestBuilder.prototype.setHandlerType = function (value) {
        this.handlerType = value;
        return this;
    };
    /**
     * Setter path
     * @param {string} value
     */
    NetworkRequestBuilder.prototype.setPath = function (value) {
        this.path = value;
        return this;
    };
    /**
     * Setter priority
     * @param {REQUEST_PRIORITY} value
     */
    NetworkRequestBuilder.prototype.setPriority = function (value) {
        this.priority = value;
        return this;
    };
    /**
     * Setter via
     * @param {NETWORK_VIA} value
     */
    NetworkRequestBuilder.prototype.setVia = function (value) {
        this.via = value;
        return this;
    };
    /**
     * Setter retryCount
     * @param {number} value
     */
    NetworkRequestBuilder.prototype.setRetryCount = function (value) {
        this.retryCount = value;
        return this;
    };
    /**
     * Setter data
     * @param {any} value
     */
    NetworkRequestBuilder.prototype.setData = function (value) {
        this.data = value;
        return this;
    };
    /**
     * Setter method
     * @param {string } value
     */
    NetworkRequestBuilder.prototype.setMethod = function (value) {
        this.method = value;
        return this;
    };
    /**
     * Setter headers
     * @param {string } value
     */
    NetworkRequestBuilder.prototype.setHeaders = function (value) {
        this.headers = value;
        return this;
    };
    /**
     * Setter host
     * @param {string } value
     */
    NetworkRequestBuilder.prototype.setHost = function (value) {
        this.host = value;
        return this;
    };
    /**
     * Setter timeout
     * @param {number } value
     */
    NetworkRequestBuilder.prototype.setTimeout = function (value) {
        this.timeout = value;
        return this;
    };
    /**
     * Setter requestConfig
     * @param {object } value
     */
    NetworkRequestBuilder.prototype.setRequestConfig = function (value) {
        this.requestConfig = value;
        return this;
    };
    /**
     * Setter params
     * @param {any} value
     */
    NetworkRequestBuilder.prototype.setParams = function (value) {
        this.params = value;
        return this;
    };
    /**
     * Setter authFree
     * @param {boolean} value
     */
    NetworkRequestBuilder.prototype.setAuthfree = function (value) {
        this.authFree = value;
        return this;
    };
    NetworkRequestBuilder.prototype.build = function () {
        switch (this.via) {
            case exports.NETWORK_VIA.SOCKET:
                this.id = generateIncrementId.get();
                return new SocketRequest(this);
            case exports.NETWORK_VIA.HTTP:
                this.id = generateUUID();
                return new HttpRequest(this);
            case exports.NETWORK_VIA.ALL:
            default:
                this.via = NetworkManager.Instance.clientManager.getAvailableClientType();
                return this.build();
        }
    };
    return NetworkRequestBuilder;
}());

/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:43:26
 * Copyright © RingCentral. All rights reserved.
 */

/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:42:59
 * Copyright © RingCentral. All rights reserved.
 */

/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:41:12
 * Copyright © RingCentral. All rights reserved.
 */
var Foundation = /** @class */ (function () {
    function Foundation() {
    }
    Foundation.init = function (newConfig) {
        // TODO refactor: foundation should not care about rcConfig,
        // and foundation should not contain biz logic.
        Object.assign(config.rcConfig, newConfig.rcConfig);
        if (newConfig.timeout) {
            config.timeout = newConfig.timeout;
        }
        if (newConfig.tokenExpireInAdvance) {
            config.beforeExpired = newConfig.tokenExpireInAdvance;
        }
        if (newConfig.survivalModeUris) {
            config.survivalModeUris = newConfig.survivalModeUris;
        }
        config.dbAdapter = newConfig.dbAdapter;
        // NetworkManager.Instance.init();
    };
    return Foundation;
}());

/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-05-03 13:31:26
 * Copyright © RingCentral. All rights reserved.
 */

exports.Foundation = Foundation;
exports.config = config;
exports.Container = Container;
exports.DBManager = DBManager;
exports.KVStorageManager = KVStorageManager;
exports.CriteriaParser = CriteriaParser;
exports.DexieCollection = DexieCollection;
exports.DexieDB = DexieDB;
exports.KVStorage = KVStorage;
exports.storageFactory = storageFactory;
exports.NetworkManager = NetworkManager;
exports.OAuthTokenHandler = OAuthTokenHandler;
exports.OAuthTokenManager = OAuthTokenManager;
exports.NetworkRequestHandler = NetworkRequestHandler;
exports.NetworkSetup = NetworkSetup;
exports.Token = Token;
exports.AbstractHandleType = AbstractHandleType;
exports.BaseResponse = BaseResponse;
exports.BaseRequest = BaseRequest;
exports.NetworkRequestBuilder = NetworkRequestBuilder;
exports.Socket = Socket;
exports.SocketRequest = SocketRequest;
exports.SocketResponse = SocketResponse;
exports.SocketClient = SocketClient;
exports.Http = Http;
exports.HttpRequest = HttpRequest;
exports.HttpResponse = HttpResponse;
exports.HttpResponseBuilder = HttpResponseBuilder;
exports.DEFAULT_BEFORE_EXPIRED = DEFAULT_BEFORE_EXPIRED;
exports.DEFAULT_TIMEOUT_INTERVAL = DEFAULT_TIMEOUT_INTERVAL;
exports.SURVIVAL_MODE_URIS = SURVIVAL_MODE_URIS;
exports.logManager = logManager;
exports.mainLogger = mainLogger;
exports.networkLogger = networkLogger;
