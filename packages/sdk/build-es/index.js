import { EventEmitter2 } from 'eventemitter2';
import * as HttpStatus from 'http-status-codes';
import Dexie from 'dexie';
import { Response, DexieDB, LokiDB, mainLogger, DBManager, KVStorageManager, NetworkManager, NetworkRequestBuilder, NETWORK_VIA, NETWORK_METHOD, AbstractHandleType, NetworkSetup, SocketClient, logManager, LOG_LEVEL, Foundation, Token } from 'foundation';
import _ from 'lodash';
import { caseInsensitive } from 'string-natural-compare';
import merge from 'lodash/merge';
import { Markdown } from 'glipdown';
import pick from 'lodash/pick';
import StateMachine from 'ts-javascript-state-machine';
import axios from 'axios';
import NProgress from 'nprogress';

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

/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-07-09 15:32:58
 * Copyright © RingCentral. All rights reserved
*/
var GROUP_QUERY_TYPE = {
    ALL: 'all',
    GROUP: 'group',
    TEAM: 'team',
    FAVORITE: 'favorite',
};
var EVENT_TYPES = {
    REPLACE: 'replace',
    PUT: 'put',
    UPDATE: 'update',
    DELETE: 'delete',
};
var PERMISSION_ENUM;
(function (PERMISSION_ENUM) {
    PERMISSION_ENUM[PERMISSION_ENUM["TEAM_POST"] = 1] = "TEAM_POST";
    PERMISSION_ENUM[PERMISSION_ENUM["TEAM_ADD_MEMBER"] = 2] = "TEAM_ADD_MEMBER";
    PERMISSION_ENUM[PERMISSION_ENUM["TEAM_ADD_INTEGRATIONS"] = 4] = "TEAM_ADD_INTEGRATIONS";
    PERMISSION_ENUM[PERMISSION_ENUM["TEAM_PIN_POST"] = 8] = "TEAM_PIN_POST";
    PERMISSION_ENUM[PERMISSION_ENUM["TEAM_ADMIN"] = 16] = "TEAM_ADMIN";
})(PERMISSION_ENUM || (PERMISSION_ENUM = {}));
var SHOULD_UPDATE_NETWORK_TOKEN = 'should_update_network_token';

// interface Item {
//   id: number;
// }
/**
 * transform array to map structure
 * @param {array} entities
 */
var transform2Map = function (entities) {
    var map = new Map();
    entities.forEach(function (item) {
        map.set(item.id, item);
    });
    return map;
};
var NotificationCenter = /** @class */ (function (_super) {
    __extends(NotificationCenter, _super);
    function NotificationCenter() {
        return _super.call(this, { wildcard: true }) || this;
    }
    NotificationCenter.prototype.trigger = function (key) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        // mainLogger.debug(...args);
        _super.prototype.emit.apply(this, __spread([key], args));
    };
    /**
     * emit event for ui layer of store entity insert or update
     * @param {string} key
     * @param {array} entities
     */
    NotificationCenter.prototype.emitEntityPut = function (key, entities) {
        this.trigger(key, {
            type: EVENT_TYPES.PUT,
            entities: transform2Map(entities),
        });
    };
    NotificationCenter.prototype.emitEntityUpdate = function (key, entities) {
        this.trigger(key, {
            type: EVENT_TYPES.UPDATE,
            entities: transform2Map(entities),
        });
    };
    NotificationCenter.prototype.emitEntityReplace = function (key, entities) {
        this.trigger(key, {
            type: EVENT_TYPES.REPLACE,
            entities: transform2Map(entities),
        });
    };
    NotificationCenter.prototype.emitEntityDelete = function (key, entities) {
        this.trigger(key, {
            type: EVENT_TYPES.DELETE,
            entities: transform2Map(entities),
        });
    };
    NotificationCenter.prototype.emitConfigPut = function (key, payload) {
        this.trigger(key, {
            payload: payload,
            type: EVENT_TYPES.PUT,
        });
    };
    NotificationCenter.prototype.emitConfigDelete = function (key) {
        this.trigger(key, {
            type: EVENT_TYPES.DELETE,
        });
    };
    NotificationCenter.prototype.emitService = function (key, payload) {
        this.trigger(key, payload);
    };
    return NotificationCenter;
}(EventEmitter2));
var notificationCenter = new NotificationCenter();

/*
* @Author: Chris Zhan (chris.zhan@ringcentral.com)
* @Date: 2018-03-05 11:25:49
* Copyright © RingCentral. All rights reserved.
*/
var Query = /** @class */ (function () {
    function Query(collection, db) {
        this.collection = collection;
        this.db = db;
        this.criteria = [];
        this.reset();
    }
    Query.prototype.reset = function () {
        this.criteria = [];
        this.parallel = [];
        return this;
    };
    /**
     * Only use one time
     * @param {String} key search key
     * @param {Boolean} desc is desc
     */
    Query.prototype.orderBy = function (key, desc) {
        if (desc === void 0) { desc = false; }
        this.criteria.push({
            key: key,
            desc: desc,
            name: 'orderBy',
        });
        return this;
    };
    Query.prototype.reverse = function () {
        this.criteria.push({
            name: 'reverse',
        });
        return this;
    };
    Query.prototype.or = function (query) {
        this.parallel = this.parallel || [];
        this.parallel.push(query);
        return this;
    };
    Query.prototype.equal = function (key, value, ignoreCase) {
        if (ignoreCase === void 0) { ignoreCase = false; }
        this.criteria.push({
            key: key,
            value: value,
            ignoreCase: ignoreCase,
            name: 'equal',
        });
        return this;
    };
    Query.prototype.notEqual = function (key, value) {
        this.criteria.push({
            key: key,
            value: value,
            name: 'notEqual',
        });
        return this;
    };
    Query.prototype.between = function (key, lowerBound, upperBound, includeLower, includeUpper) {
        this.criteria.push({
            key: key,
            lowerBound: lowerBound,
            upperBound: upperBound,
            includeLower: includeLower,
            includeUpper: includeUpper,
            name: 'between',
        });
        return this;
    };
    Query.prototype.greaterThan = function (key, value) {
        this.criteria.push({
            key: key,
            value: value,
            name: 'greaterThan',
        });
        return this;
    };
    Query.prototype.greaterThanOrEqual = function (key, value) {
        this.criteria.push({
            key: key,
            value: value,
            name: 'greaterThanOrEqual',
        });
        return this;
    };
    Query.prototype.lessThan = function (key, value) {
        this.criteria.push({
            key: key,
            value: value,
            name: 'lessThan',
        });
        return this;
    };
    Query.prototype.lessThanOrEqual = function (key, value) {
        this.criteria.push({
            key: key,
            value: value,
            name: 'lessThanOrEqual',
        });
        return this;
    };
    Query.prototype.anyOf = function (key, array, ignoreCase) {
        if (ignoreCase === void 0) { ignoreCase = false; }
        this.criteria.push({
            key: key,
            array: array,
            ignoreCase: ignoreCase,
            name: 'anyOf',
        });
        return this;
    };
    Query.prototype.startsWith = function (key, value, ignoreCase) {
        if (ignoreCase === void 0) { ignoreCase = false; }
        this.criteria.push({
            key: key,
            value: value,
            ignoreCase: ignoreCase,
            name: 'startsWith',
        });
        return this;
    };
    Query.prototype.contain = function (key, value) {
        this.criteria.push({
            key: key,
            value: value,
            name: 'contain',
        });
        return this;
    };
    Query.prototype.filter = function (filter) {
        this.criteria.push({
            filter: filter,
            name: 'filter',
        });
        return this;
    };
    Query.prototype.offset = function (n) {
        this.criteria.push({
            name: 'offset',
            amount: n,
        });
        return this;
    };
    Query.prototype.limit = function (n) {
        this.criteria.push({
            name: 'limit',
            amount: n,
        });
        return this;
    };
    Query.prototype.toArray = function (_a) {
        var _b = _a === void 0 ? {} : _a, sortBy = _b.sortBy, desc = _b.desc;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (typeof desc === 'boolean' && !sortBy) {
                            throw new Error('sortBy should be specified if desc is specified');
                        }
                        return [4 /*yield*/, this.db.ensureDBOpened()];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, this.collection.getAll(this, { sortBy: sortBy, desc: desc })];
                }
            });
        });
    };
    Query.prototype.count = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.ensureDBOpened()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.collection.count(this)];
                    case 2:
                        result = _a.sent();
                        if (result) {
                            return [2 /*return*/, result];
                        }
                        return [2 /*return*/, 0];
                }
            });
        });
    };
    Query.prototype.first = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.ensureDBOpened()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.collection.first(this)];
                    case 2:
                        result = _a.sent();
                        if (result) {
                            return [2 /*return*/, result];
                        }
                        return [2 /*return*/, null];
                }
            });
        });
    };
    Query.prototype.last = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.ensureDBOpened()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.collection.last(this)];
                    case 2:
                        result = _a.sent();
                        if (result) {
                            return [2 /*return*/, result];
                        }
                        return [2 /*return*/, null];
                }
            });
        });
    };
    return Query;
}());

function uniqueArray(array) {
    return __spread(new Set(array));
}

/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-07-12 13:34:51
 * Copyright © RingCentral. All rights reserved
*/
// Provides utilities for handling math
var MAX_INTEGER = 9007199254740992;
function randomInt() {
    return Math.floor(Math.random() * MAX_INTEGER);
}
function versionHash() {
    return randomInt();
}
//  collision rate is less than 1/2^^122
function generateUUID() {
    var date = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (date + Math.random() * 16) % 16 | 0;
        date = Math.floor(date / 16);
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
    return uuid;
}

/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-03-22 13:03:39
 * Copyright © RingCentral. All rights reserved.
 */
var BaseError = /** @class */ (function (_super) {
    __extends(BaseError, _super);
    function BaseError(code, message) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, message) || this;
        _this.code = code;
        // fix instanceof
        // tslint:disable-next-line:max-line-length
        // see: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#support-for-newtarget
        Object.setPrototypeOf(_this, _newTarget.prototype);
        return _this;
    }
    return BaseError;
}(Error));

/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-03-21 14:33:23
 * Copyright © RingCentral. All rights reserved.
 */
// import _ from 'lodash';
var ErrorTypes = {
    UNDEFINED_ERROR: 0,
    HTTP: 1000,
    DB: 2000,
    SERVICE: 3000,
    INVALIDTE_PARAMETERS: 3001,
    OAUTH: 4000,
    NETWORK: 5000,
    INVALID_GRANT: 4147,
};
Object.keys(HttpStatus).forEach(function (key) {
    ErrorTypes[key] = ErrorTypes.HTTP + HttpStatus[key];
});

/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-03-22 13:29:51
 * Copyright © RingCentral. All rights reserved.
 */
// import BaseResponse from 'foundation/network/BaseResponse';
var ErrorParser = /** @class */ (function () {
    function ErrorParser() {
    }
    ErrorParser.parse = function (err) {
        // need refactor
        // if (!err) return new BaseError(ErrorTypes.UNDEFINED_ERROR, 'Server Crash');
        if (err instanceof Dexie.DexieError) {
            return ErrorParser.dexie(err);
        }
        if (err instanceof Response) {
            return ErrorParser.http(err);
        }
        return new BaseError(ErrorTypes.UNDEFINED_ERROR, 'Undefined error!');
    };
    ErrorParser.dexie = function (err) {
        return new BaseError(ErrorTypes.DB, err.message);
    };
    ErrorParser.http = function (err) {
        if (err.statusText === 'Network Error') {
            return new BaseError(ErrorTypes.NETWORK, 'Network Error: Please check whether server crash');
        }
        if (err.statusText === 'NOT NETWORK CONNECTION') {
            return new BaseError(ErrorTypes.NETWORK, 'Network Error: Please check network connection');
        }
        var data = err.data;
        if (typeof data.error === 'string') {
            return new BaseError(ErrorTypes[data.error.toUpperCase()], data.error_description);
        }
        return new BaseError(err.status + ErrorTypes.HTTP, data.error.message);
    };
    return ErrorParser;
}());

/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-03-21 17:16:50
 * Copyright © RingCentral. All rights reserved.
 */
window.addEventListener('error', function (err) {
    notificationCenter.emit('Error', { error: ErrorParser.parse(err) });
});
var Throw = function (code, message) {
    throw new BaseError(code, message);
};
var Aware = function (code, message) {
    notificationCenter.emit('Error', { error: new BaseError(code, message) });
};

var TypeDictionary = {
    TYPE_ID_COMPANY: 1,
    TYPE_ID_GROUP: 2,
    TYPE_ID_PERSON: 3,
    TYPE_ID_POST: 4,
    TYPE_ID_PROJECT: 5,
    TYPE_ID_TEAM: 6,
    TYPE_ID_STATE: 7,
    TYPE_ID_PLUGIN: 8,
    TYPE_ID_TASK: 9,
    TYPE_ID_FILE: 10,
    TYPE_ID_PRESENCE: 11,
    TYPE_ID_STORED_FILE: 12,
    TYPE_ID_BUG: 13,
    TYPE_ID_EVENT: 14,
    TYPE_ID_PROFILE: 15,
    TYPE_ID_EMAIL_STATE: 16,
    TYPE_ID_LINK: 17,
    TYPE_ID_PAGE: 18,
    TYPE_ID_ACCOUNT: 19,
    TYPE_ID_MEETING: 20,
    TYPE_ID_MEGA_MEETING: 21,
    TYPE_ID_ADDLIVE_MEETING: 23,
    TYPE_ID_PAYMENT: 24,
    TYPE_ID_DO_IMPORT: 25,
    TYPE_ID_GMAIL_IMPORT: 26,
    TYPE_ID_INTEGRATION: 27,
    TYPE_ID_INTEGRATION_ITEM: 28,
    TYPE_ID_REFERRAL: 29,
    TYPE_ID_POLL: 30,
    TYPE_ID_CODE: 31,
    TYPE_ID_GOOGLE_SIGNON: 32,
    TYPE_ID_LINKEDIN_SIGNON: 33,
    TYPE_ID_QUESTION: 34,
    TYPE_ID_IMPORT_ITEM: 35,
    TYPE_ID_SLACK_IMPORT: 36,
    TYPE_ID_HIPCHAT_IMPORT: 37,
    TYPE_ID_ASANA_IMPORT: 38,
    TYPE_ID_TRELLO_IMPORT: 39,
    TYPE_ID_RC_SIGNON: 40,
    TYPE_ID_CONFERENCE: 41,
    TYPE_ID_CALL: 42,
    TYPE_ID_SIP: 43,
    TYPE_ID_EXPORT: 44,
    TYPE_ID_INTERACTIVE_MESSAGE_ITEM: 45,
    TYPE_ID_FLIP2GLIP_EMAIL: 46,
    TYPE_ID_OUTLOOK_IMPORT: 60,
    TYPE_ID_RC_PHONE_TAB: 100,
    TYPE_ID_RC_CALL: 101,
    TYPE_ID_RC_VOICEMAIL: 102,
    TYPE_ID_RC_FAX: 103,
    TYPE_ID_RC_PRESENCE: 104,
    TYPE_ID_RC_BLOCK: 105,
    TYPE_ID_RC_SMSES: 106,
    // NOTE: this is our minimum value for integration types, see Is_Integration_Type() function
    TYPE_ID_CUSTOM_ITEM: 7000,
    TYPE_ID_JIRA_ITEM: 7001,
    TYPE_ID_GITHUB_ITEM: 7002,
    TYPE_ID_HARVEST_ITEM: 7003,
    TYPE_ID_STRIPE_ITEM: 7004,
    TYPE_ID_ZENDESK_ITEM: 7005,
    TYPE_ID_ASANA_ITEM: 7006,
    TYPE_ID_BITBUCKET_ITEM: 7007,
    TYPE_ID_BOX_ITEM: 7008,
    TYPE_ID_BUGSNAG_ITEM: 7009,
    TYPE_ID_BUILDBOX_ITEM: 7010,
    TYPE_ID_CIRCLECI_ITEM: 7011,
    TYPE_ID_CLOUD66_ITEM: 7012,
    TYPE_ID_CODESHIP_ITEM: 7013,
    TYPE_ID_CONCUR_ITEM: 7014,
    TYPE_ID_CRASHLYTICS_ITEM: 7015,
    TYPE_ID_DATADOG_ITEM: 7016,
    TYPE_ID_EXPENSIFY_ITEM: 7017,
    TYPE_ID_FRESHBOOKS_ITEM: 7018,
    TYPE_ID_GETSATISFACTION_ITEM: 7019,
    TYPE_ID_GOSQUARED_ITEM: 7020,
    TYPE_ID_HANGOUTS_ITEM: 7021,
    TYPE_ID_HONEYBADGER_ITEM: 7022,
    TYPE_ID_HUBOT_ITEM: 7023,
    TYPE_ID_HUBSPOT_ITEM: 7024,
    TYPE_ID_INSIGHTLY_ITEM: 7025,
    TYPE_ID_JENKINS_ITEM: 7026,
    TYPE_ID_LIBRATO_ITEM: 7027,
    // TYPE_ID_MAGNUM_ITEM: 7028,
    TYPE_ID_MAILCHIMP_ITEM: 7029,
    TYPE_ID_MARKETO_ITEM: 7030,
    TYPE_ID_NAGIOS_ITEM: 7031,
    // TYPE_ID_NEWRELIC_ITEM: 7032, possible duplicate with 7062
    TYPE_ID_NINEFOLD_ITEM: 7033,
    TYPE_ID_ONEDRIVE_ITEM: 7034,
    TYPE_ID_OPSGENIE_ITEM: 7035,
    TYPE_ID_PAGERDUTY_ITEM: 7036,
    TYPE_ID_PAPERTRAIL_ITEM: 7037,
    TYPE_ID_PHABRICATOR_ITEM: 7038,
    TYPE_ID_PINGDOM_ITEM: 7039,
    TYPE_ID_PIVOTALTRACKER_ITEM: 7040,
    TYPE_ID_QUICKBOOKS_ITEM: 7041,
    TYPE_ID_REAMAZE_ITEM: 7043,
    TYPE_ID_ROLLCALL_ITEM: 7044,
    TYPE_ID_RSS_ITEM: 7045,
    TYPE_ID_SALESFORCE_ITEM: 7046,
    TYPE_ID_SCREENHERO_ITEM: 7047,
    TYPE_ID_SEMAPHORE_ITEM: 7048,
    TYPE_ID_SENTRY_ITEM: 7049,
    TYPE_ID_STATUSPAGEIO_ITEM: 7050,
    TYPE_ID_SUBVERSION_ITEM: 7051,
    TYPE_ID_SUPPORTFU_ITEM: 7052,
    TYPE_ID_TRAVIS_ITEM: 7053,
    TYPE_ID_TRELLO_ITEM: 7054,
    TYPE_ID_TWITTER_ITEM: 7055,
    TYPE_ID_USERVOICE_ITEM: 7056,
    TYPE_ID_VOCUS_ITEM: 7057,
    TYPE_ID_ZAPIER_ITEM: 7058,
    TYPE_ID_ZOHO_ITEM: 7059,
    TYPE_ID_DONEDONE_ITEM: 7060,
    TYPE_ID_AIRBRAKE_ITEM: 7061,
    TYPE_ID_NEW_RELIC_ITEM: 7062,
    TYPE_ID_TRAVIS_CI_ITEM: 7063,
    TYPE_ID_HEROKU_ITEM: 7064,
    TYPE_ID_CONFLUENCE_ITEM: 7065,
    TYPE_ID_SERVICE_NOW_ITEM: 7066,
    TYPE_ID_RAYGUN_ITEM: 7067,
    TYPE_ID_MAGNUMCI_ITEM: 7068,
    TYPE_ID_RUNSCOPE_ITEM: 7070,
    TYPE_ID_CIRCLE_CI_ITEM: 7073,
    TYPE_ID_GO_SQUARED_ITEM: 7075,
    TYPE_ID_OPS_GENIE_ITEM: 7076,
    TYPE_ID_SUMO_LOGIC_ITEM: 7082,
    TYPE_ID_APP_SIGNAL_ITEM: 7083,
    TYPE_ID_USERLIKE_ITEM: 7086,
    TYPE_ID_DESK_ITEM: 7089,
    TYPE_ID_VICTOR_OPS_ITEM: 7090,
    TYPE_ID_GLIPFORCE_ITEM: 7091,
    TYPE_ID_STATUS_PAGE_ITEM: 7092,
};

/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-09 13:22:02
 * Copyright © RingCentral. All rights reserved.
 */
// http://git.ringcentral.com:8888/Glip/glip-type-dictionary
var INTEGRATION_LOWER_ID = 7000;
var GlipTypeUtil = /** @class */ (function () {
    function GlipTypeUtil() {
    }
    GlipTypeUtil.isIntegrationType = function (typeId) {
        return typeId >= INTEGRATION_LOWER_ID;
    };
    GlipTypeUtil.extractTypeId = function (objectId) {
        return objectId & 0x1fff; // eslint-disable-line no-bitwise
    };
    return GlipTypeUtil;
}());

/*
 * @Author: Andy Hu
 * @Date: 2018-06-14 23:06:34
 * Copyright © RingCentral. All rights reserved.
 */
var _a;
var socketMessageMap = (_a = {},
    _a[TypeDictionary.TYPE_ID_STATE] = 'state',
    _a[TypeDictionary.TYPE_ID_GROUP] = 'group',
    _a[TypeDictionary.TYPE_ID_TEAM] = 'group',
    _a[TypeDictionary.TYPE_ID_POST] = 'post',
    _a[TypeDictionary.TYPE_ID_COMPANY] = 'company',
    _a[TypeDictionary.TYPE_ID_PERSON] = 'person',
    _a[TypeDictionary.TYPE_ID_PROFILE] = 'profile',
    _a[TypeDictionary.TYPE_ID_ACCOUNT] = 'account',
    _a[TypeDictionary.TYPE_ID_TASK] = 'item',
    _a[TypeDictionary.TYPE_ID_FILE] = 'item',
    _a[TypeDictionary.TYPE_ID_PLUGIN] = 'item',
    _a[TypeDictionary.TYPE_ID_TASK] = 'item',
    _a[TypeDictionary.TYPE_ID_EVENT] = 'item',
    _a[TypeDictionary.TYPE_ID_LINK] = 'item',
    _a[TypeDictionary.TYPE_ID_MEETING] = 'item',
    _a[TypeDictionary.TYPE_ID_PAGE] = 'item',
    _a);
function parseSocketMessage(message) {
    var objects = JSON.parse(message).body.objects;
    var result = {};
    objects.forEach(function (arr) {
        arr.forEach(function (obj) {
            if (obj.search_results) {
                result['search'] = obj.search_results;
            }
            var objTypeId = GlipTypeUtil.extractTypeId(obj._id);
            if (socketMessageMap[objTypeId]) {
                var key = socketMessageMap[objTypeId];
                result[key] = result[key] || [];
                result[key].push(obj);
            }
        });
    });
    return result;
}

/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-05-15 16:36:53
 * Copyright © RingCentral. All rights reserved.
 */
function serializeUrlParams(params) {
    var str = [];
    Object.entries(params).forEach(function (_a) {
        var _b = __read(_a, 2), key = _b[0], value = _b[1];
        if (Object.prototype.hasOwnProperty.call(params, key)) {
            str.push(key + "=" + value);
        }
    });
    return str.join('&');
}



var index = /*#__PURE__*/Object.freeze({
    uniqueArray: uniqueArray,
    randomInt: randomInt,
    versionHash: versionHash,
    generateUUID: generateUUID,
    BaseError: BaseError,
    ErrorTypes: ErrorTypes,
    ErrorParser: ErrorParser,
    Throw: Throw,
    Aware: Aware,
    TypeDictionary: TypeDictionary,
    GlipTypeUtil: GlipTypeUtil,
    parseSocketMessage: parseSocketMessage,
    serializeUrlParams: serializeUrlParams
});

var BaseDao = /** @class */ (function () {
    function BaseDao(collectionName, db) {
        /**
         * should remove this condition later
         */
        // if (db) {
        this.db = db;
        this.collection = db.getCollection(collectionName);
        // }
    }
    BaseDao.prototype.put = function (item) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!Array.isArray(item)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.bulkPut(item)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 2:
                        this._validateItem(item, true);
                        return [4 /*yield*/, this.db.ensureDBOpened()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.collection.put(item)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    BaseDao.prototype.bulkPut = function (array) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        array.forEach(function (item) { return _this._validateItem(item, true); });
                        return [4 /*yield*/, this.db.ensureDBOpened()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.db.getTransaction('rw', [this.collection], function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    this.collection.bulkPut(array);
                                    return [2 /*return*/];
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    BaseDao.prototype.get = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._validateKey(key);
                        return [4 /*yield*/, this.db.ensureDBOpened()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.collection.get(key)];
                }
            });
        });
    };
    BaseDao.prototype.clear = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.collection.clear()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     * @param {*} primaryKey
     * return undefined no matter if a record was deleted or not
     */
    BaseDao.prototype.delete = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._validateKey(key);
                        return [4 /*yield*/, this.db.ensureDBOpened()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.collection.delete(key)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    BaseDao.prototype.bulkDelete = function (keys) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        keys.forEach(function (key) { return _this._validateKey(key); });
                        return [4 /*yield*/, this.db.ensureDBOpened()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.collection.bulkDelete(keys)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    BaseDao.prototype.update = function (item) {
        return __awaiter(this, void 0, void 0, function () {
            var array, primKey, saved;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!Array.isArray(item)) return [3 /*break*/, 2];
                        array = item;
                        return [4 /*yield*/, this.bulkUpdate(array)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 2: return [4 /*yield*/, this.db.ensureDBOpened()];
                    case 3:
                        _a.sent();
                        primKey = this.collection.primaryKeyName();
                        return [4 /*yield*/, this.get(item[primKey])];
                    case 4:
                        saved = _a.sent();
                        if (!!saved) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.put(item)];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 6: return [4 /*yield*/, this.collection.update(item[primKey], item)];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    BaseDao.prototype.bulkUpdate = function (array) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.ensureDBOpened()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.db.getTransaction('rw', [this.collection], function () { return __awaiter(_this, void 0, void 0, function () {
                                var _this = this;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, Promise.all(array.map(function (item) { return _this.update(item); }))];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    BaseDao.prototype.getAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.ensureDBOpened()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.collection.getAll()];
                }
            });
        });
    };
    BaseDao.prototype.isDexieDB = function () {
        return this.db instanceof DexieDB;
    };
    BaseDao.prototype.isLokiDB = function () {
        return this.db instanceof LokiDB;
    };
    BaseDao.prototype.createQuery = function () {
        return new Query(this.collection, this.db);
    };
    BaseDao.prototype.createEmptyQuery = function () {
        return new Query(this.collection, this.db).limit(0);
    };
    BaseDao.prototype._validateItem = function (item, withPrimaryKey) {
        if (!_.isObjectLike(item)) {
            Throw(ErrorTypes.INVALIDTE_PARAMETERS, "Item should be an object. Received " + item);
        }
        if (_.isEmpty(item)) {
            Throw(ErrorTypes.INVALIDTE_PARAMETERS, "Item should not be an empty object.");
        }
        if (withPrimaryKey && !item[this.collection.primaryKeyName()]) {
            Throw(ErrorTypes.INVALIDTE_PARAMETERS, "Lack of primary key " + this.collection.primaryKeyName() + " in object " + JSON.stringify(item));
        }
    };
    BaseDao.prototype._validateKey = function (key) {
        if (!_.isInteger(key)) {
            Throw(ErrorTypes.INVALIDTE_PARAMETERS, 'Key for db get method should be an integer.');
        }
    };
    BaseDao.COLLECTION_NAME = '';
    return BaseDao;
}());

var BaseKVDao = /** @class */ (function () {
    function BaseKVDao(collectionName, kvStorage, keys) {
        this.kvStorage = kvStorage;
        this.collectionName = collectionName;
        this.keys = keys;
    }
    BaseKVDao.prototype.getKey = function (key) {
        return this.collectionName + "/" + key;
    };
    BaseKVDao.prototype.put = function (key, value) {
        this.kvStorage.put(this.getKey(key), value);
    };
    BaseKVDao.prototype.get = function (key) {
        return this.kvStorage.get(this.getKey(key));
    };
    BaseKVDao.prototype.remove = function (key) {
        this.kvStorage.remove(this.getKey(key));
    };
    BaseKVDao.prototype.clear = function () {
        var _this = this;
        this.keys.map(function (key) { return _this.remove(key); });
    };
    return BaseKVDao;
}());

/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-28 00:34:18
 * Copyright © RingCentral. All rights reserved.
 */

/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-28 00:17:39
 */
var STORAGE_TYPES = {
    KV: 1,
    DB: 2,
};

/**
 * Generator unique and indices
 * @param {String} unique
 * @param {Array} indices
 * return {*}
 */
var gen = function (unique, indices, onUpgrade) {
    if (unique === void 0) { unique = 'id'; }
    if (indices === void 0) { indices = []; }
    return ({
        unique: unique,
        indices: indices,
        onUpgrade: onUpgrade,
    });
};
// const refactorId = (item: any) => {
//   item._id = item._id;
//   delete item._id;
// };
var schema = {
    name: 'Glip',
    version: 2,
    schema: {
        1: {
            person: gen(),
            group: gen(),
            post: gen('id', ['group_id', 'created_at']),
            item: gen(),
            company: gen(),
            profile: gen('id', ['favorite_group_ids']),
            state: gen(),
        },
        2: {
            state: gen('id', ['person_id']),
        },
        3: {
            person: gen('id', ['first_name', 'last_name', 'display_name', 'email']),
        },
        4: {
            post: gen('id', ['group_id', 'created_at', '[group_id+created_at]']),
            group: gen('id', ['most_recent_post_created_at']),
        },
        5: {
            groupState: gen(),
        },
        6: {
            deactivated: gen(),
        },
        7: {
            item: gen('id', ['*group_ids']),
        },
    },
};

/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-01 13:42:43
 * @Last Modified by: Valor Lin (valor.lin@ringcentral.com)
 * @Last Modified time: 2018-08-06 14:16:43
 */
var ACCOUNT_USER_ID = 'user_id';
var ACCOUNT_PROFILE_ID = 'profile_id';
var ACCOUNT_COMPANY_ID = 'company_id';
var ACCOUNT_CLIENT_CONFIG = 'client_config';
var ACCOUNT_KEYS = [
    ACCOUNT_USER_ID,
    ACCOUNT_PROFILE_ID,
    ACCOUNT_COMPANY_ID,
    ACCOUNT_CLIENT_CONFIG,
];

/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-01 13:24:11
 */
var AccountDao = /** @class */ (function (_super) {
    __extends(AccountDao, _super);
    function AccountDao(kvStorage) {
        return _super.call(this, AccountDao.COLLECTION_NAME, kvStorage, ACCOUNT_KEYS) || this;
    }
    AccountDao.COLLECTION_NAME = 'account';
    return AccountDao;
}(BaseKVDao));

/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-28 00:37:48
 * @Last Modified by: Chris Zhan (chris.zhan@ringcentral.com)
 * @Last Modified time: 2018-03-15 09:27:48
 */
var AUTH_GLIP_TOKEN = 'GLIP_TOKEN';
var AUTH_RC_TOKEN = 'RC_TOKEN';
var AUTH_GLIP2_TOKEN = 'GLIP2_TOKEN';
var AUTH_KEYS = [AUTH_GLIP_TOKEN, AUTH_RC_TOKEN, AUTH_GLIP2_TOKEN];

var AuthDao = /** @class */ (function (_super) {
    __extends(AuthDao, _super);
    function AuthDao(kvStorage) {
        return _super.call(this, AuthDao.COLLECTION_NAME, kvStorage, AUTH_KEYS) || this;
    }
    AuthDao.COLLECTION_NAME = 'auth';
    return AuthDao;
}(BaseKVDao));

var CompanyDao = /** @class */ (function (_super) {
    __extends(CompanyDao, _super);
    // TODO, use IDatabase after import foundation module in
    function CompanyDao(db) {
        return _super.call(this, CompanyDao.COLLECTION_NAME, db) || this;
    }
    CompanyDao.COLLECTION_NAME = 'company';
    return CompanyDao;
}(BaseDao));

/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-05-23 09:41:17
 * Copyright © RingCentral. All rights reserved.
 */
var LAST_INDEX_TIMESTAMP = 'LAST_INDEX_TIMESTAMP';
var SOCKET_SERVER_HOST = 'SOCKET_SERVER_HOST';
var CONFIG_KEYS = [LAST_INDEX_TIMESTAMP, SOCKET_SERVER_HOST];
var ENV = 'ENV';
var DB_SCHEMA_VERSION = 'DB_SCHEMA_VERSION';
var CLIENT_ID = 'CLIENT_ID';

var ConfigDao = /** @class */ (function (_super) {
    __extends(ConfigDao, _super);
    function ConfigDao(kvStorage) {
        return _super.call(this, ConfigDao.COLLECTION_NAME, kvStorage, CONFIG_KEYS) || this;
    }
    ConfigDao.prototype.getEnv = function () {
        return this.get(ENV) || '';
    };
    ConfigDao.prototype.putEnv = function (env) {
        this.put(ENV, env);
    };
    ConfigDao.COLLECTION_NAME = 'config';
    return ConfigDao;
}(BaseKVDao));

/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-24 22:28:07
 */
var GroupDao = /** @class */ (function (_super) {
    __extends(GroupDao, _super);
    // TODO, use IDatabase after import foundation module in
    function GroupDao(db) {
        return _super.call(this, GroupDao.COLLECTION_NAME, db) || this;
    }
    GroupDao.prototype.queryGroups = function (offset, limit, isTeam, excludeIds) {
        if (excludeIds === void 0) { excludeIds = []; }
        return __awaiter(this, void 0, void 0, function () {
            var query;
            return __generator(this, function (_a) {
                mainLogger.debug("queryGroup isTeam:" + isTeam + " excludeIds:" + excludeIds);
                query = this.createQuery()
                    .orderBy('most_recent_post_created_at', true)
                    .filter(function (item) { return !item.is_archived && item.is_team === isTeam; })
                    .offset(offset)
                    .limit(limit);
                if (Array.isArray(excludeIds)) {
                    query.filter(function (item) { return excludeIds.indexOf(item.id) === -1; });
                }
                return [2 /*return*/, query.toArray()];
            });
        });
    };
    GroupDao.prototype.queryGroupsByIds = function (ids) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createQuery()
                        .anyOf('id', ids)
                        .filter(function (item) { return !item.is_archived; })
                        .toArray({
                        sortBy: 'most_recent_post_created_at',
                        desc: true,
                    })];
            });
        });
    };
    GroupDao.prototype.queryAllGroups = function (offset, limit) {
        if (offset === void 0) { offset = 0; }
        if (limit === void 0) { limit = Infinity; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                mainLogger.debug('queryAllGroups');
                return [2 /*return*/, this.createQuery()
                        .orderBy('most_recent_post_created_at', true)
                        .offset(offset)
                        .limit(limit)
                        .filter(function (item) { return !item.is_archived; })
                        .toArray()];
            });
        });
    };
    GroupDao.prototype.searchTeamByKey = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                mainLogger.debug("searchTeamByKey ==> " + key);
                return [2 /*return*/, this.createQuery()
                        .equal('is_team', true)
                        .filter(function (item) {
                        // !item.deactivated &&
                        // !item.is_archived &&
                        return typeof item.set_abbreviation === 'string' &&
                            new RegExp("" + key, 'i').test(item.set_abbreviation);
                    })
                        .toArray()];
            });
        });
    };
    GroupDao.prototype.queryGroupByMemberList = function (members) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                mainLogger.debug("queryGroupByMemberList members ==> " + members);
                return [2 /*return*/, this.createQuery()
                        .equal('is_team', false)
                        .filter(function (item) {
                        return !item.is_archived &&
                            item.members &&
                            item.members.sort().toString() === members.sort().toString();
                    })
                        .toArray()];
            });
        });
    };
    GroupDao.prototype.getLatestGroup = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createQuery()
                        .orderBy('most_recent_post_created_at', true)
                        .filter(function (item) { return !item.is_archived; })
                        .first()];
            });
        });
    };
    GroupDao.prototype.getLastNGroups = function (n) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createQuery()
                        .orderBy('most_recent_post_created_at', true)
                        .filter(function (item) { return !item.is_archived; })
                        .limit(n)
                        .toArray()];
            });
        });
    };
    GroupDao.COLLECTION_NAME = 'group';
    return GroupDao;
}(BaseDao));

var GroupStateDao = /** @class */ (function (_super) {
    __extends(GroupStateDao, _super);
    // TODO, use IDatabase after import foundation module in
    function GroupStateDao(db) {
        return _super.call(this, GroupStateDao.COLLECTION_NAME, db) || this;
    }
    GroupStateDao.prototype.getAll = function () {
        return this.createQuery().toArray();
    };
    GroupStateDao.COLLECTION_NAME = 'groupState';
    return GroupStateDao;
}(BaseDao));

/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-24 23:25:03
 */
var ItemDao = /** @class */ (function (_super) {
    __extends(ItemDao, _super);
    // TODO, use IDatabase after import foundation module in
    function ItemDao(db) {
        return _super.call(this, ItemDao.COLLECTION_NAME, db) || this;
    }
    ItemDao.prototype.getItemsByIds = function (ids) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (this.createQuery()
                        .anyOf('id', ids)
                        // .filter(item => !item.deactivated)
                        .toArray())];
            });
        });
    };
    ItemDao.prototype.getItemsByGroupId = function (groupId, limit) {
        return __awaiter(this, void 0, void 0, function () {
            var query;
            return __generator(this, function (_a) {
                query = this.createQuery().contain('group_ids', groupId);
                return [2 /*return*/, limit ? query.limit(limit).toArray() : query.toArray()];
            });
        });
    };
    ItemDao.COLLECTION_NAME = 'item';
    return ItemDao;
}(BaseDao));

var ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');
var DEFAULT_LIMIT = 50;
var PersonDao = /** @class */ (function (_super) {
    __extends(PersonDao, _super);
    // TODO, use IDatabase after import foundation module in
    function PersonDao(db) {
        return _super.call(this, PersonDao.COLLECTION_NAME, db) || this;
    }
    PersonDao.prototype.getAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            var persons;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _super.prototype.getAll.call(this)];
                    case 1:
                        persons = _a.sent();
                        return [2 /*return*/, persons.sort(this._personCompare.bind(this))];
                }
            });
        });
    };
    PersonDao.prototype.getAllCount = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createQuery().count()];
            });
        });
    };
    PersonDao.prototype.getPersonsByPrefix = function (prefix, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.offset, offset = _c === void 0 ? 0 : _c, _d = _b.limit, limit = _d === void 0 ? DEFAULT_LIMIT : _d;
        return __awaiter(this, void 0, void 0, function () {
            var persons;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (prefix === '')
                            return [2 /*return*/, []];
                        if (prefix === '#')
                            return [2 /*return*/, this._getPersonsNotStartsWithAlphabet({ limit: limit })];
                        return [4 /*yield*/, this._searchPersonsByPrefix(prefix)];
                    case 1:
                        persons = _e.sent();
                        // Sort after query to get better performance
                        return [2 /*return*/, persons.sort(this._personCompare.bind(this)).slice(offset, offset + limit)];
                }
            });
        });
    };
    PersonDao.prototype.getPersonsOfEachPrefix = function (_a) {
        var _b = (_a === void 0 ? {} : _a).limit, limit = _b === void 0 ? DEFAULT_LIMIT : _b;
        return __awaiter(this, void 0, void 0, function () {
            var promises, map, persons;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        promises = [];
                        map = new Map();
                        return [4 /*yield*/, this.getAll()];
                    case 1:
                        persons = _c.sent();
                        // Find persons starts with a letter in a-Z
                        ALPHABET.forEach(function (prefix) {
                            var filteredPersons = persons.filter(function (person) {
                                var display_name = _this._getNameOfPerson(person);
                                return display_name && display_name.toLowerCase().indexOf(prefix) === 0;
                            });
                            map.set(prefix.toUpperCase(), filteredPersons.slice(0, limit));
                        });
                        // Find persons don't starts with a letter in a-Z
                        promises.unshift((function () { return __awaiter(_this, void 0, void 0, function () {
                            var persons;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this._getPersonsNotStartsWithAlphabet({ limit: limit })];
                                    case 1:
                                        persons = _a.sent();
                                        map.set('#', persons);
                                        return [2 /*return*/];
                                }
                            });
                        }); })());
                        return [4 /*yield*/, Promise.all(promises)];
                    case 2:
                        _c.sent();
                        return [2 /*return*/, map];
                }
            });
        });
    };
    PersonDao.prototype.getPersonsCountByPrefix = function (prefix) {
        return __awaiter(this, void 0, void 0, function () {
            var length;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(prefix === '#')) return [3 /*break*/, 1];
                        length = this._getPersonsCountNotStartsWithAlphabet();
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this._searchPersonsByPrefix(prefix)];
                    case 2:
                        length = (_a.sent()).length;
                        _a.label = 3;
                    case 3: return [2 /*return*/, length];
                }
            });
        });
    };
    PersonDao.prototype.searchPeopleByKey = function (fullKeyword) {
        if (fullKeyword === void 0) { fullKeyword = ''; }
        return __awaiter(this, void 0, void 0, function () {
            var trimmedFullKeyword, keywordParts, keyword, q1_1, q2_1, q3, q1, q2;
            return __generator(this, function (_a) {
                trimmedFullKeyword = fullKeyword.trim();
                keywordParts = trimmedFullKeyword.split(' ');
                // no keyword
                if (trimmedFullKeyword.length === 0 || keywordParts.length === 0)
                    return [2 /*return*/, []];
                // 1 part
                if (keywordParts.length === 1) {
                    keyword = keywordParts[0];
                    q1_1 = this.createQuery().startsWith('first_name', keyword, true);
                    q2_1 = this.createQuery().startsWith('display_name', keyword, true);
                    q3 = this.createQuery().startsWith('email', keyword, true);
                    return [2 /*return*/, q1_1
                            .or(q2_1)
                            .or(q3)
                            .toArray()];
                }
                q1 = this.createQuery()
                    .startsWith('first_name', keywordParts[0], true)
                    .filter(function (item) {
                    return (item.last_name ? item.last_name.toLowerCase().startsWith(keywordParts[1]) : false);
                });
                q2 = this.createQuery()
                    .startsWith('display_name', fullKeyword, true)
                    .filter(function (item) {
                    return (item.last_name ? item.last_name.toLowerCase().startsWith(keywordParts[1]) : false);
                });
                return [2 /*return*/, q1.or(q2).toArray()];
            });
        });
    };
    PersonDao.prototype._getPersonsNotStartsWithAlphabet = function (_a) {
        var limit = _a.limit;
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_b) {
                return [2 /*return*/, this.createQuery()
                        .orderBy('display_name')
                        .filter(function (person) {
                        var display = _this._getNameOfPerson(person);
                        return !!display && !ALPHABET.includes(display[0].toLowerCase());
                    })
                        .limit(limit)
                        .toArray()];
            });
        });
    };
    PersonDao.prototype._getPersonsCountNotStartsWithAlphabet = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createQuery()
                        .orderBy('display_name')
                        .filter(function (person) {
                        var display = _this._getNameOfPerson(person);
                        return !!display && !ALPHABET.includes(display[0].toLowerCase());
                    })
                        .count()];
            });
        });
    };
    PersonDao.prototype._personCompare = function (a, b) {
        var aName = this._getNameOfPerson(a);
        var bName = this._getNameOfPerson(b);
        return caseInsensitive(aName, bName);
    };
    PersonDao.prototype._getNameOfPerson = function (person) {
        return person && (person.display_name || person.first_name || person.email);
    };
    PersonDao.prototype._searchPersonsByPrefix = function (prefix) {
        return __awaiter(this, void 0, void 0, function () {
            var q1, q2, q3, reg, persons;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        q1 = this.createQuery().startsWith('first_name', prefix, true);
                        q2 = this.createQuery().startsWith('display_name', prefix, true);
                        q3 = this.createQuery().startsWith('email', prefix, true);
                        reg = new RegExp('^' + prefix + '.*', 'i');
                        return [4 /*yield*/, q1
                                .or(q2)
                                .or(q3)
                                .toArray()];
                    case 1:
                        persons = _a.sent();
                        persons = persons.filter(function (person) {
                            var display_name = person.display_name, first_name = person.first_name;
                            return !((display_name &&
                                !reg.test(display_name)) ||
                                (!display_name && first_name && !reg.test(first_name)));
                        });
                        return [2 /*return*/, persons];
                }
            });
        });
    };
    PersonDao.COLLECTION_NAME = 'person';
    return PersonDao;
}(BaseDao));

var PostDao = /** @class */ (function (_super) {
    __extends(PostDao, _super);
    // TODO, use IDatabase after import foundation module in
    function PostDao(db) {
        return _super.call(this, PostDao.COLLECTION_NAME, db) || this;
    }
    PostDao.prototype.queryPostsByGroupId = function (groupId, offset, limit) {
        if (offset === void 0) { offset = 0; }
        if (limit === void 0) { limit = Infinity; }
        return __awaiter(this, void 0, void 0, function () {
            var query, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mainLogger.debug("queryPostsByGroupId groupId:" + groupId + " offset:" + offset + " limit:" + limit);
                        query = this.createQuery();
                        return [4 /*yield*/, query
                                .orderBy('created_at', true)
                                .equal('group_id', groupId)
                                .offset(offset)
                                .limit(limit)
                                .toArray()];
                    case 1:
                        result = _a.sent();
                        // logger.timeEnd('queryPostsByGroupId');
                        return [2 /*return*/, result];
                }
            });
        });
    };
    PostDao.prototype.queryManyPostsByIds = function (ids) {
        return __awaiter(this, void 0, void 0, function () {
            var query;
            return __generator(this, function (_a) {
                query = this.createQuery();
                return [2 /*return*/, query.anyOf('id', ids).toArray()];
            });
        });
    };
    PostDao.prototype.queryLastPostByGroupId = function (groupId) {
        var query = this.createQuery();
        return query
            .orderBy('created_at', true)
            .equal('group_id', groupId)
            .filter(function (item) { return !item.deactivated; })
            .first();
    };
    PostDao.prototype.queryOldestPostByGroupId = function (groupId) {
        var query = this.createQuery();
        return query
            .orderBy('created_at')
            .equal('group_id', groupId)
            .filter(function (item) { return !item.deactivated; })
            .first();
    };
    PostDao.prototype.purgePostsByGroupId = function (groupId, preserveCount) {
        if (preserveCount === void 0) { preserveCount = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var query, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = this.createQuery();
                        return [4 /*yield*/, query
                                .orderBy('created_at', true)
                                .equal('group_id', groupId)
                                .offset(preserveCount)
                                .toArray()];
                    case 1:
                        result = _a.sent();
                        if (!result.length) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.bulkDelete(result.map(function (item) { return item.id; }))];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PostDao.prototype.queryPreInsertPost = function () {
        return __awaiter(this, void 0, void 0, function () {
            var query;
            return __generator(this, function (_a) {
                query = this.createQuery();
                return [2 /*return*/, query.lessThan('id', 0).toArray()];
            });
        });
    };
    PostDao.COLLECTION_NAME = 'post';
    return PostDao;
}(BaseDao));

var ProfileDao = /** @class */ (function (_super) {
    __extends(ProfileDao, _super);
    // TODO, use IDatabase after import foundation module in
    function ProfileDao(db) {
        return _super.call(this, ProfileDao.COLLECTION_NAME, db) || this;
    }
    ProfileDao.COLLECTION_NAME = 'profile';
    return ProfileDao;
}(BaseDao));

var StateDao = /** @class */ (function (_super) {
    __extends(StateDao, _super);
    // TODO, use IDatabase after import foundation module in
    function StateDao(db) {
        return _super.call(this, StateDao.COLLECTION_NAME, db) || this;
    }
    StateDao.prototype.getFirst = function () {
        return this.createQuery().first();
    };
    StateDao.COLLECTION_NAME = 'state';
    return StateDao;
}(BaseDao));

var DeactivatedDao = /** @class */ (function (_super) {
    __extends(DeactivatedDao, _super);
    function DeactivatedDao(db) {
        return _super.call(this, DeactivatedDao.COLLECTION_NAME, db) || this;
    }
    DeactivatedDao.COLLECTION_NAME = 'deactivated';
    return DeactivatedDao;
}(BaseDao));

var Manager = /** @class */ (function () {
    function Manager() {
        this.instances = new Map();
    }
    Manager.prototype.get = function (Class) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var instance;
        if (!this.instances.has(Class)) {
            this.instances.set(Class, new (Class.bind.apply(Class, __spread([void 0], args)))());
        }
        instance = this.instances.get(Class);
        return instance;
    };
    Manager.prototype.destroy = function () {
        this.clear();
    };
    Manager.prototype.clear = function () {
        this.instances.clear();
    };
    Object.defineProperty(Manager.prototype, "size", {
        get: function () {
            return this.instances.size;
        },
        enumerable: true,
        configurable: true
    });
    return Manager;
}());

var DaoManager = /** @class */ (function (_super) {
    __extends(DaoManager, _super);
    function DaoManager() {
        var _this = _super.call(this) || this;
        _this.kvStorageManager = new KVStorageManager();
        _this.dbManager = new DBManager();
        return _this;
    }
    DaoManager.prototype.initDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            var db;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.dbManager.initDatabase(schema);
                        if (!!this._isSchemaCompatible()) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.dbManager.deleteDatabase()];
                    case 1:
                        _a.sent();
                        this.getKVDao(ConfigDao).remove(LAST_INDEX_TIMESTAMP);
                        _a.label = 2;
                    case 2:
                        db = this.dbManager.getDatabase();
                        if (db instanceof DexieDB) {
                            db.db.on('ready', function () {
                                _this.getKVDao(ConfigDao).put(DB_SCHEMA_VERSION, schema.version);
                            });
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    DaoManager.prototype.openDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.dbManager.openDatabase()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DaoManager.prototype.closeDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.dbManager.closeDatabase()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DaoManager.prototype.deleteDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.kvStorageManager.clear();
                        return [4 /*yield*/, this.dbManager.deleteDatabase()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DaoManager.prototype.isDatabaseOpen = function () {
        return this.dbManager && this.dbManager.isDatabaseOpen();
    };
    DaoManager.prototype.getDao = function (DaoClass) {
        var database = this.dbManager.getDatabase();
        return this.get(DaoClass, database);
    };
    DaoManager.prototype.getKVDao = function (KVDaoClass) {
        var storage = this.kvStorageManager.getStorage();
        return this.get(KVDaoClass, storage);
    };
    DaoManager.prototype.getStorageQuotaOccupation = function () {
        return __awaiter(this, void 0, void 0, function () {
            var navigator, estimate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        navigator = window.navigator;
                        if (!(navigator && navigator.storage)) return [3 /*break*/, 2];
                        return [4 /*yield*/, navigator.storage.estimate()];
                    case 1:
                        estimate = _a.sent();
                        return [2 /*return*/, estimate.usage / estimate.quota];
                    case 2: return [2 /*return*/, 0];
                }
            });
        });
    };
    DaoManager.prototype._isSchemaCompatible = function () {
        var currentSchemaVersion = this.getKVDao(ConfigDao).get(DB_SCHEMA_VERSION);
        return typeof currentSchemaVersion === 'number' && currentSchemaVersion === schema.version;
    };
    return DaoManager;
}(Manager));

/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-05-23 09:42:06
 * Copyright © RingCentral. All rights reserved.
 */
var daoManager = new DaoManager();

var index$1 = /*#__PURE__*/Object.freeze({
    daoManager: daoManager,
    schema: schema,
    AccountDao: AccountDao,
    AuthDao: AuthDao,
    CompanyDao: CompanyDao,
    ConfigDao: ConfigDao,
    GroupDao: GroupDao,
    GroupStateDao: GroupStateDao,
    ItemDao: ItemDao,
    PersonDao: PersonDao,
    PostDao: PostDao,
    ProfileDao: ProfileDao,
    StateDao: StateDao,
    DeactivatedDao: DeactivatedDao,
    BaseDao: BaseDao,
    BaseKVDao: BaseKVDao,
    Query: Query,
    STORAGE_TYPES: STORAGE_TYPES
});

var _this = undefined;
var isObject = function (value) { return Object.prototype.toString.call(value) === '[object Object]'; };
// const isArray = value => Object.prototype.toString.call(value) === '[object Array]';
// const isBoolean = value => Object.prototype.toString.call(value) === '[object Boolean]';
// const isNumber = value => Object.prototype.toString.call(value) === '[object Number]';
// const isString = value => Object.prototype.toString.call(value) === '[object String]';
// const isNull = value => Object.prototype.toString.call(value) === '[object Null]';
// const isUndefined = value => Object.prototype.toString.call(value) === '[object Undefined]';
var isFunction = function (value) { return Object.prototype.toString.call(value) === '[object Function]'; };
// const isRegExp = value => Object.prototype.toString.call(value) === '[object RegExp]';
var isIEOrEdge = typeof navigator !== 'undefined'
    && /(MSIE|Trident|Edge)/.test(navigator.userAgent);
var transform = function (item) {
    if (isObject(item)) {
        /* eslint-disable no-underscore-dangle, no-param-reassign */
        item.id = item.id || item._id || 0;
        delete item._id;
        /* eslint-enable no-underscore-dangle, no-param-reassign */
    }
    return item;
};
var transformAll = function (target) {
    var arr = Array.isArray(target) ? target : [target];
    return arr.map(function (obj) { return transform(obj); });
};
var baseHandleData = function (_a) {
    var data = _a.data, dao = _a.dao, eventKey = _a.eventKey;
    return __awaiter(_this, void 0, void 0, function () {
        var deactivatedData, normalData, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, , 7]);
                    deactivatedData = data.filter(function (item) { return item.deactivated === true; });
                    if (!(deactivatedData.length > 0)) return [3 /*break*/, 3];
                    return [4 /*yield*/, daoManager.getDao(DeactivatedDao).bulkPut(deactivatedData)];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, dao.bulkDelete(deactivatedData.map(function (item) { return item.id; }))];
                case 2:
                    _b.sent();
                    notificationCenter.emitEntityDelete(eventKey, deactivatedData);
                    _b.label = 3;
                case 3:
                    normalData = data.filter(function (item) { return item.deactivated !== true; });
                    if (!(normalData.length > 0)) return [3 /*break*/, 5];
                    return [4 /*yield*/, dao.bulkPut(normalData)];
                case 4:
                    _b.sent();
                    notificationCenter.emitEntityPut(eventKey, normalData);
                    _b.label = 5;
                case 5: return [2 /*return*/, normalData];
                case 6:
                    e_1 = _b.sent();
                    mainLogger.error(e_1);
                    return [2 /*return*/, []];
                case 7: return [2 /*return*/];
            }
        });
    });
};

var EVENT_SUPPORTED_SERVICE_CHANGE = 'SUPPORTED_SERVICE_CHANGE';
var AbstractAccount = /** @class */ (function (_super) {
    __extends(AbstractAccount, _super);
    function AbstractAccount() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._supportedServices = [];
        return _this;
    }
    AbstractAccount.prototype.getSupportedServices = function () {
        return this._supportedServices;
    };
    AbstractAccount.prototype.setSupportedServices = function (services) {
        var newServices = _.difference(services, this._supportedServices);
        var removedServices = _.difference(this._supportedServices, services);
        this._supportedServices = services;
        if (newServices.length > 0) {
            this.emit(EVENT_SUPPORTED_SERVICE_CHANGE, newServices, true);
        }
        if (removedServices.length > 0) {
            this.emit(EVENT_SUPPORTED_SERVICE_CHANGE, removedServices, false);
        }
    };
    AbstractAccount.EVENT_SUPPORTED_SERVICE_CHANGE = EVENT_SUPPORTED_SERVICE_CHANGE;
    return AbstractAccount;
}(EventEmitter2));

var EVENT_LOGIN = 'ACCOUNT_MANAGER.EVENT_LOGIN';
var EVENT_LOGOUT = 'ACCOUNT_MANAGER.EVENT_LOGOUT';
var EVENT_SUPPORTED_SERVICE_CHANGE$1 = 'ACCOUNT_MANAGER.EVENT_SUPPORTED_SERVICE_CHANGE';
var AccountManager = /** @class */ (function (_super) {
    __extends(AccountManager, _super);
    function AccountManager(_container) {
        var _this = _super.call(this) || this;
        _this._container = _container;
        _this._isLogin = false;
        _this._accountMap = new Map();
        _this._accounts = [];
        return _this;
    }
    AccountManager.prototype.syncLogin = function (authType, params) {
        var authenticator = this._container.get(authType);
        var resp = authenticator.authenticate(params);
        return this._handleLoginResponse(resp);
    };
    AccountManager.prototype.login = function (authType, params) {
        return __awaiter(this, void 0, void 0, function () {
            var authenticator, resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        authenticator = this._container.get(authType);
                        return [4 /*yield*/, authenticator.authenticate(params)];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, this._handleLoginResponse(resp)];
                }
            });
        });
    };
    AccountManager.prototype.logout = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._accountMap.clear();
                        this._accounts = [];
                        return [4 /*yield*/, this.emitAsync(EVENT_LOGOUT)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AccountManager.prototype.getAccount = function (type) {
        return this._accountMap.get(type) || null;
    };
    AccountManager.prototype.hasAccount = function (type) {
        return this._accountMap.has(type);
    };
    AccountManager.prototype.isLoggedInFor = function (type) {
        return this.hasAccount(type);
    };
    AccountManager.prototype.isLoggedIn = function () {
        return this._isLogin;
    };
    AccountManager.prototype.updateSupportedServices = function (data) {
        this._accounts.forEach(function (account) { return account.updateSupportedServices(data); });
    };
    AccountManager.prototype.getSupportedServices = function () {
        var servicesArray = this._accounts.map(function (account) { return account.getSupportedServices(); });
        return _.flatten(servicesArray);
    };
    AccountManager.prototype.isSupportedService = function (type) {
        var services = this.getSupportedServices();
        return services.includes(type);
    };
    AccountManager.prototype._createAccounts = function (accountInfos) {
        var _this = this;
        var accounts = accountInfos.map(function (_a) {
            var type = _a.type;
            var account = _this._container.get(type);
            _this._accountMap.set(type, account);
            _this._accounts.push(account);
            account.on(AbstractAccount.EVENT_SUPPORTED_SERVICE_CHANGE, function (services, isStart) {
                return _this.emit(EVENT_SUPPORTED_SERVICE_CHANGE$1, services, isStart);
            });
            return account;
        });
        return accounts;
    };
    AccountManager.prototype._handleLoginResponse = function (resp) {
        if (!resp.accountInfos || resp.accountInfos.length <= 0) {
            return { success: false, error: new Error('Auth fail') };
        }
        this.emit(EVENT_LOGIN, resp.accountInfos);
        this._isLogin = true;
        var accounts = this._createAccounts(resp.accountInfos);
        return {
            accounts: accounts,
            success: true,
        };
    };
    AccountManager.EVENT_LOGIN = EVENT_LOGIN;
    AccountManager.EVENT_LOGOUT = EVENT_LOGOUT;
    AccountManager.EVENT_SUPPORTED_SERVICE_CHANGE = EVENT_SUPPORTED_SERVICE_CHANGE$1;
    return AccountManager;
}(EventEmitter2));

/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-06-24 13:47:01
 * Copyright © RingCentral. All rights reserved
*/
var AbstractService = /** @class */ (function () {
    function AbstractService() {
        this._isStarted = false;
    }
    AbstractService.prototype.start = function () {
        this._isStarted = true;
        this.onStarted();
    };
    AbstractService.prototype.stop = function () {
        this._isStarted = false;
        this.onStopped();
    };
    AbstractService.prototype.isStarted = function () {
        return this._isStarted;
    };
    return AbstractService;
}());

var ServiceManager = /** @class */ (function (_super) {
    __extends(ServiceManager, _super);
    function ServiceManager(_container) {
        var _this = _super.call(this) || this;
        _this._container = _container;
        _this._serviceMap = new Map();
        return _this;
    }
    ServiceManager.prototype.getServices = function (names) {
        var services = [];
        this._serviceMap.forEach(function (service, name) {
            if (names.includes(name)) {
                services.push(service);
            }
        });
        return services;
    };
    ServiceManager.prototype.getAllServices = function () {
        var services = [];
        this._serviceMap.forEach(function (value) { return services.push(value); });
        return services;
    };
    ServiceManager.prototype.getAllServiceNames = function () {
        var names = [];
        this._serviceMap.forEach(function (service, name) { return names.push(name); });
        return names;
    };
    ServiceManager.prototype.getService = function (name) {
        return this._serviceMap.get(name) || null;
    };
    ServiceManager.prototype.startService = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var service;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        service = this.getService(name);
                        if (!!service) return [3 /*break*/, 3];
                        if (!this._container.isAsync(name)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._container.asyncGet(name)];
                    case 1:
                        service = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        service = this._container.get(name);
                        _a.label = 3;
                    case 3:
                        if (!service.isStarted()) {
                            service.start();
                        }
                        this._serviceMap.set(name, service);
                        return [2 /*return*/, service];
                }
            });
        });
    };
    ServiceManager.prototype.startServices = function (services) {
        return __awaiter(this, void 0, void 0, function () {
            var promises;
            var _this = this;
            return __generator(this, function (_a) {
                promises = services.map(function (service) { return _this.startService(service); });
                return [2 /*return*/, Promise.all(promises)];
            });
        });
    };
    ServiceManager.prototype.stopService = function (name) {
        var service = this.getService(name);
        if (service) {
            service.stop();
            this._serviceMap.delete(name);
        }
    };
    ServiceManager.prototype.stopServices = function (services) {
        var _this = this;
        services.forEach(function (service) {
            _this.stopService(service);
        });
    };
    ServiceManager.prototype.stopAllServices = function () {
        var _this = this;
        this.getAllServiceNames().forEach(function (service) { return _this.stopService(service); });
    };
    return ServiceManager;
}(EventEmitter2));

var RegisterType;
(function (RegisterType) {
    RegisterType["ConstantValue"] = "ConstantValue";
    RegisterType["Constructor"] = "Constructor";
    RegisterType["DynamicValue"] = "DynamicValue";
    RegisterType["Factory"] = "Factory";
    RegisterType["Function"] = "Function";
    RegisterType["Instance"] = "Instance";
    RegisterType["Invalid"] = "Invalid";
    RegisterType["Provider"] = "Provider";
})(RegisterType || (RegisterType = {}));
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
            type: RegisterType.Instance,
            implementationType: config.value,
            singleton: config.singleton,
            injects: config.injects,
        };
        this._registrationMap.set(config.name, registration);
    };
    Container.prototype.registerAsyncClass = function (config) {
        var registration = {
            type: RegisterType.Instance,
            asyncImplementationType: config.value,
            singleton: config.singleton,
            injects: config.injects,
            async: true,
        };
        this._registrationMap.set(config.name, registration);
    };
    Container.prototype.registerProvider = function (config) {
        var registration = {
            type: RegisterType.Provider,
            provider: config.value,
            async: config.async,
            injects: config.injects,
        };
        this._registrationMap.set(config.name, registration);
    };
    Container.prototype.registerConstantValue = function (config) {
        var registration = {
            type: RegisterType.ConstantValue,
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
        if (registration.type === RegisterType.ConstantValue) {
            result = registration.cache;
        }
        else if (registration.type === RegisterType.Instance && registration.implementationType) {
            result = this._resolveInstance(registration.implementationType, injections);
        }
        else if (registration.type === RegisterType.Provider && registration.provider) {
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
                if (registration.type === RegisterType.Instance &&
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

/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-07-06 17:27:18
 * Copyright © RingCentral. All rights reserved.
 */
var container = new Container({
    singleton: true,
});

var DataDispatcher = /** @class */ (function (_super) {
    __extends(DataDispatcher, _super);
    function DataDispatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataDispatcher.prototype.register = function (key, dataHandler) {
        console.info('DataDispatcher registing', key);
        this.on(key, dataHandler);
    };
    DataDispatcher.prototype.unregister = function (key, dataHandler) {
        console.info('DataDispatcher unregistering', key);
        this.off(key, dataHandler);
    };
    DataDispatcher.prototype.onDataArrived = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var messages;
            return __generator(this, function (_a) {
                messages = parseSocketMessage(data);
                console.info('DataDispatcher handling', Object.keys(messages));
                return [2 /*return*/, Promise.all(Object
                        .entries(messages)
                        .map(this._emitMessageAsync.bind(this)))];
            });
        });
    };
    DataDispatcher.prototype._emitMessageAsync = function (_a) {
        var _b = __read(_a, 2), key = _b[0], message = _b[1];
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_c) {
                return [2 /*return*/, this.emitAsync("SOCKET." + key.toUpperCase(), message)];
            });
        });
    };
    return DataDispatcher;
}(EventEmitter2));
var dataDispatcher = new DataDispatcher();

var throwError = function (text) {
    throw new Error(
    // tslint:disable-next-line:max-line-length
    text + " is undefined! " + text + " must be passed to Service constructor like this super(DaoClass, ApiClass, handleData)");
};
var BaseService = /** @class */ (function (_super) {
    __extends(BaseService, _super);
    function BaseService(DaoClass, ApiClass, handleData, _subscriptions) {
        if (_subscriptions === void 0) { _subscriptions = {}; }
        var _this = _super.call(this) || this;
        _this.DaoClass = DaoClass;
        _this.ApiClass = ApiClass;
        _this.handleData = handleData;
        _this._subscriptions = _subscriptions;
        mainLogger.info('BaseService constructor');
        return _this;
    }
    BaseService.getInstance = function () {
        return container.get(this.name);
    };
    BaseService.prototype.getById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getByIdFromDao(id)];
                    case 1:
                        result = _a.sent();
                        if (!!result) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.getByIdFromAPI(id)];
                    case 2:
                        result = _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, result];
                }
            });
        });
    };
    BaseService.prototype.getByIdFromDao = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var dao, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._checkDaoClass();
                        dao = daoManager.getDao(this.DaoClass);
                        return [4 /*yield*/, dao.get(id)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result || daoManager.getDao(DeactivatedDao).get(id)];
                }
            });
        });
    };
    BaseService.prototype.getByIdFromAPI = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result, arr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.ApiClass || !isFunction(this.handleData)) {
                            throwError('ApiClass || HandleData');
                        }
                        if (id <= 0) {
                            throwError('invalid id, should not do network request');
                        }
                        return [4 /*yield*/, this.ApiClass.getDataById(id)];
                    case 1:
                        result = _a.sent();
                        if (!(result && result.data)) return [3 /*break*/, 3];
                        arr = [].concat(result.data).map(transform);
                        return [4 /*yield*/, this.handleData(arr)];
                    case 2:
                        _a.sent();
                        result = arr.length > 0 ? arr[0] : null;
                        _a.label = 3;
                    case 3: return [2 /*return*/, result];
                }
            });
        });
    };
    BaseService.prototype.getAllFromDao = function (_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.offset, offset = _c === void 0 ? 0 : _c, _d = _b.limit, limit = _d === void 0 ? Infinity : _d;
        return __awaiter(this, void 0, void 0, function () {
            var dao;
            return __generator(this, function (_e) {
                this._checkDaoClass();
                dao = daoManager.getDao(this.DaoClass);
                return [2 /*return*/, dao
                        .createQuery()
                        .offset(offset)
                        .limit(limit)
                        .toArray()];
            });
        });
    };
    BaseService.prototype.getAll = function (_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.offset, offset = _c === void 0 ? 0 : _c, _d = _b.limit, limit = _d === void 0 ? Infinity : _d;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_e) {
                return [2 /*return*/, this.getAllFromDao({ offset: offset, limit: limit })];
            });
        });
    };
    BaseService.prototype.onStarted = function () {
        this._subscribe();
    };
    BaseService.prototype.onStopped = function () {
        this._unsubscribe();
    };
    BaseService.prototype._subscribe = function () {
        Object.entries(this._subscriptions).forEach(function (_a) {
            var _b = __read(_a, 2), eventName = _b[0], fn = _b[1];
            if (eventName.startsWith('SOCKET')) {
                return dataDispatcher.register(eventName, fn);
            }
            notificationCenter.on(eventName, fn);
        });
    };
    BaseService.prototype._unsubscribe = function () {
        Object.entries(this._subscriptions).forEach(function (_a) {
            var _b = __read(_a, 2), eventName = _b[0], fn = _b[1];
            if (eventName.startsWith('SOCKET')) {
                return dataDispatcher.unregister(eventName, fn);
            }
            notificationCenter.off(eventName, fn);
        });
    };
    BaseService.prototype._checkDaoClass = function () {
        if (!this.DaoClass) {
            throwError('DaoClass');
        }
        return true;
    };
    BaseService.serviceName = 'BaseService';
    return BaseService;
}(AbstractService));

/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-07-12 13:59:49
 * Copyright © RingCentral. All rights reserved
*/
var AccountService = /** @class */ (function (_super) {
    __extends(AccountService, _super);
    function AccountService() {
        var _this = _super.call(this) || this;
        _this.accountDao = daoManager.getKVDao(AccountDao);
        return _this;
    }
    AccountService.prototype.getCurrentUserId = function () {
        var userId = this.accountDao.get(ACCOUNT_USER_ID);
        if (!userId) {
            mainLogger.warn('there is not UserId Id');
            return null;
        }
        return Number(userId);
    };
    AccountService.prototype.getCurrentUserProfileId = function () {
        var profileId = this.accountDao.get(ACCOUNT_PROFILE_ID);
        if (!profileId) {
            mainLogger.warn('there is not profile Id');
            return null;
        }
        return Number(profileId);
    };
    AccountService.prototype.getCurrentCompanyId = function () {
        var companyId = this.accountDao.get(ACCOUNT_COMPANY_ID);
        if (!companyId) {
            mainLogger.warn('there is not companyId Id');
            return null;
        }
        return Number(companyId);
    };
    AccountService.prototype.getCurrentUserInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var userId, company_id, personDao, personInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userId = Number(this.accountDao.get(ACCOUNT_USER_ID));
                        company_id = Number(this.accountDao.get(ACCOUNT_COMPANY_ID));
                        if (!userId)
                            return [2 /*return*/, {}];
                        personDao = daoManager.getDao(PersonDao);
                        return [4 /*yield*/, personDao.get(userId)];
                    case 1:
                        personInfo = _a.sent();
                        if (!personInfo)
                            return [2 /*return*/, {}];
                        mainLogger.debug("getCurrentUserInfo: " + personInfo);
                        return [2 /*return*/, {
                                company_id: company_id,
                                email: personInfo.email,
                                display_name: personInfo.display_name,
                            }];
                }
            });
        });
    };
    AccountService.prototype.getUserEmail = function () {
        return __awaiter(this, void 0, void 0, function () {
            var userId, personDao, personInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userId = Number(this.accountDao.get(ACCOUNT_USER_ID));
                        if (!userId)
                            return [2 /*return*/, ''];
                        personDao = daoManager.getDao(PersonDao);
                        return [4 /*yield*/, personDao.get(userId)];
                    case 1:
                        personInfo = _a.sent();
                        if (!personInfo)
                            return [2 /*return*/, ''];
                        return [2 /*return*/, personInfo.email];
                }
            });
        });
    };
    AccountService.prototype.getClientId = function () {
        var configDao = daoManager.getKVDao(ConfigDao);
        var id = configDao.get(CLIENT_ID);
        if (id) {
            return id;
        }
        id = generateUUID();
        configDao.put(CLIENT_ID, id);
        return id;
    };
    AccountService.serviceName = 'AccountService';
    return AccountService;
}(BaseService));

/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-02-05 15:07:23
 * Copyright © RingCentral. All rights reserved.
 */
var GET = NETWORK_METHOD.GET, DELETE = NETWORK_METHOD.DELETE;
var NetworkClient = /** @class */ (function () {
    // todo refactor config
    function NetworkClient(networkRequests, apiPlatform) {
        this.apiPlatform = apiPlatform;
        this.networkRequests = networkRequests;
        this.apiMap = new Map();
    }
    NetworkClient.prototype.request = function (query) {
        var _this = this;
        var via = query.via, path = query.path, method = query.method, params = query.params;
        return new Promise(function (resolve, reject) {
            var apiMapKey = path + "_" + method + "_" + serializeUrlParams(params || {});
            var duplicate = _this._isDuplicate(method, apiMapKey);
            var promiseResolvers = _this.apiMap.get(apiMapKey) || [];
            promiseResolvers.push({ resolve: resolve, reject: reject });
            _this.apiMap.set(apiMapKey, promiseResolvers);
            if (!duplicate) {
                var request = _this.getRequestByVia(query, via);
                request.callback = _this.buildCallback(apiMapKey);
                NetworkManager.Instance.addApiRequest(request);
            }
        });
    };
    NetworkClient.prototype.buildCallback = function (apiMapKey) {
        var _this = this;
        return function (resp) {
            var promiseResolvers = _this.apiMap.get(apiMapKey);
            if (!promiseResolvers)
                return;
            if (resp.status >= 200 && resp.status < 300) {
                promiseResolvers.forEach(function (_a) {
                    var resolve = _a.resolve;
                    return resolve({
                        status: resp.status,
                        headers: resp.headers,
                        data: resp.data,
                    });
                });
            }
            else {
                promiseResolvers.forEach(function (_a) {
                    var reject = _a.reject;
                    console.log('Network reject', resp);
                    reject(resp);
                });
            }
            _this.apiMap.delete(apiMapKey);
        };
    };
    NetworkClient.prototype.getRequestByVia = function (query, via) {
        if (via === void 0) { via = NETWORK_VIA.HTTP; }
        var path = query.path, method = query.method, data = query.data, headers = query.headers, params = query.params, authFree = query.authFree, requestConfig = query.requestConfig;
        return new NetworkRequestBuilder()
            .setHost(this.networkRequests.host || '')
            .setHandlerType(this.networkRequests.handlerType)
            .setPath("" + this.apiPlatform + path)
            .setMethod(method)
            .setData(data)
            .setHeaders(headers || {})
            .setParams(params)
            .setAuthfree(authFree || false)
            .setRequestConfig(requestConfig || {})
            .setVia(via)
            .build();
        // return via !== 'http' && this.type === 'glip'
        //   ? new SocketRequestBuilder(requestQuery).build()
        //   : new NetworkRequestBuilder(requestQuery);
    };
    NetworkClient.prototype.http = function (query) {
        return this.request(query);
    };
    /**
     * @export
     * @param {String} path request url
     * @param {Object} [data={}] request params
     * @param {Object} [data={}] request headers
     * @returns Promise
     */
    NetworkClient.prototype.get = function (path, params, via, requestConfig, headers) {
        if (params === void 0) { params = {}; }
        if (headers === void 0) { headers = {}; }
        return this.http({
            path: path,
            params: params,
            headers: headers,
            via: via,
            requestConfig: requestConfig,
            method: NETWORK_METHOD.GET,
        });
    };
    /**
     * @export
     * @param {String} path request url
     * @param {Object} [data={}] request params
     * @param {Object} [data={}] request headers
     * @returns Promise
     */
    NetworkClient.prototype.post = function (path, data, headers) {
        if (data === void 0) { data = {}; }
        if (headers === void 0) { headers = {}; }
        return this.request({
            path: path,
            data: data,
            headers: headers,
            method: NETWORK_METHOD.POST,
        });
    };
    /**
     * @export
     * @param {String} path request url
     * @param {Object} [data={}] request params
     * @param {Object} [data={}] request headers
     * @returns Promise
     */
    NetworkClient.prototype.put = function (path, data, headers) {
        if (data === void 0) { data = {}; }
        if (headers === void 0) { headers = {}; }
        return this.http({
            path: path,
            data: data,
            headers: headers,
            method: NETWORK_METHOD.PUT,
        });
    };
    /**
     * @export
     * @param {String} path request url
     * @param {Object} [data={}] request params
     * @param {Object} [data={}] request headers
     * @returns Promise
     */
    NetworkClient.prototype.delete = function (path, params, headers) {
        if (params === void 0) { params = {}; }
        if (headers === void 0) { headers = {}; }
        return this.http({
            path: path,
            params: params,
            headers: headers,
            method: NETWORK_METHOD.DELETE,
        });
    };
    NetworkClient.prototype._isDuplicate = function (method, apiMapKey) {
        if (method !== GET && method !== DELETE) {
            return false;
        }
        return this.apiMap.has(apiMapKey);
    };
    return NetworkClient;
}());

var defaultConfig = {
    rc: {
        server: '',
        apiPlatform: '',
        apiPlatformVersion: '',
        clientId: '',
        clientSecret: '',
        redirectUri: '',
    },
    glip: {
        server: '',
        apiPlatform: '',
    },
    glip2: {
        server: '',
        apiPlatform: '',
        apiPlatformVersion: '',
        clientId: '',
        clientSecret: '',
        redirectUri: '',
        brandId: 0,
    },
    upload: {
        server: '',
        apiPlatform: '',
    },
};

var HandleByGlip = new /** @class */ (function (_super) {
    __extends(class_1, _super);
    function class_1() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    class_1.prototype.requestDecoration = function (tokenHandler) {
        var handler = tokenHandler;
        return function (request) {
            if (request.needAuth()) {
                if (_.isEmpty(handler)) {
                    throw new Error('token handler can not be null.');
                }
                if (handler && handler.isOAuthTokenAvailable()) {
                    request.params = __assign({}, request.params, { tk: handler.accessToken() });
                }
            }
            return request;
        };
    };
    return class_1;
}(AbstractHandleType))();

var has = Object.prototype.hasOwnProperty;

var hexTable = (function () {
    var array = [];
    for (var i = 0; i < 256; ++i) {
        array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
    }

    return array;
}());

var compactQueue = function compactQueue(queue) {
    var obj;

    while (queue.length) {
        var item = queue.pop();
        obj = item.obj[item.prop];

        if (Array.isArray(obj)) {
            var compacted = [];

            for (var j = 0; j < obj.length; ++j) {
                if (typeof obj[j] !== 'undefined') {
                    compacted.push(obj[j]);
                }
            }

            item.obj[item.prop] = compacted;
        }
    }

    return obj;
};

var arrayToObject = function arrayToObject(source, options) {
    var obj = options && options.plainObjects ? Object.create(null) : {};
    for (var i = 0; i < source.length; ++i) {
        if (typeof source[i] !== 'undefined') {
            obj[i] = source[i];
        }
    }

    return obj;
};

var merge$1 = function merge$$1(target, source, options) {
    if (!source) {
        return target;
    }

    if (typeof source !== 'object') {
        if (Array.isArray(target)) {
            target.push(source);
        } else if (typeof target === 'object') {
            if (options.plainObjects || options.allowPrototypes || !has.call(Object.prototype, source)) {
                target[source] = true;
            }
        } else {
            return [target, source];
        }

        return target;
    }

    if (typeof target !== 'object') {
        return [target].concat(source);
    }

    var mergeTarget = target;
    if (Array.isArray(target) && !Array.isArray(source)) {
        mergeTarget = arrayToObject(target, options);
    }

    if (Array.isArray(target) && Array.isArray(source)) {
        source.forEach(function (item, i) {
            if (has.call(target, i)) {
                if (target[i] && typeof target[i] === 'object') {
                    target[i] = merge$$1(target[i], item, options);
                } else {
                    target.push(item);
                }
            } else {
                target[i] = item;
            }
        });
        return target;
    }

    return Object.keys(source).reduce(function (acc, key) {
        var value = source[key];

        if (has.call(acc, key)) {
            acc[key] = merge$$1(acc[key], value, options);
        } else {
            acc[key] = value;
        }
        return acc;
    }, mergeTarget);
};

var assign = function assignSingleSource(target, source) {
    return Object.keys(source).reduce(function (acc, key) {
        acc[key] = source[key];
        return acc;
    }, target);
};

var decode = function (str) {
    try {
        return decodeURIComponent(str.replace(/\+/g, ' '));
    } catch (e) {
        return str;
    }
};

var encode = function encode(str) {
    // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
    // It has been adapted here for stricter adherence to RFC 3986
    if (str.length === 0) {
        return str;
    }

    var string = typeof str === 'string' ? str : String(str);

    var out = '';
    for (var i = 0; i < string.length; ++i) {
        var c = string.charCodeAt(i);

        if (
            c === 0x2D // -
            || c === 0x2E // .
            || c === 0x5F // _
            || c === 0x7E // ~
            || (c >= 0x30 && c <= 0x39) // 0-9
            || (c >= 0x41 && c <= 0x5A) // a-z
            || (c >= 0x61 && c <= 0x7A) // A-Z
        ) {
            out += string.charAt(i);
            continue;
        }

        if (c < 0x80) {
            out = out + hexTable[c];
            continue;
        }

        if (c < 0x800) {
            out = out + (hexTable[0xC0 | (c >> 6)] + hexTable[0x80 | (c & 0x3F)]);
            continue;
        }

        if (c < 0xD800 || c >= 0xE000) {
            out = out + (hexTable[0xE0 | (c >> 12)] + hexTable[0x80 | ((c >> 6) & 0x3F)] + hexTable[0x80 | (c & 0x3F)]);
            continue;
        }

        i += 1;
        c = 0x10000 + (((c & 0x3FF) << 10) | (string.charCodeAt(i) & 0x3FF));
        out += hexTable[0xF0 | (c >> 18)]
            + hexTable[0x80 | ((c >> 12) & 0x3F)]
            + hexTable[0x80 | ((c >> 6) & 0x3F)]
            + hexTable[0x80 | (c & 0x3F)];
    }

    return out;
};

var compact = function compact(value) {
    var queue = [{ obj: { o: value }, prop: 'o' }];
    var refs = [];

    for (var i = 0; i < queue.length; ++i) {
        var item = queue[i];
        var obj = item.obj[item.prop];

        var keys = Object.keys(obj);
        for (var j = 0; j < keys.length; ++j) {
            var key = keys[j];
            var val = obj[key];
            if (typeof val === 'object' && val !== null && refs.indexOf(val) === -1) {
                queue.push({ obj: obj, prop: key });
                refs.push(val);
            }
        }
    }

    return compactQueue(queue);
};

var isRegExp = function isRegExp(obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
};

var isBuffer = function isBuffer(obj) {
    if (obj === null || typeof obj === 'undefined') {
        return false;
    }

    return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
};

var utils = {
    arrayToObject: arrayToObject,
    assign: assign,
    compact: compact,
    decode: decode,
    encode: encode,
    isBuffer: isBuffer,
    isRegExp: isRegExp,
    merge: merge$1
};

var replace = String.prototype.replace;
var percentTwenties = /%20/g;

var formats = {
    'default': 'RFC3986',
    formatters: {
        RFC1738: function (value) {
            return replace.call(value, percentTwenties, '+');
        },
        RFC3986: function (value) {
            return value;
        }
    },
    RFC1738: 'RFC1738',
    RFC3986: 'RFC3986'
};

var arrayPrefixGenerators = {
    brackets: function brackets(prefix) { // eslint-disable-line func-name-matching
        return prefix + '[]';
    },
    indices: function indices(prefix, key) { // eslint-disable-line func-name-matching
        return prefix + '[' + key + ']';
    },
    repeat: function repeat(prefix) { // eslint-disable-line func-name-matching
        return prefix;
    }
};

var toISO = Date.prototype.toISOString;

var defaults = {
    delimiter: '&',
    encode: true,
    encoder: utils.encode,
    encodeValuesOnly: false,
    serializeDate: function serializeDate(date) { // eslint-disable-line func-name-matching
        return toISO.call(date);
    },
    skipNulls: false,
    strictNullHandling: false
};

var stringify = function stringify( // eslint-disable-line func-name-matching
    object,
    prefix,
    generateArrayPrefix,
    strictNullHandling,
    skipNulls,
    encoder,
    filter,
    sort,
    allowDots,
    serializeDate,
    formatter,
    encodeValuesOnly
) {
    var obj = object;
    if (typeof filter === 'function') {
        obj = filter(prefix, obj);
    } else if (obj instanceof Date) {
        obj = serializeDate(obj);
    } else if (obj === null) {
        if (strictNullHandling) {
            return encoder && !encodeValuesOnly ? encoder(prefix, defaults.encoder) : prefix;
        }

        obj = '';
    }

    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean' || utils.isBuffer(obj)) {
        if (encoder) {
            var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder);
            return [formatter(keyValue) + '=' + formatter(encoder(obj, defaults.encoder))];
        }
        return [formatter(prefix) + '=' + formatter(String(obj))];
    }

    var values = [];

    if (typeof obj === 'undefined') {
        return values;
    }

    var objKeys;
    if (Array.isArray(filter)) {
        objKeys = filter;
    } else {
        var keys = Object.keys(obj);
        objKeys = sort ? keys.sort(sort) : keys;
    }

    for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];

        if (skipNulls && obj[key] === null) {
            continue;
        }

        if (Array.isArray(obj)) {
            values = values.concat(stringify(
                obj[key],
                generateArrayPrefix(prefix, key),
                generateArrayPrefix,
                strictNullHandling,
                skipNulls,
                encoder,
                filter,
                sort,
                allowDots,
                serializeDate,
                formatter,
                encodeValuesOnly
            ));
        } else {
            values = values.concat(stringify(
                obj[key],
                prefix + (allowDots ? '.' + key : '[' + key + ']'),
                generateArrayPrefix,
                strictNullHandling,
                skipNulls,
                encoder,
                filter,
                sort,
                allowDots,
                serializeDate,
                formatter,
                encodeValuesOnly
            ));
        }
    }

    return values;
};

var stringify_1 = function (object, opts) {
    var obj = object;
    var options = opts ? utils.assign({}, opts) : {};

    if (options.encoder !== null && options.encoder !== undefined && typeof options.encoder !== 'function') {
        throw new TypeError('Encoder has to be a function.');
    }

    var delimiter = typeof options.delimiter === 'undefined' ? defaults.delimiter : options.delimiter;
    var strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : defaults.strictNullHandling;
    var skipNulls = typeof options.skipNulls === 'boolean' ? options.skipNulls : defaults.skipNulls;
    var encode = typeof options.encode === 'boolean' ? options.encode : defaults.encode;
    var encoder = typeof options.encoder === 'function' ? options.encoder : defaults.encoder;
    var sort = typeof options.sort === 'function' ? options.sort : null;
    var allowDots = typeof options.allowDots === 'undefined' ? false : options.allowDots;
    var serializeDate = typeof options.serializeDate === 'function' ? options.serializeDate : defaults.serializeDate;
    var encodeValuesOnly = typeof options.encodeValuesOnly === 'boolean' ? options.encodeValuesOnly : defaults.encodeValuesOnly;
    if (typeof options.format === 'undefined') {
        options.format = formats['default'];
    } else if (!Object.prototype.hasOwnProperty.call(formats.formatters, options.format)) {
        throw new TypeError('Unknown format option provided.');
    }
    var formatter = formats.formatters[options.format];
    var objKeys;
    var filter;

    if (typeof options.filter === 'function') {
        filter = options.filter;
        obj = filter('', obj);
    } else if (Array.isArray(options.filter)) {
        filter = options.filter;
        objKeys = filter;
    }

    var keys = [];

    if (typeof obj !== 'object' || obj === null) {
        return '';
    }

    var arrayFormat;
    if (options.arrayFormat in arrayPrefixGenerators) {
        arrayFormat = options.arrayFormat;
    } else if ('indices' in options) {
        arrayFormat = options.indices ? 'indices' : 'repeat';
    } else {
        arrayFormat = 'indices';
    }

    var generateArrayPrefix = arrayPrefixGenerators[arrayFormat];

    if (!objKeys) {
        objKeys = Object.keys(obj);
    }

    if (sort) {
        objKeys.sort(sort);
    }

    for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];

        if (skipNulls && obj[key] === null) {
            continue;
        }

        keys = keys.concat(stringify(
            obj[key],
            key,
            generateArrayPrefix,
            strictNullHandling,
            skipNulls,
            encode ? encoder : null,
            filter,
            sort,
            allowDots,
            serializeDate,
            formatter,
            encodeValuesOnly
        ));
    }

    var joined = keys.join(delimiter);
    var prefix = options.addQueryPrefix === true ? '?' : '';

    return joined.length > 0 ? prefix + joined : '';
};

var has$1 = Object.prototype.hasOwnProperty;

var defaults$1 = {
    allowDots: false,
    allowPrototypes: false,
    arrayLimit: 20,
    decoder: utils.decode,
    delimiter: '&',
    depth: 5,
    parameterLimit: 1000,
    plainObjects: false,
    strictNullHandling: false
};

var parseValues = function parseQueryStringValues(str, options) {
    var obj = {};
    var cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, '') : str;
    var limit = options.parameterLimit === Infinity ? undefined : options.parameterLimit;
    var parts = cleanStr.split(options.delimiter, limit);

    for (var i = 0; i < parts.length; ++i) {
        var part = parts[i];

        var bracketEqualsPos = part.indexOf(']=');
        var pos = bracketEqualsPos === -1 ? part.indexOf('=') : bracketEqualsPos + 1;

        var key, val;
        if (pos === -1) {
            key = options.decoder(part, defaults$1.decoder);
            val = options.strictNullHandling ? null : '';
        } else {
            key = options.decoder(part.slice(0, pos), defaults$1.decoder);
            val = options.decoder(part.slice(pos + 1), defaults$1.decoder);
        }
        if (has$1.call(obj, key)) {
            obj[key] = [].concat(obj[key]).concat(val);
        } else {
            obj[key] = val;
        }
    }

    return obj;
};

var parseObject = function (chain, val, options) {
    var leaf = val;

    for (var i = chain.length - 1; i >= 0; --i) {
        var obj;
        var root = chain[i];

        if (root === '[]') {
            obj = [];
            obj = obj.concat(leaf);
        } else {
            obj = options.plainObjects ? Object.create(null) : {};
            var cleanRoot = root.charAt(0) === '[' && root.charAt(root.length - 1) === ']' ? root.slice(1, -1) : root;
            var index = parseInt(cleanRoot, 10);
            if (
                !isNaN(index)
                && root !== cleanRoot
                && String(index) === cleanRoot
                && index >= 0
                && (options.parseArrays && index <= options.arrayLimit)
            ) {
                obj = [];
                obj[index] = leaf;
            } else {
                obj[cleanRoot] = leaf;
            }
        }

        leaf = obj;
    }

    return leaf;
};

var parseKeys = function parseQueryStringKeys(givenKey, val, options) {
    if (!givenKey) {
        return;
    }

    // Transform dot notation to bracket notation
    var key = options.allowDots ? givenKey.replace(/\.([^.[]+)/g, '[$1]') : givenKey;

    // The regex chunks

    var brackets = /(\[[^[\]]*])/;
    var child = /(\[[^[\]]*])/g;

    // Get the parent

    var segment = brackets.exec(key);
    var parent = segment ? key.slice(0, segment.index) : key;

    // Stash the parent if it exists

    var keys = [];
    if (parent) {
        // If we aren't using plain objects, optionally prefix keys
        // that would overwrite object prototype properties
        if (!options.plainObjects && has$1.call(Object.prototype, parent)) {
            if (!options.allowPrototypes) {
                return;
            }
        }

        keys.push(parent);
    }

    // Loop through children appending to the array until we hit depth

    var i = 0;
    while ((segment = child.exec(key)) !== null && i < options.depth) {
        i += 1;
        if (!options.plainObjects && has$1.call(Object.prototype, segment[1].slice(1, -1))) {
            if (!options.allowPrototypes) {
                return;
            }
        }
        keys.push(segment[1]);
    }

    // If there's a remainder, just add whatever is left

    if (segment) {
        keys.push('[' + key.slice(segment.index) + ']');
    }

    return parseObject(keys, val, options);
};

var parse = function (str, opts) {
    var options = opts ? utils.assign({}, opts) : {};

    if (options.decoder !== null && options.decoder !== undefined && typeof options.decoder !== 'function') {
        throw new TypeError('Decoder has to be a function.');
    }

    options.ignoreQueryPrefix = options.ignoreQueryPrefix === true;
    options.delimiter = typeof options.delimiter === 'string' || utils.isRegExp(options.delimiter) ? options.delimiter : defaults$1.delimiter;
    options.depth = typeof options.depth === 'number' ? options.depth : defaults$1.depth;
    options.arrayLimit = typeof options.arrayLimit === 'number' ? options.arrayLimit : defaults$1.arrayLimit;
    options.parseArrays = options.parseArrays !== false;
    options.decoder = typeof options.decoder === 'function' ? options.decoder : defaults$1.decoder;
    options.allowDots = typeof options.allowDots === 'boolean' ? options.allowDots : defaults$1.allowDots;
    options.plainObjects = typeof options.plainObjects === 'boolean' ? options.plainObjects : defaults$1.plainObjects;
    options.allowPrototypes = typeof options.allowPrototypes === 'boolean' ? options.allowPrototypes : defaults$1.allowPrototypes;
    options.parameterLimit = typeof options.parameterLimit === 'number' ? options.parameterLimit : defaults$1.parameterLimit;
    options.strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : defaults$1.strictNullHandling;

    if (str === '' || str === null || typeof str === 'undefined') {
        return options.plainObjects ? Object.create(null) : {};
    }

    var tempObj = typeof str === 'string' ? parseValues(str, options) : str;
    var obj = options.plainObjects ? Object.create(null) : {};

    // Iterate over the keys and setup the new object

    var keys = Object.keys(tempObj);
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        var newObj = parseKeys(key, tempObj[key], options);
        obj = utils.merge(obj, newObj, options);
    }

    return utils.compact(obj);
};

var lib = {
    formats: formats,
    parse: parse,
    stringify: stringify_1
};
var lib_3 = lib.stringify;

var HandleByGlip2 = new /** @class */ (function (_super) {
    __extends(class_1, _super);
    function class_1() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.tokenRefreshable = true;
        return _this;
    }
    class_1.prototype.basic = function () {
        return btoa(Api.httpConfig.glip2.clientId + ":" + Api.httpConfig.glip2.clientSecret);
    };
    class_1.prototype.requestDecoration = function (tokenHandler) {
        var handler = tokenHandler;
        return function (request) {
            if (_.isEmpty(tokenHandler)) {
                throw new Error('token handler can not be null.');
            }
            var headers = request.headers;
            if (!headers.Authorization) {
                if (request.needAuth() && handler.isOAuthTokenAvailable()) {
                    headers.Authorization = "Bearer " + handler.accessToken();
                }
                else {
                    headers.Authorization = "Basic " + handler.getBasic();
                }
            }
            var authorization = headers.Authorization;
            if (authorization.startsWith('Basic')) {
                request.data = lib_3(request.data);
            }
            return request;
        };
    };
    return class_1;
}(AbstractHandleType))();

var HandleByRingCentral = new /** @class */ (function (_super) {
    __extends(class_1, _super);
    function class_1() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.survivalModeSupportable = true;
        _this.tokenExpirable = true;
        _this.tokenRefreshable = true;
        return _this;
    }
    class_1.prototype.basic = function () {
        return btoa(Api.httpConfig.rc.clientId + ":" + Api.httpConfig.rc.clientSecret);
    };
    class_1.prototype.requestDecoration = function (tokenHandler) {
        var handler = tokenHandler;
        return function (request) {
            if (_.isEmpty(handler)) {
                throw new Error('token handler can not be null.');
            }
            var headers = request.headers;
            if (!headers.Authorization) {
                if (request.needAuth() && handler.isOAuthTokenAvailable()) {
                    headers.Authorization = "Bearer " + handler.accessToken();
                }
                else {
                    headers.Authorization = "Basic " + handler.getBasic();
                }
            }
            var authorization = headers.Authorization;
            if (authorization.startsWith('Basic')) {
                request.data = lib_3(request.data);
            }
            return request;
        };
    };
    return class_1;
}(AbstractHandleType))();

var HandleByUpload = new /** @class */ (function (_super) {
    __extends(class_1, _super);
    function class_1() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.survivalModeSupportable = true;
        return _this;
    }
    class_1.prototype.requestDecoration = function (tokenHandler) {
        var handler = tokenHandler;
        return function (request) {
            if (request.needAuth()) {
                if (_.isEmpty(tokenHandler)) {
                    throw new Error('token handler can not be null.');
                }
                if (handler.isOAuthTokenAvailable()) {
                    request.params = __assign({}, request.params, { tk: handler.accessToken() });
                }
            }
            return request;
        };
    };
    return class_1;
}(AbstractHandleType))();

/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-05-02 16:47:08
 * Copyright © RingCentral. All rights reserved.
 */
var types = [HandleByGlip, HandleByRingCentral, HandleByGlip2, HandleByUpload];
var Api = /** @class */ (function () {
    function Api() {
    }
    Api.init = function (config) {
        this._httpConfig = merge({}, defaultConfig, config);
        NetworkSetup.setup(types);
    };
    Object.defineProperty(Api, "httpConfig", {
        get: function () {
            // TODO httpConfig should be private. but for now, it is
            // directly accessed by the ui layer. That should be refactor.
            // Move logics that access httpConfig into Api in the future.
            // tslint:disable-next-line:max-line-length
            Aware(ErrorTypes.HTTP, 'httpConfig should be private. but it is directly accessed by the ui layer.');
            return this._httpConfig;
        },
        enumerable: true,
        configurable: true
    });
    Api.getNetworkClient = function (name, type) {
        if (!this._httpConfig)
            Throw(ErrorTypes.HTTP, 'Api not initialized');
        var networkClient = this.httpSet.get(name);
        if (!networkClient) {
            var currentConfig = this._httpConfig[name];
            var networkRequests = {
                host: currentConfig.server,
                handlerType: type,
            };
            networkClient = new NetworkClient(networkRequests, currentConfig.apiPlatform);
            this.httpSet.set(name, networkClient);
        }
        return networkClient;
    };
    Object.defineProperty(Api, "glipNetworkClient", {
        get: function () {
            return this.getNetworkClient('glip', HandleByGlip);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Api, "glip2NetworkClient", {
        get: function () {
            return this.getNetworkClient('glip2', HandleByGlip2);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Api, "rcNetworkClient", {
        get: function () {
            return this.getNetworkClient('rc', HandleByRingCentral);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Api, "uploadNetworkClient", {
        get: function () {
            return this.getNetworkClient('upload', HandleByUpload);
        },
        enumerable: true,
        configurable: true
    });
    Api.getDataById = function (id) {
        return this.glipNetworkClient.get(this.basePath + "/" + id);
    };
    Api.postData = function (data) {
        return this.glipNetworkClient.post("" + this.basePath, data);
    };
    Api.putDataById = function (id, data) {
        return this.glipNetworkClient.put(this.basePath + "/" + id, data);
    };
    Api.basePath = '';
    Api.httpSet = new Map();
    return Api;
}());

/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-02-05 15:04:34
 * @Last Modified by: Valor Lin (valor.lin@ringcentral.com)
 * @Last Modified time: 2018-05-17 20:14:39
 */
var RINGCENTRAL_API = {
    API_OAUTH_TOKEN: '/oauth/token',
    API_REFRESH_TOKEN: '/oauth/token',
    API_GENERATE_CODE: '/interop/generate-code',
    API_PROFILE: '/glip/profile',
};

/**
 * @param {string} grant_type
 * @param {string} username
 * @param {string} password
 * return authData for glip login by password
 */
function loginRCByPassword(data) {
    var model = __assign({}, data, { grant_type: 'password' });
    var query = {
        path: RINGCENTRAL_API.API_OAUTH_TOKEN,
        method: NETWORK_METHOD.POST,
        data: model,
        authFree: true,
        via: NETWORK_VIA.HTTP,
    };
    return Api.rcNetworkClient.http(query);
}
/**
 * @param {string} grant_type
 * @param {string} username
 * @param {string} password
 * rc login for glip 2.0 api by password
 */
function loginGlip2ByPassword(data) {
    var model = __assign({}, data, { grant_type: 'password' });
    var query = {
        path: RINGCENTRAL_API.API_OAUTH_TOKEN,
        method: NETWORK_METHOD.POST,
        data: model,
        authFree: true,
        via: NETWORK_VIA.HTTP,
    };
    return Api.glip2NetworkClient.http(query);
}
/**
 * @param {string} refresh_token
 * @param {string} grant_type
 */
function refreshToken(data) {
    var model = __assign({}, data, { grant_type: 'refresh_token' });
    var query = {
        path: RINGCENTRAL_API.API_REFRESH_TOKEN,
        method: NETWORK_METHOD.POST,
        data: model,
        authFree: true,
        via: NETWORK_VIA.HTTP,
    };
    return Api.rcNetworkClient.http(query);
}

/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-02-05 15:04:34
 * @Last Modified by: Shining Miao (shining.miao@ringcentral.com)
 * @Last Modified time: 2018-03-13 10:12:05
 */
var GLIP_API = {
    get API_OAUTH_TOKEN() {
        return '/login';
    },
};

/**
 * @param {string} rcAccessTokenData
 * @param {string} username
 * @param {string} password
 * @param {boolean} mobile(option)
 * get glip 1.0 api's requset header (x-authorization) by authData
 */
function loginGlip(authData) {
    var model = {
        rc_access_token_data: btoa(JSON.stringify(authData)),
    };
    var query = {
        path: GLIP_API.API_OAUTH_TOKEN,
        method: NETWORK_METHOD.PUT,
        data: model,
        authFree: true,
    };
    return Api.glipNetworkClient.http(__assign({}, query, { via: NETWORK_VIA.HTTP }));
}
/**
 * @param {string} rcAccessTokenData
 * @param {string} username
 * @param {string} password
 * index data api
 */
function indexData(params, requestConfig, headers) {
    if (requestConfig === void 0) { requestConfig = {}; }
    if (headers === void 0) { headers = {}; }
    return Api.glipNetworkClient.get('/index', params, NETWORK_VIA.HTTP, requestConfig, headers);
}

/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-05-17 20:35:22
 * Copyright © RingCentral. All rights reserved.
 */

var index$2 = /*#__PURE__*/Object.freeze({
    loginRCByPassword: loginRCByPassword,
    loginGlip2ByPassword: loginGlip2ByPassword,
    refreshToken: refreshToken,
    loginGlip: loginGlip,
    indexData: indexData,
    Api: Api,
    HandleByGlip: HandleByGlip,
    HandleByGlip2: HandleByGlip2,
    HandleByRingCentral: HandleByRingCentral,
    HandleByUpload: HandleByUpload
});

var GlipAccount = /** @class */ (function (_super) {
    __extends(GlipAccount, _super);
    function GlipAccount() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GlipAccount.prototype.updateSupportedServices = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.setSupportedServices([
                    PostService.name,
                    GroupService.name,
                    CompanyService$$1.name,
                    ItemService.name,
                    PersonService.name,
                    PresenceService.name,
                    ProfileService.name,
                    SearchService.name,
                    StateService.name,
                ]);
                return [2 /*return*/];
            });
        });
    };
    return GlipAccount;
}(AbstractAccount));

var RCAccount = /** @class */ (function (_super) {
    __extends(RCAccount, _super);
    function RCAccount() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RCAccount.prototype.updateSupportedServices = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.setSupportedServices([]);
                return [2 /*return*/];
            });
        });
    };
    return RCAccount;
}(AbstractAccount));

/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-07-09 15:32:19
 * Copyright © RingCentral. All rights reserved
*/
var ACCOUNT_TYPE_ENUM = {
    RC: 'RC',
    GLIP: 'GLIP',
};
var ACCOUNT_TYPE = 'ACCOUNT_TYPE';

var RCPasswordAuthenticator = /** @class */ (function () {
    function RCPasswordAuthenticator() {
    }
    RCPasswordAuthenticator.prototype.authenticate = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var rcAuthData, glipAuthData, authDao, configDao;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params.username = this.parsePhoneNumber(params.username);
                        return [4 /*yield*/, loginRCByPassword(params)];
                    case 1:
                        rcAuthData = _a.sent();
                        return [4 /*yield*/, loginGlip(rcAuthData.data)];
                    case 2:
                        glipAuthData = _a.sent();
                        authDao = daoManager.getKVDao(AuthDao);
                        authDao.put(AUTH_RC_TOKEN, rcAuthData.data);
                        authDao.put(AUTH_GLIP_TOKEN, glipAuthData.headers['x-authorization']);
                        configDao = daoManager.getKVDao(ConfigDao);
                        configDao.put(ACCOUNT_TYPE, ACCOUNT_TYPE_ENUM.RC);
                        notificationCenter.emitConfigPut(AUTH_RC_TOKEN, rcAuthData.data);
                        notificationCenter.emitConfigPut(AUTH_GLIP_TOKEN, glipAuthData.headers['x-authorization']);
                        return [2 /*return*/, {
                                success: true,
                                accountInfos: [
                                    {
                                        type: RCAccount.name,
                                        data: rcAuthData,
                                    },
                                    {
                                        type: GlipAccount.name,
                                        data: glipAuthData,
                                    },
                                ],
                            }];
                }
            });
        });
    };
    RCPasswordAuthenticator.prototype.parsePhoneNumber = function (phoneNumber) {
        return phoneNumber.length >= 10
            ? "" + ((phoneNumber.substring(0, phoneNumber.length - 10) || '1') +
                phoneNumber.substring(phoneNumber.length - 10, phoneNumber.length))
            : phoneNumber;
    };
    return RCPasswordAuthenticator;
}());

/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-07-08 07:52:17
 * Copyright © RingCentral. All rights reserved.
 */
var AutoAuthenticator = /** @class */ (function () {
    function AutoAuthenticator(daoManager$$1) {
        this._daoManager = daoManager$$1;
        this._accountTypeHandleMap = new Map();
        this._accountTypeHandleMap.set(ACCOUNT_TYPE_ENUM.RC, this._authRCLogin.bind(this));
        this._accountTypeHandleMap.set(ACCOUNT_TYPE_ENUM.GLIP, this._authGlipLogin.bind(this));
    }
    AutoAuthenticator.prototype.authenticate = function () {
        var configDao = this._daoManager.getKVDao(ConfigDao);
        var type = configDao.get(ACCOUNT_TYPE);
        var func = this._accountTypeHandleMap.get(type);
        if (func) {
            return func();
        }
        return { success: false };
    };
    AutoAuthenticator.prototype._authGlipLogin = function () {
        var authDao = this._daoManager.getKVDao(AuthDao);
        var glipToken = authDao.get(AUTH_GLIP_TOKEN);
        if (glipToken) {
            return {
                success: true,
                accountInfos: [
                    {
                        type: GlipAccount.name,
                        data: glipToken,
                    },
                ],
            };
        }
        return { success: false };
    };
    AutoAuthenticator.prototype._authRCLogin = function () {
        var authDao = this._daoManager.getKVDao(AuthDao);
        var rcToken = authDao.get(AUTH_RC_TOKEN);
        var glipToken = authDao.get(AUTH_GLIP_TOKEN);
        if (rcToken && glipToken) {
            return {
                success: true,
                accountInfos: [
                    {
                        type: RCAccount.name,
                        data: rcToken,
                    },
                    {
                        type: GlipAccount.name,
                        data: glipToken,
                    },
                ],
            };
        }
        return { success: false };
    };
    return AutoAuthenticator;
}());

function oauthTokenViaAuthCode(params, headers) {
    var model = __assign({}, params, { grant_type: 'authorization_code' });
    var query = {
        headers: headers,
        path: RINGCENTRAL_API.API_OAUTH_TOKEN,
        method: NETWORK_METHOD.POST,
        via: NETWORK_VIA.HTTP,
        data: model,
        authFree: true,
    };
    return Api.glip2NetworkClient.http(query);
}
function generateCode(clientId, redirectUri) {
    var model = {
        clientId: clientId,
        redirectUri: redirectUri,
    };
    return Api.glip2NetworkClient.http({
        path: "/" + Api.httpConfig.rc.apiPlatformVersion + RINGCENTRAL_API.API_GENERATE_CODE,
        method: NETWORK_METHOD.POST,
        via: NETWORK_VIA.HTTP,
        data: model,
    });
}

var UnifiedLoginAuthenticator = /** @class */ (function () {
    function UnifiedLoginAuthenticator() {
    }
    /**
     * should consider 2 cases
     * 1. RC account
     * 2. Glip account
     * we only consider 1 now, will implement case 2 in the future
     */
    UnifiedLoginAuthenticator.prototype.authenticate = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (params.code) {
                    return [2 /*return*/, this._authenticateRC(params.code)];
                }
                if (params.token) {
                    return [2 /*return*/, this._authenticateGlip(params.token)];
                }
                return [2 /*return*/, {
                        success: false,
                        error: new Error('invalid tokens'),
                    }];
            });
        });
    };
    UnifiedLoginAuthenticator.prototype._authenticateGlip = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, { success: true }];
            });
        });
    };
    UnifiedLoginAuthenticator.prototype._authenticateRC = function (code) {
        return __awaiter(this, void 0, void 0, function () {
            var rc, authData, authDao, authCode, newCode, newData, glipAuthData, configDao, glipToken;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        rc = Api.httpConfig.rc;
                        return [4 /*yield*/, oauthTokenViaAuthCode({
                                code: code,
                                redirect_uri: window.location.origin + "/unified-login/",
                            })];
                    case 1:
                        authData = _a.sent();
                        authDao = daoManager.getKVDao(AuthDao);
                        authDao.put(AUTH_RC_TOKEN, authData.data);
                        notificationCenter.emit(SHOULD_UPDATE_NETWORK_TOKEN);
                        return [4 /*yield*/, generateCode(rc.clientId, rc.redirectUri)];
                    case 2:
                        authCode = _a.sent();
                        newCode = authCode.data.code;
                        return [4 /*yield*/, oauthTokenViaAuthCode({ code: newCode, redirect_uri: 'glip://rclogin' }, {
                                Authorization: "Basic " + btoa(rc.clientId + ":" + rc.clientSecret),
                            })];
                    case 3:
                        newData = _a.sent();
                        return [4 /*yield*/, loginGlip(newData.data)];
                    case 4:
                        glipAuthData = _a.sent();
                        configDao = daoManager.getKVDao(ConfigDao);
                        configDao.put(ACCOUNT_TYPE, ACCOUNT_TYPE_ENUM.RC);
                        glipToken = glipAuthData.headers['x-authorization'];
                        authDao.put(AUTH_GLIP_TOKEN, glipToken);
                        notificationCenter.emitConfigPut(AUTH_RC_TOKEN, authData.data);
                        notificationCenter.emitConfigPut(AUTH_GLIP_TOKEN, glipToken);
                        return [2 /*return*/, {
                                success: true,
                                accountInfos: [
                                    {
                                        type: RCAccount.name,
                                        data: authData.data,
                                    },
                                    {
                                        type: GlipAccount.name,
                                        data: glipToken,
                                    },
                                ],
                            }];
                }
            });
        });
    };
    return UnifiedLoginAuthenticator;
}());

/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-04-16 17:23:21
 * Copyright © RingCentral. All rights reserved.
 */
// const EVENT_KEYS = {
//   COMPANY: 'COMPANY',
//   GROUP: 'GROUP',
//   ITEM: 'ITEM',
//   PERSON: 'PERSON',
//   POST: 'POST',
//   PRESENCE: 'PRESENCE',
//   PROFILE: 'PROFILE',
//   STATE: 'STATE',
// };
var SOCKET;
(function (SOCKET) {
    SOCKET["COMPANY"] = "SOCKET.COMPANY";
    SOCKET["GROUP"] = "SOCKET.GROUP";
    SOCKET["ITEM"] = "SOCKET.ITEM";
    SOCKET["PERSON"] = "SOCKET.PERSON";
    SOCKET["POST"] = "SOCKET.POST";
    SOCKET["PRESENCE"] = "SOCKET.PRESENCE";
    SOCKET["PROFILE"] = "SOCKET.PROFILE";
    SOCKET["STATE"] = "SOCKET.STATE";
    SOCKET["STATE_CHANGE"] = "SOCKET.STATE_CHANGE";
    SOCKET["NETWORK_CHANGE"] = "SOCKET.NETWORK_CHANGE";
    SOCKET["SEARCH"] = "SOCKET.SEARCH";
    SOCKET["SEARCH_SCROLL"] = "SOCKET.SEARCH_SCROLL";
    SOCKET["RECONNECT"] = "SOCKET.RECONNECT";
})(SOCKET || (SOCKET = {}));
var ENTITY = {
    COMPANY: 'ENTITY.COMPANY',
    GROUP: 'ENTITY.GROUP',
    ITEM: 'ENTITY.ITEM',
    PERSON: 'ENTITY.PERSON',
    POST: 'ENTITY.POST',
    POST_OLD_NEW: 'ENTITY.POST_OLD_NEW',
    POST_SENT_STATUS: 'ENTITY.POST_SENT_STATUS',
    PRESENCE: 'ENTITY.PRESENCE',
    PROFILE: 'ENTITY.PROFILE',
    // STATE: 'ENTITY.STATE',
    MY_STATE: 'ENTITY.MY_STATE',
    GROUP_STATE: 'ENTITY.GROUP_STATE',
    FAVORITE_GROUPS: 'ENTITY.FAVORITE_GROUPS',
    TEAM_GROUPS: 'ENTITY.TEAM_GROUPS',
    PEOPLE_GROUPS: 'ENTITY.PEOPLE_GROUPS',
};
var CONFIG = {
    LAST_INDEX_TIMESTAMP: 'CONFIG.LAST_INDEX_TIMESTAMP',
    SOCKET_SERVER_HOST: 'CONFIG.SOCKET_SERVER_HOST',
};
var SERVICE = {
    LOGIN: 'AUTH.LOGIN',
    LOGOUT: 'AUTH.LOGOUT',
    FETCH_INDEX_DATA_EXIST: 'SYNC.FETCH_INDEX_DATA_EXIST',
    FETCH_INDEX_DATA_DONE: 'SYNC.FETCH_INDEX_DATA_DONE',
    FETCH_INDEX_DATA_ERROR: 'SYNC.FETCH_INDEX_DATA_ERROR',
    PROFILE_FAVORITE: 'PROFILE/FAVORITE',
    SEARCH_SUCCESS: 'SEARCH_SUCCESS',
    SEARCH_END: 'SEARCH_END',
};
var DOCUMENT = {
    VISIBILITYCHANGE: 'DOCUMENT.VISIBILITY_STATE',
};

var AuthService = /** @class */ (function (_super) {
    __extends(AuthService, _super);
    function AuthService(accountManager) {
        var _this = _super.call(this) || this;
        _this._accountManager = accountManager;
        return _this;
    }
    AuthService.prototype.unifiedLogin = function (_a) {
        var code = _a.code;
        return __awaiter(this, void 0, void 0, function () {
            var resp, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this._accountManager.login(UnifiedLoginAuthenticator.name, { code: code })];
                    case 1:
                        resp = _b.sent();
                        mainLogger.info("unifiedLogin finished " + JSON.stringify(resp));
                        this.onLogin();
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _b.sent();
                        mainLogger.warn("unified login error: " + err_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AuthService.prototype.login = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all([this.loginGlip(params), this.loginGlip2(params)])];
                    case 1:
                        _a.sent();
                        this.onLogin();
                        return [2 /*return*/];
                }
            });
        });
    };
    AuthService.prototype.onLogin = function () {
        // TODO replace all LOGIN listen on notificationCenter
        // with accountManager.on(EVENT_LOGIN)
        notificationCenter.emitService(SERVICE.LOGIN);
    };
    AuthService.prototype.loginGlip = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this._accountManager.login(RCPasswordAuthenticator.name, params)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        err_2 = _a.sent();
                        mainLogger.error("err: " + err_2);
                        throw ErrorParser.parse(err_2);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AuthService.prototype.loginGlip2 = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var authDao, glip2AuthData, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        authDao = daoManager.getKVDao(AuthDao);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, loginGlip2ByPassword(params)];
                    case 2:
                        glip2AuthData = _a.sent();
                        authDao.put(AUTH_GLIP2_TOKEN, glip2AuthData.data);
                        notificationCenter.emitConfigPut(AUTH_GLIP2_TOKEN, glip2AuthData.data);
                        return [3 /*break*/, 4];
                    case 3:
                        err_3 = _a.sent();
                        // Since glip2 api is no in use now, we can ignore all it's errors
                        Aware(ErrorTypes.OAUTH, err_3.message);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AuthService.prototype.logout = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._accountManager.logout()];
                    case 1:
                        _a.sent();
                        // TODO replace all LOGOUT listen on notificationCenter
                        // with accountManager.on(EVENT_LOGOUT)
                        notificationCenter.emitService(SERVICE.LOGOUT);
                        return [2 /*return*/];
                }
            });
        });
    };
    AuthService.prototype.isLoggedIn = function () {
        return this._accountManager.isLoggedIn();
    };
    AuthService.serviceName = 'AuthService';
    return AuthService;
}(BaseService));

function handleLogout() {
    // When logout, ConfigDao was cleared, but we don't want to loose
    // env config. So we save env to sessionStorage, when logout we
    // get the env from sessionStorage and put it back to ConfigDao
    var env = sessionStorage.getItem('env');
    if (!env)
        return;
    var configDao = daoManager.getKVDao(ConfigDao);
    configDao.putEnv(env);
}

var ConfigService = /** @class */ (function (_super) {
    __extends(ConfigService, _super);
    function ConfigService(authService) {
        var _a;
        var _this = this;
        var subscriptions = (_a = {},
            _a[SERVICE.LOGOUT] = handleLogout,
            _a);
        _this = _super.call(this, ConfigDao, null, null, subscriptions) || this;
        _this._authService = authService;
        return _this;
    }
    ConfigService.prototype.getEnv = function () {
        var configDao = daoManager.getKVDao(ConfigDao);
        return configDao.getEnv();
    };
    ConfigService.prototype.getLastIndexTimestamp = function () {
        var configDao = daoManager.getKVDao(ConfigDao);
        return configDao.get(LAST_INDEX_TIMESTAMP);
    };
    ConfigService.prototype.switchEnv = function (env) {
        return __awaiter(this, void 0, void 0, function () {
            var configDao, oldEnv;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        configDao = daoManager.getKVDao(ConfigDao);
                        oldEnv = configDao.getEnv();
                        if (oldEnv === env)
                            return [2 /*return*/];
                        if (!oldEnv) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._authService.logout()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        configDao.putEnv(env);
                        sessionStorage.setItem('env', env);
                        return [2 /*return*/];
                }
            });
        });
    };
    ConfigService.serviceName = 'ConfigService';
    return ConfigService;
}(BaseService));

var CompanyAPI = /** @class */ (function (_super) {
    __extends(CompanyAPI, _super);
    function CompanyAPI() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CompanyAPI.requestCompanyById = function (id) {
        return this.getDataById(id);
    };
    /**
     * @param {*} id  company id
     * return company or null
     */
    CompanyAPI.basePath = '/company';
    return CompanyAPI;
}(Api));

var _this$1 = undefined;
var companyHandleData = function (companies) { return __awaiter(_this$1, void 0, void 0, function () {
    var transformedData, companyDao;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (companies.length === 0) {
                    return [2 /*return*/];
                }
                transformedData = companies.map(function (item) { return transform(item); });
                companyDao = daoManager.getDao(CompanyDao);
                notificationCenter.emitEntityPut(ENTITY.COMPANY, transformedData);
                return [4 /*yield*/, companyDao.bulkPut(transformedData)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };

/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-03-07 14:15:40
 */
var CompanyService$$1 = /** @class */ (function (_super) {
    __extends(CompanyService$$1, _super);
    function CompanyService$$1() {
        var _a;
        var _this = this;
        var subscriptions = (_a = {},
            _a[SOCKET.COMPANY] = companyHandleData,
            _a);
        _this = _super.call(this, CompanyDao, CompanyAPI, companyHandleData, subscriptions) || this;
        return _this;
    }
    CompanyService$$1.serviceName = 'CompanyService';
    return CompanyService$$1;
}(BaseService));

/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-20 14:21:23
 * Copyright © RingCentral. All rights reserved.
 */
var GroupServiceHandler = /** @class */ (function () {
    function GroupServiceHandler() {
    }
    GroupServiceHandler.buildNewGroupInfo = function (members) {
        var userId = daoManager.getKVDao(AccountDao).get(ACCOUNT_USER_ID);
        return {
            members: members,
            creator_id: Number(userId),
            is_new: true,
            new_version: versionHash(),
        };
    };
    return GroupServiceHandler;
}());

var ProfileAPI = /** @class */ (function (_super) {
    __extends(ProfileAPI, _super);
    function ProfileAPI() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ProfileAPI.requestProfileById = function (id) {
        return this.getDataById(id);
    };
    ProfileAPI.basePath = '/profile';
    return ProfileAPI;
}(Api));

var _this$2 = undefined;
function doNotification(localProfile, transformedData) {
    if (localProfile && transformedData.length && transformedData[0].id === localProfile.id) {
        notificationCenter.emit(SERVICE.PROFILE_FAVORITE, localProfile, transformedData[0]);
    }
}
var profileHandleData = function (profile) { return __awaiter(_this$2, void 0, void 0, function () {
    var transformedData, profileDao, localProfile, accountService, profileId, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (profile.length === 0) {
                    return [2 /*return*/, null];
                }
                transformedData = transformAll(profile);
                profileDao = daoManager.getDao(ProfileDao);
                localProfile = null;
                accountService = AccountService.getInstance();
                profileId = accountService.getCurrentUserProfileId();
                if (!profileId) return [3 /*break*/, 2];
                return [4 /*yield*/, profileDao.get(profileId)];
            case 1:
                localProfile = _a.sent();
                _a.label = 2;
            case 2:
                notificationCenter.emitEntityPut(ENTITY.PROFILE, transformedData);
                _a.label = 3;
            case 3:
                _a.trys.push([3, 5, , 6]);
                return [4 /*yield*/, profileDao.bulkPut(transformedData)];
            case 4:
                _a.sent();
                doNotification(localProfile, transformedData);
                return [2 /*return*/, transformedData];
            case 5:
                e_1 = _a.sent();
                mainLogger.warn("----profile save/notification error------, " + e_1);
                return [2 /*return*/, null];
            case 6: return [2 /*return*/];
        }
    });
}); };

var ProfileService = /** @class */ (function (_super) {
    __extends(ProfileService, _super);
    function ProfileService() {
        var _a;
        var _this = this;
        var subscriptions = (_a = {},
            _a[SOCKET.PROFILE] = profileHandleData,
            _a);
        _this = _super.call(this, ProfileDao, ProfileAPI, profileHandleData, subscriptions) || this;
        return _this;
    }
    ProfileService.prototype.getProfile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var accountService, profileId;
            return __generator(this, function (_a) {
                accountService = AccountService.getInstance();
                profileId = accountService.getCurrentUserProfileId();
                if (!profileId) {
                    return [2 /*return*/, null];
                }
                return [2 /*return*/, this.getById(profileId)];
            });
        });
    };
    ProfileService.prototype.putFavoritePost = function (postId, toBook) {
        return __awaiter(this, void 0, void 0, function () {
            var profile, response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getProfile()];
                    case 1:
                        profile = _a.sent();
                        if (!profile) return [3 /*break*/, 4];
                        profile.favorite_post_ids = profile.favorite_post_ids || [];
                        if (toBook) {
                            if (profile.favorite_post_ids.indexOf(postId) === -1) {
                                profile.favorite_post_ids.push(postId);
                            }
                            else {
                                return [2 /*return*/, profile];
                            }
                        }
                        else {
                            if (profile.favorite_post_ids.indexOf(postId) !== -1) {
                                profile.favorite_post_ids = profile.favorite_post_ids
                                    .filter(function (id) { return id !== postId; });
                            }
                            else {
                                return [2 /*return*/, profile];
                            }
                        }
                        profile._id = profile.id;
                        delete profile.id;
                        return [4 /*yield*/, ProfileAPI.putDataById(profile._id, profile)];
                    case 2:
                        response = _a.sent();
                        if (!response.data) return [3 /*break*/, 4];
                        return [4 /*yield*/, profileHandleData([response.data])];
                    case 3:
                        result = _a.sent();
                        if (result && result.length) {
                            return [2 /*return*/, result[0]];
                        }
                        _a.label = 4;
                    case 4: 
                    // error
                    return [2 /*return*/, null];
                }
            });
        });
    };
    ProfileService.serviceName = 'ProfileService';
    return ProfileService;
}(BaseService));

var GroupAPI = /** @class */ (function (_super) {
    __extends(GroupAPI, _super);
    function GroupAPI() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GroupAPI.requestGroupById = function (id) {
        return this.getDataById(id);
    };
    GroupAPI.requestNewGroup = function (options) {
        return this.postData(options);
    };
    GroupAPI.pinPost = function (path, options) {
        return this.glipNetworkClient.put(path, options);
    };
    GroupAPI.addTeamMembers = function (groupId, memberIds) {
        return this.glipNetworkClient.put("/add_team_members/" + groupId, {
            members: memberIds,
        });
    };
    GroupAPI.createTeam = function (data) {
        return this.glipNetworkClient.post("/team", data);
    };
    /**
     *
     * @param {*} id  group id
     * return group or null
     */
    GroupAPI.basePath = '/group';
    return GroupAPI;
}(Api));

var PersonAPI = /** @class */ (function (_super) {
    __extends(PersonAPI, _super);
    function PersonAPI() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PersonAPI.requestPersonById = function (id) {
        return this.getDataById(id);
    };
    /**
     *
     * @param {*} id  group id
     * return group or null
     */
    PersonAPI.basePath = '/person';
    return PersonAPI;
}(Api));

var _this$3 = undefined;
var personHandleData = function (persons) { return __awaiter(_this$3, void 0, void 0, function () {
    var personDao, transformedData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (persons.length === 0) {
                    return [2 /*return*/];
                }
                personDao = daoManager.getDao(PersonDao);
                transformedData = persons.map(function (item) { return transform(item); });
                return [4 /*yield*/, baseHandleData({
                        data: transformedData,
                        dao: personDao,
                        eventKey: ENTITY.PERSON,
                    })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };

var PersonService = /** @class */ (function (_super) {
    __extends(PersonService, _super);
    function PersonService() {
        var _a;
        var _this = this;
        var subscription = (_a = {},
            _a[SOCKET.PERSON] = personHandleData,
            _a[SOCKET.ITEM] = personHandleData,
            _a);
        _this = _super.call(this, PersonDao, PersonAPI, personHandleData, subscription) || this;
        return _this;
    }
    PersonService.prototype.getPersonsByIds = function (ids) {
        return __awaiter(this, void 0, void 0, function () {
            var persons;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!Array.isArray(ids)) {
                            throw new Error('ids must be an array.');
                        }
                        if (ids.length === 0) {
                            return [2 /*return*/, []];
                        }
                        return [4 /*yield*/, Promise.all(ids.map(function (id) { return __awaiter(_this, void 0, void 0, function () {
                                var person;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.getById(id)];
                                        case 1:
                                            person = _a.sent();
                                            return [2 /*return*/, person];
                                    }
                                });
                            }); }))];
                    case 1:
                        persons = _a.sent();
                        return [2 /*return*/, persons.filter(function (person) { return person !== null; })];
                }
            });
        });
    };
    PersonService.prototype.getPersonsByPrefix = function (prefix, pagination) {
        return __awaiter(this, void 0, void 0, function () {
            var personDao;
            return __generator(this, function (_a) {
                personDao = daoManager.getDao(PersonDao);
                return [2 /*return*/, personDao.getPersonsByPrefix(prefix, pagination)];
            });
        });
    };
    PersonService.prototype.getPersonsOfEachPrefix = function (limit) {
        return __awaiter(this, void 0, void 0, function () {
            var personDao;
            return __generator(this, function (_a) {
                personDao = daoManager.getDao(PersonDao);
                return [2 /*return*/, personDao.getPersonsOfEachPrefix({ limit: limit })];
            });
        });
    };
    PersonService.prototype.getPersonsCountByPrefix = function (prefix) {
        return __awaiter(this, void 0, void 0, function () {
            var personDao;
            return __generator(this, function (_a) {
                personDao = daoManager.getDao(PersonDao);
                return [2 /*return*/, personDao.getPersonsCountByPrefix(prefix)];
            });
        });
    };
    PersonService.prototype.getAllCount = function () {
        return __awaiter(this, void 0, void 0, function () {
            var personDao;
            return __generator(this, function (_a) {
                personDao = daoManager.getDao(PersonDao);
                return [2 /*return*/, personDao.getAllCount()];
            });
        });
    };
    PersonService.serviceName = 'PersonService';
    return PersonService;
}(BaseService));

var StateAPI = /** @class */ (function (_super) {
    __extends(StateAPI, _super);
    function StateAPI() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StateAPI.saveStatePartial = function (id, state) {
        return this.glipNetworkClient.put("/save_state_partial/" + id, state);
    };
    /**
     *
     * @param {*} id  group id
     * return group or null
     */
    StateAPI.basePath = '/state';
    return StateAPI;
}(Api));

var PostAPI = /** @class */ (function (_super) {
    __extends(PostAPI, _super);
    function PostAPI() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PostAPI.requestPosts = function (params) {
        return this.glipNetworkClient.get('/posts', params);
    };
    /**
     *  /api/post
     */
    PostAPI.sendPost = function (data) {
        return this.postData(data);
    };
    PostAPI.requestById = function (id) {
        return this.getDataById(id);
    };
    PostAPI.editPost = function (id, data) {
        return this.putDataById(id, data);
    };
    /**
     *
     * @param {*} params
     * params {
     *      group_id:int64 (required)
     *      direction: string (optional)
     *      post_id: int64 (optional)
     *      limit: int64 (optional, up to 1000)
     * }
     */
    PostAPI.basePath = '/post';
    return PostAPI;
}(Api));

var PostServiceHandler = /** @class */ (function () {
    function PostServiceHandler() {
    }
    // <a class='at_mention_compose' rel='{"id":21952077827}'>@Jeffrey Huang</a>
    PostServiceHandler.buildAtMentionsPeopleInfo = function (params) {
        var atMentions = params.atMentions, _a = params.users, users = _a === void 0 ? [] : _a, text = params.text;
        if (atMentions) {
            var renderedText = text;
            var ids = [];
            for (var i = 0; i < users.length; i += 1) {
                var userDisplay = users[i].display.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
                var key = new RegExp("@\\[" + userDisplay + "\\]:" + users[i].id + ":", 'g');
                // tslint:disable-next-line:max-line-length
                var replacedText = "<a class='at_mention_compose' rel='{\"id\":" + users[i].id + "}'>@" + users[i].display + "</a>";
                renderedText = renderedText.replace(key, replacedText);
                ids.push(users[i].id);
            }
            return {
                text: renderedText,
                at_mention_non_item_ids: ids,
            };
        }
        return {
            at_mention_non_item_ids: [],
            text: params.text,
        };
    };
    PostServiceHandler.buildLinksInfo = function (params) {
        var text = params.text;
        var res;
        var links = [];
        res = text.match(Markdown.global_url_regex);
        res &&
            res.forEach(function (item) {
                links.push({
                    url: item,
                });
            });
        return links;
    };
    PostServiceHandler.buildPostInfo = function (params) {
        var userId = daoManager.getKVDao(AccountDao).get(ACCOUNT_USER_ID);
        var companyId = daoManager.getKVDao(AccountDao).get(ACCOUNT_COMPANY_ID);
        var vers = versionHash();
        var atMentionsPeopleInfo = PostServiceHandler.buildAtMentionsPeopleInfo(params);
        var links = PostServiceHandler.buildLinksInfo(params);
        var now = Date.now();
        var id = -randomInt();
        return {
            id: id,
            links: links,
            created_at: now,
            modified_at: now,
            creator_id: userId,
            version: vers,
            new_version: vers,
            is_new: true,
            model_size: 0,
            text: atMentionsPeopleInfo.text,
            group_id: Number(params.groupId),
            from_group_id: Number(params.groupId),
            item_ids: params.itemIds || [],
            post_ids: [],
            at_mention_item_ids: [],
            at_mention_non_item_ids: atMentionsPeopleInfo.at_mention_non_item_ids,
            company_id: companyId,
            deactivated: false,
        };
    };
    PostServiceHandler.buildResendPostInfo = function (post) {
        var version = versionHash();
        var now = Date.now();
        post.version = version;
        post.created_at = now;
        post.modified_at = now;
        return post;
    };
    PostServiceHandler.buildModifiedPostInfo = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var postDao, oldPost, atMentionsInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!params.postId) {
                            // TODO use a new type that requires postId instead of RawPostInfo,
                            // And don't throw this error.
                            throw new Error("invalid post id: " + params.postId);
                        }
                        postDao = daoManager.getDao(PostDao);
                        return [4 /*yield*/, postDao.get(params.postId)];
                    case 1:
                        oldPost = _a.sent();
                        if (!oldPost) {
                            console.error("invalid post id: " + params.postId);
                            return [2 /*return*/, null];
                        }
                        oldPost.new_version = versionHash();
                        oldPost.is_new = false;
                        atMentionsInfo = PostServiceHandler.buildAtMentionsPeopleInfo(params);
                        oldPost.text = atMentionsInfo.text;
                        if (atMentionsInfo.at_mention_non_item_ids.length) {
                            oldPost.at_mention_non_item_ids = atMentionsInfo.at_mention_non_item_ids;
                        }
                        delete oldPost.likes; // do we need this ?
                        oldPost._id = oldPost.id;
                        delete oldPost.id;
                        return [2 /*return*/, oldPost];
                }
            });
        });
    };
    return PostServiceHandler;
}());

var _a$1;
var ITEMPATH = (_a$1 = {},
    _a$1[TypeDictionary.TYPE_ID_TASK] = 'task',
    _a$1[TypeDictionary.TYPE_ID_EVENT] = 'event',
    _a$1[TypeDictionary.TYPE_ID_PAGE] = 'page',
    _a$1[TypeDictionary.TYPE_ID_LINK] = 'link',
    _a$1[TypeDictionary.TYPE_ID_FILE] = 'file',
    _a$1[TypeDictionary.TYPE_ID_MEETING] = 'item',
    // [TypeDictionary.TYPE_ID_RC_VIDEO]: 'item',
    // [TypeDictionary.TYPE_ID_RC_SMS]: 'rc_sms',
    _a$1[TypeDictionary.TYPE_ID_RC_VOICEMAIL] = 'rc_voicemail',
    _a$1);
function getItemServerUrl(id) {
    var url = '/';
    var typeId = GlipTypeUtil.extractTypeId(id);
    if (typeId > TypeDictionary.TYPE_ID_CUSTOM_ITEM) {
        url = '/integration_item';
    }
    else {
        var path = ITEMPATH[typeId];
        url += path || 'item';
    }
    return url + "/" + id;
}
var ItemAPI = /** @class */ (function (_super) {
    __extends(ItemAPI, _super);
    function ItemAPI() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ItemAPI.sendFileItem = function (data) {
        return this.glipNetworkClient.post('/file', data);
    };
    ItemAPI.uploadFileItem = function (files, callback) {
        return this.uploadNetworkClient.http({
            path: '/upload',
            method: NETWORK_METHOD.POST,
            via: NETWORK_VIA.HTTP,
            data: files,
            requestConfig: {
                onUploadProgress: function (event) {
                    if (callback) {
                        callback(event);
                    }
                },
            },
        });
    };
    ItemAPI.requestById = function (id) {
        return this.glipNetworkClient.get(getItemServerUrl(id));
    };
    ItemAPI.requestRightRailItems = function (groupId) {
        return this.glipNetworkClient.get('/web_client_right_rail_items', {
            group_id: groupId,
        });
    };
    ItemAPI.getNote = function (id) {
        return this.glipNetworkClient.get("/pages_body/" + id);
    };
    ItemAPI.basePath = '/item';
    return ItemAPI;
}(Api));

/**
 * Class UploadManager
 * Conversation's files management
 */
var UploadManager = /** @class */ (function (_super) {
    __extends(UploadManager, _super);
    function UploadManager() {
        return _super.call(this, { wildcard: true }) || this;
    }
    return UploadManager;
}(EventEmitter2));
var uploadManager = new UploadManager();

var _this$4 = undefined;
var itemHandleData = function (items) { return __awaiter(_this$4, void 0, void 0, function () {
    var transformedData, itemDao;
    return __generator(this, function (_a) {
        if (items.length === 0) {
            return [2 /*return*/];
        }
        transformedData = items.map(function (item) { return transform(item); });
        itemDao = daoManager.getDao(ItemDao);
        // handle deactivated data and normal data
        return [2 /*return*/, baseHandleData({
                data: transformedData,
                dao: itemDao,
                eventKey: ENTITY.ITEM,
            })];
    });
}); };
var uploadStorageFile = function (params) { return __awaiter(_this$4, void 0, void 0, function () {
    var file, groupId, resp;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                file = params.file, groupId = params.groupId;
                return [4 /*yield*/, ItemAPI.uploadFileItem(file, function (e) {
                        var loaded = e.loaded, total = e.total;
                        if (loaded && total) {
                            var percent = loaded / total;
                            uploadManager.emit(String(groupId), (percent * 100).toFixed(0));
                        }
                    })];
            case 1:
                resp = _a.sent();
                return [2 /*return*/, resp.data];
        }
    });
}); };
var extractFileNameAndType = function (storagePath) {
    var options = {
        name: '',
        type: '',
    };
    if (storagePath) {
        var arr = storagePath.split('/');
        if (arr && arr.length > 0) {
            var name_1 = arr[arr.length - 1];
            options.name = name_1;
            var seArr = name_1.split('.');
            options.type = seArr[seArr.length - 1];
        }
    }
    return options;
};
var sendFileItem = function (options) { return __awaiter(_this$4, void 0, void 0, function () {
    var nameType, version, fileVersion, fileItemOptions, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                nameType = extractFileNameAndType(options.storedFile.storage_path);
                version = versionHash();
                fileVersion = {
                    stored_file_id: options.storedFile._id,
                    url: options.storedFile.storage_url,
                    download_url: options.storedFile.download_url,
                    date: options.storedFile.last_modified,
                    size: options.storedFile.size,
                    creator_id: Number(options.storedFile.creator_id),
                };
                fileItemOptions = {
                    version: version,
                    creator_id: Number(options.storedFile.creator_id),
                    new_version: version,
                    name: nameType.name,
                    type: nameType.type,
                    source: 'upload',
                    no_post: true,
                    group_ids: [Number(options.groupId)],
                    post_ids: [],
                    versions: [fileVersion],
                    created_at: Date.now(),
                    is_new: true,
                };
                return [4 /*yield*/, ItemAPI.sendFileItem(fileItemOptions)];
            case 1:
                result = _a.sent();
                return [2 /*return*/, result.data];
        }
    });
}); };

var ItemService = /** @class */ (function (_super) {
    __extends(ItemService, _super);
    function ItemService() {
        var _a;
        var _this = this;
        var subscription = (_a = {},
            _a[SOCKET.ITEM] = itemHandleData,
            _a);
        _this = _super.call(this, ItemDao, ItemAPI, itemHandleData, subscription) || this;
        return _this;
    }
    ItemService.prototype.sendFile = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var options, itemOptions, result, fileItem;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, uploadStorageFile(params)];
                    case 1:
                        options = _a.sent();
                        itemOptions = {
                            storedFile: options[0],
                            groupId: params.groupId,
                        };
                        return [4 /*yield*/, sendFileItem(itemOptions)];
                    case 2:
                        result = _a.sent();
                        if (!result) return [3 /*break*/, 4];
                        fileItem = transform(result);
                        return [4 /*yield*/, itemHandleData([result])];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, fileItem];
                    case 4: return [2 /*return*/, null];
                }
            });
        });
    };
    ItemService.prototype.getRightRailItemsOfGroup = function (groupId, limit) {
        ItemAPI.requestRightRailItems(groupId).then(function (_a) {
            var data = _a.data;
            if (data && data.items && data.items.length) {
                itemHandleData(data.items);
            }
        });
        return daoManager.getDao(this.DaoClass).getItemsByGroupId(groupId, limit);
    };
    ItemService.prototype.getNoteById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result, resp, note;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getByIdFromDao(id)];
                    case 1:
                        result = (_a.sent());
                        if (result) {
                            return [2 /*return*/, result];
                        }
                        return [4 /*yield*/, ItemAPI.getNote(id)];
                    case 2:
                        resp = _a.sent();
                        if (!resp.data) return [3 /*break*/, 4];
                        note = transform(resp.data);
                        return [4 /*yield*/, itemHandleData([resp.data])];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, note];
                    case 4: 
                    // should handle errors when error handling ready
                    return [2 /*return*/, null];
                }
            });
        });
    };
    ItemService.serviceName = 'ItemService';
    return ItemService;
}(BaseService));

/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-22 10:53:42
 * Copyright © RingCentral. All rights reserved.
 */
// greater than or equal to this indicate the local post
// should be dirty since they can not use anymore because
// they are not continues with server pushed data;
var ServerIndexPostMaxSize = 50;
var IncomingPostHandler = /** @class */ (function () {
    function IncomingPostHandler() {
    }
    // categorize the posts based on group, if one group has greater
    // than or equal 50 posts, mark the posts of this group
    IncomingPostHandler.handelGroupPostsDiscontinuousCasuedByOverThreshold = function (transformedData, maxPostsExceed) {
        return __awaiter(this, void 0, void 0, function () {
            var groupPostsNumber, i, keys, postsShouldBeRemovedGroupIds, i, dao_1, postsInDB_1, ids_1, e_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // tslint:disable-next-line:max-line-length
                        mainLogger.info("maxPostsExceed: " + maxPostsExceed + " transformedData.length: " + transformedData.length);
                        if (!(maxPostsExceed && transformedData.length >= ServerIndexPostMaxSize)) {
                            return [2 /*return*/, transformedData];
                        }
                        groupPostsNumber = {};
                        for (i = 0; i < transformedData.length; i += 1) {
                            if (groupPostsNumber[transformedData[i].group_id]) {
                                groupPostsNumber[transformedData[i].group_id].push(transformedData[i].id);
                            }
                            else {
                                groupPostsNumber[transformedData[i].group_id] = [transformedData[i].id];
                            }
                        }
                        keys = Object.keys(groupPostsNumber);
                        postsShouldBeRemovedGroupIds = [];
                        for (i = 0; i < keys.length; i += 1) {
                            if (groupPostsNumber[keys[i]].length >= ServerIndexPostMaxSize) {
                                postsShouldBeRemovedGroupIds.push(Number(keys[i]));
                            }
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        if (!postsShouldBeRemovedGroupIds.length) return [3 /*break*/, 3];
                        dao_1 = daoManager.getDao(PostDao);
                        postsInDB_1 = [];
                        return [4 /*yield*/, Promise.all(postsShouldBeRemovedGroupIds.map(function (id) { return __awaiter(_this, void 0, void 0, function () {
                                var posts;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, dao_1.queryPostsByGroupId(id, 0, 9999)];
                                        case 1:
                                            posts = _a.sent();
                                            postsInDB_1 = postsInDB_1.concat(posts);
                                            return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 2:
                        _a.sent();
                        if (postsInDB_1.length) {
                            ids_1 = postsInDB_1.map(function (item) { return item.id; });
                            dao_1.bulkDelete(ids_1);
                            // should notifiy ???
                            return [2 /*return*/, transformedData.filter(function (item) { return ids_1.indexOf(item.id) === -1; })];
                        }
                        _a.label = 3;
                    case 3: return [2 /*return*/, transformedData];
                    case 4:
                        e_1 = _a.sent();
                        mainLogger.warn("handelGroupPostsDiscontinuousCasuedByOverThreshold, " + e_1);
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    IncomingPostHandler.isGroupPostsDiscontinuous = function (posts) {
        for (var i = 0; i < posts.length; i += 1) {
            if (posts[i].modified_at && posts[i].created_at !== posts[i].modified_at) {
                return true;
            }
        }
        return false;
    };
    IncomingPostHandler.removeDiscontinuousPosts = function (groupPosts) {
        return __awaiter(this, void 0, void 0, function () {
            var keys, groupIds, postQuerys, dao, i, key, result, shouldBeMovedPosts, i, tmpPosts, lastModifiedIndex, j, ids, i, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        keys = Object.keys(groupPosts);
                        groupIds = [];
                        postQuerys = [];
                        dao = daoManager.getDao(PostDao);
                        for (i = 0; i < keys.length; i += 1) {
                            if (IncomingPostHandler.isGroupPostsDiscontinuous(groupPosts[keys[i]])) {
                                key = Number(keys[i]);
                                groupIds.push(key);
                                postQuerys.push(dao.queryOldestPostByGroupId(key));
                            }
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, Promise.all(postQuerys)];
                    case 2:
                        result = _a.sent();
                        shouldBeMovedPosts = [];
                        for (i = 0; i < groupIds.length; i += 1) {
                            // if (result[i] === undefined) {
                            if (!result || !result[i]) {
                                shouldBeMovedPosts = shouldBeMovedPosts.concat(groupPosts[groupIds[i]]);
                            }
                            else {
                                tmpPosts = groupPosts[groupIds[i]];
                                tmpPosts = tmpPosts
                                    .sort(function (post1, post2) { return post1.created_at - post2.created_at; });
                                lastModifiedIndex = -1;
                                for (j = 0; j < tmpPosts.length; j += 1) {
                                    if (tmpPosts[j].created_at !== tmpPosts[j].modified_at &&
                                        tmpPosts[j].created_at < result[i].created_at) {
                                        lastModifiedIndex = j;
                                    }
                                }
                                if (lastModifiedIndex >= 0) {
                                    shouldBeMovedPosts = shouldBeMovedPosts
                                        .concat(tmpPosts.slice(0, lastModifiedIndex + 1));
                                }
                            }
                        }
                        if (!(shouldBeMovedPosts.length > 0)) return [3 /*break*/, 4];
                        ids = [];
                        for (i = 0; i < shouldBeMovedPosts.length; i += 1) {
                            ids.push(shouldBeMovedPosts[i].id);
                        }
                        return [4 /*yield*/, dao.bulkDelete(ids)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, ids];
                    case 4: return [2 /*return*/, []];
                    case 5:
                        e_2 = _a.sent();
                        return [2 /*return*/, []];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    IncomingPostHandler.handleGroupPostsDiscontinuousCausedByModificationTimeChange = function (posts) {
        return __awaiter(this, void 0, void 0, function () {
            var groupPosts, i, removedIds, resultPosts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        groupPosts = {};
                        for (i = 0; i < posts.length; i += 1) {
                            if (groupPosts[posts[i].group_id]) {
                                groupPosts[posts[i].group_id].push(posts[i]);
                            }
                            else {
                                groupPosts[posts[i].group_id] = [posts[i]];
                            }
                        }
                        return [4 /*yield*/, IncomingPostHandler.removeDiscontinuousPosts(groupPosts)];
                    case 1:
                        removedIds = _a.sent();
                        resultPosts = posts.filter(function (item) { return removedIds.indexOf(item.id) === -1; });
                        return [2 /*return*/, resultPosts];
                }
            });
        });
    };
    IncomingPostHandler.handleEditedPostNoInDB = function (transformedData) {
        return __awaiter(this, void 0, void 0, function () {
            var editedPostIds, i, dao, postsInDB_2, editedPostsNotInDBIds_1, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editedPostIds = [];
                        for (i = 0; i < transformedData.length; i += 1) {
                            if (transformedData[i].modified_at &&
                                transformedData[i].created_at !== transformedData[i].modified_at) {
                                editedPostIds.push(transformedData[i].id);
                            }
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        if (!(editedPostIds.length !== 0)) return [3 /*break*/, 3];
                        dao = daoManager.getDao(PostDao);
                        return [4 /*yield*/, dao.queryManyPostsByIds(editedPostIds)];
                    case 2:
                        postsInDB_2 = _a.sent();
                        editedPostsNotInDBIds_1 = editedPostIds.filter(function (id) { return postsInDB_2.filter(function (item) { return item.id === id; }).length === 0; });
                        if (editedPostsNotInDBIds_1.length !== 0) {
                            return [2 /*return*/, transformedData.filter(function (item) { return editedPostsNotInDBIds_1.indexOf(item.id) === -1; })];
                        }
                        _a.label = 3;
                    case 3: return [2 /*return*/, transformedData];
                    case 4:
                        e_3 = _a.sent();
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    IncomingPostHandler.getDeactivatedPosts = function (validPosts) {
        var deactivedPosts = [];
        for (var i = 0; i < validPosts.length; i += 1) {
            if (validPosts[i].deactivated) {
                deactivedPosts.push(validPosts[i]);
            }
        }
        return deactivedPosts;
    };
    IncomingPostHandler.removeDeactivedPostFromValidPost = function (validPost, deactivedPosts) {
        return validPost.filter(function (item) {
            for (var i = 0; i < deactivedPosts.length; i += 1) {
                if (item.id === deactivedPosts[i].id) {
                    return false;
                }
            }
            return true;
        });
    };
    return IncomingPostHandler;
}());

var _this$5 = undefined;
var totalPostCount = null;
var handlePostsOverflow = function (newReceivedPosts) { return __awaiter(_this$5, void 0, void 0, function () {
    var postDao, occupation, groupDao, allGroups;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                postDao = daoManager.getDao(PostDao);
                if (postDao.isLokiDB())
                    return [2 /*return*/];
                if (!(typeof totalPostCount !== 'number')) return [3 /*break*/, 2];
                return [4 /*yield*/, postDao.createQuery().count()];
            case 1:
                totalPostCount = _a.sent();
                return [3 /*break*/, 3];
            case 2:
                totalPostCount += newReceivedPosts.length;
                _a.label = 3;
            case 3:
                mainLogger.info("Total post count in indexedDB " + totalPostCount);
                return [4 /*yield*/, daoManager.getStorageQuotaOccupation()];
            case 4:
                occupation = _a.sent();
                mainLogger.info("Estimated storage quota occupation " + Number(occupation) * 100 + "%");
                if (!(totalPostCount > (isIEOrEdge ? 10000 : 100000) || occupation > 0.8)) return [3 /*break*/, 6];
                groupDao = daoManager.getDao(GroupDao);
                return [4 /*yield*/, groupDao.getAll()];
            case 5:
                allGroups = _a.sent();
                Promise.all(allGroups.map(function (_a) {
                    var id = _a.id;
                    return postDao.purgePostsByGroupId(id, 20);
                }));
                _a.label = 6;
            case 6: return [2 /*return*/];
        }
    });
}); };
function transformData(data) {
    return [].concat(data).map(function (item) { return transform(item); });
}
function checkIncompletePostsOwnedGroups(posts) {
    return __awaiter(this, void 0, void 0, function () {
        var groupIds_1, groupService, groups;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!posts.length) return [3 /*break*/, 2];
                    groupIds_1 = [];
                    posts.forEach(function (post) { return groupIds_1.push(post.group_id); });
                    groupService = GroupService.getInstance();
                    return [4 /*yield*/, groupService.getGroupsByIds(groupIds_1)];
                case 1:
                    groups = _a.sent();
                    return [2 /*return*/, groups];
                case 2: return [2 /*return*/, []];
            }
        });
    });
}
function handleDeactivedAndNormalPosts(posts) {
    return __awaiter(this, void 0, void 0, function () {
        var postDao, normalPosts;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    postDao = daoManager.getDao(PostDao);
                    return [4 /*yield*/, baseHandleData({
                            data: posts,
                            dao: postDao,
                            eventKey: ENTITY.POST,
                        })];
                case 1:
                    normalPosts = _a.sent();
                    // check if post's owner group exist in local or not
                    // seems we only need check normal posts, don't need to check deactivated data
                    return [4 /*yield*/, checkIncompletePostsOwnedGroups(normalPosts)];
                case 2:
                    // check if post's owner group exist in local or not
                    // seems we only need check normal posts, don't need to check deactivated data
                    _a.sent();
                    handlePostsOverflow(normalPosts);
                    return [2 /*return*/, posts];
            }
        });
    });
}
function handleDataFromSexio(data) {
    return __awaiter(this, void 0, void 0, function () {
        var transformedData, validPosts;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (data.length === 0) {
                        return [2 /*return*/];
                    }
                    transformedData = transformData(data);
                    return [4 /*yield*/, IncomingPostHandler
                            .handleGroupPostsDiscontinuousCausedByModificationTimeChange(transformedData)];
                case 1:
                    validPosts = _a.sent();
                    return [4 /*yield*/, handlePreInstedPosts(validPosts)];
                case 2:
                    _a.sent();
                    if (validPosts.length) {
                        handleDeactivedAndNormalPosts(validPosts);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function handleDataFromIndex(data, maxPostsExceed) {
    return __awaiter(this, void 0, void 0, function () {
        var transformedData, exceedPostsHandled, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (data.length === 0) {
                        return [2 /*return*/];
                    }
                    transformedData = transformData(data);
                    return [4 /*yield*/, IncomingPostHandler
                            .handelGroupPostsDiscontinuousCasuedByOverThreshold(transformedData, maxPostsExceed)];
                case 1:
                    exceedPostsHandled = _a.sent();
                    return [4 /*yield*/, handlePreInstedPosts(exceedPostsHandled)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, IncomingPostHandler
                            .handleGroupPostsDiscontinuousCausedByModificationTimeChange(exceedPostsHandled)];
                case 3:
                    result = _a.sent();
                    handleDeactivedAndNormalPosts(result);
                    return [2 /*return*/];
            }
        });
    });
}
function postHandleData (data, maxPostsExceed) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, handleDataFromIndex(data, maxPostsExceed)];
        });
    });
}
function baseHandleData$1(data, needTransformed) {
    if (needTransformed === void 0) { needTransformed = true; }
    var transformedData = needTransformed
        ? transformData(data)
        : Array.isArray(data)
            ? data
            : [data];
    return handleDeactivedAndNormalPosts(transformedData);
}
function handlePreInstedPosts(posts) {
    if (posts === void 0) { posts = []; }
    return __awaiter(this, void 0, void 0, function () {
        var ids, postService, postDao;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!posts || !posts.length) {
                        return [2 /*return*/, []];
                    }
                    ids = [];
                    postService = PostService.getInstance();
                    return [4 /*yield*/, Promise.all(posts.map(function (element) { return __awaiter(_this, void 0, void 0, function () {
                            var obj;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, postService.isVersionInPreInsert(element.version)];
                                    case 1:
                                        obj = _a.sent();
                                        if (obj && obj.existed) {
                                            ids.push(obj.id);
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 1:
                    _a.sent();
                    if (!ids.length) return [3 /*break*/, 3];
                    postDao = daoManager.getDao(PostDao);
                    return [4 /*yield*/, postDao.bulkDelete(ids)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/, ids];
            }
        });
    });
}

// import { SSL_OP_MICROSOFT_BIG_SSLV3_BUFFER } from 'constants';
/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-05-23 15:03:23
 */
var ESendStatus;
(function (ESendStatus) {
    ESendStatus[ESendStatus["SUCCESS"] = 0] = "SUCCESS";
    ESendStatus[ESendStatus["FAIL"] = 1] = "FAIL";
    ESendStatus[ESendStatus["INPROGRESS"] = 2] = "INPROGRESS";
})(ESendStatus || (ESendStatus = {}));
var PostSendStatusHandler = /** @class */ (function () {
    function PostSendStatusHandler() {
        this.isInited = false;
        this.sendStatusIdStatus = new Map();
        this.sendStatusIdVersion = new Map();
    }
    PostSendStatusHandler.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dao, posts;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dao = daoManager.getDao(PostDao);
                        return [4 /*yield*/, dao.queryPreInsertPost()];
                    case 1:
                        posts = _a.sent();
                        if (posts && posts.length) {
                            posts.forEach(function (element) {
                                _this.addIdAndVersion(element.id, element.version, ESendStatus.FAIL);
                            });
                        }
                        this.isInited = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    PostSendStatusHandler.prototype.getStatus = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var status;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (id > 0) {
                            return [2 /*return*/, ESendStatus.SUCCESS];
                        }
                        if (!!this.isInited) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        status = this.sendStatusIdStatus.get(id);
                        return [2 /*return*/, status ? status : ESendStatus.FAIL];
                }
            });
        });
    };
    PostSendStatusHandler.prototype.clear = function () {
        this.sendStatusIdStatus.clear();
        this.sendStatusIdVersion.clear();
    };
    PostSendStatusHandler.prototype.addIdAndVersion = function (id, version, status) {
        if (status === void 0) { status = ESendStatus.INPROGRESS; }
        this.sendStatusIdStatus.set(id, status);
        this.sendStatusIdVersion.set(version, id);
    };
    PostSendStatusHandler.prototype.removeVersion = function (version) {
        var id = this.sendStatusIdVersion.get(version);
        if (id) {
            this.sendStatusIdStatus.delete(id);
            this.sendStatusIdVersion.delete(version);
        }
    };
    PostSendStatusHandler.prototype.isVersionInPreInsert = function (version) {
        return __awaiter(this, void 0, void 0, function () {
            var id;
            return __generator(this, function (_a) {
                if (!this.isInited) {
                    this.init();
                }
                id = this.sendStatusIdVersion.get(version);
                return [2 /*return*/, id
                        ? {
                            id: id,
                            existed: true,
                        }
                        : {
                            id: 0,
                            existed: false,
                        }];
            });
        });
    };
    return PostSendStatusHandler;
}());

var PostService = /** @class */ (function (_super) {
    __extends(PostService, _super);
    function PostService() {
        var _a;
        var _this = this;
        var subscriptions = (_a = {},
            _a[SOCKET.POST] = handleDataFromSexio,
            _a);
        _this = _super.call(this, PostDao, PostAPI, baseHandleData$1, subscriptions) || this;
        _this.postSendStatusHandler = new PostSendStatusHandler();
        return _this;
    }
    PostService.prototype.getPostsFromLocal = function (_a) {
        var groupId = _a.groupId, offset = _a.offset, limit = _a.limit;
        return __awaiter(this, void 0, void 0, function () {
            var postDao, posts, result, itemIds_1, itemDao, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        postDao = daoManager.getDao(PostDao);
                        return [4 /*yield*/, postDao.queryPostsByGroupId(groupId, offset, limit)];
                    case 1:
                        posts = _c.sent();
                        result = {
                            posts: [],
                            items: [],
                            hasMore: true,
                        };
                        if (!(posts.length !== 0)) return [3 /*break*/, 3];
                        result.posts = posts;
                        itemIds_1 = [];
                        posts.forEach(function (post) {
                            if (post.item_ids && post.item_ids[0]) {
                                itemIds_1 = itemIds_1.concat(post.item_ids);
                            }
                            if (post.at_mention_item_ids && post.at_mention_item_ids[0]) {
                                itemIds_1 = itemIds_1.concat(post.at_mention_item_ids);
                            }
                        });
                        itemDao = daoManager.getDao(ItemDao);
                        _b = result;
                        return [4 /*yield*/, itemDao.getItemsByIds(__spread(Array.from(new Set(itemIds_1))))];
                    case 2:
                        _b.items = _c.sent();
                        _c.label = 3;
                    case 3: return [2 /*return*/, result];
                }
            });
        });
    };
    PostService.prototype.getPostsFromRemote = function (_a) {
        var groupId = _a.groupId, postId = _a.postId, limit = _a.limit, direction = _a.direction;
        return __awaiter(this, void 0, void 0, function () {
            var params, requestResult, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        params = {
                            limit: limit,
                            direction: direction,
                            group_id: groupId,
                        };
                        if (postId) {
                            params.post_id = postId;
                        }
                        return [4 /*yield*/, PostAPI.requestPosts(params)];
                    case 1:
                        requestResult = _b.sent();
                        result = {
                            posts: [],
                            items: [],
                            hasMore: false,
                        };
                        if (requestResult && requestResult.data) {
                            result.posts = requestResult.data.posts;
                            result.items = requestResult.data.items;
                            if (result.posts.length === limit) {
                                result.hasMore = true;
                            }
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    PostService.prototype.getPostsByGroupId = function (_a) {
        var groupId = _a.groupId, offset = _a.offset, _b = _a.postId, postId = _b === void 0 ? 0 : _b, _c = _a.limit, limit = _c === void 0 ? 20 : _c;
        return __awaiter(this, void 0, void 0, function () {
            var result, remoteResult, posts, items, e_1;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.getPostsFromLocal({
                                groupId: groupId,
                                offset: offset,
                                limit: limit,
                            })];
                    case 1:
                        result = _d.sent();
                        if (result.posts.length !== 0) {
                            return [2 /*return*/, result];
                        }
                        // should try to get more posts from server
                        mainLogger.debug(
                        // tslint:disable-next-line:max-line-length
                        "getPostsByGroupId groupId:" + groupId + " postId:" + postId + " limit:" + limit + " offset:" + offset + "} no data in local DB, should do request");
                        return [4 /*yield*/, this.getPostsFromRemote({
                                groupId: groupId,
                                postId: postId,
                                limit: limit,
                                direction: 'older',
                            })];
                    case 2:
                        remoteResult = _d.sent();
                        return [4 /*yield*/, baseHandleData$1(remoteResult.posts)];
                    case 3:
                        posts = (_d.sent()) || [];
                        return [4 /*yield*/, itemHandleData(remoteResult.items)];
                    case 4:
                        items = (_d.sent()) || [];
                        return [2 /*return*/, {
                                posts: posts,
                                items: items,
                                hasMore: remoteResult.hasMore,
                            }];
                    case 5:
                        e_1 = _d.sent();
                        mainLogger.error(e_1);
                        return [2 /*return*/, {
                                posts: [],
                                items: [],
                                hasMore: true,
                            }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    PostService.prototype.getPostSendStatus = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = {
                            id: id
                        };
                        return [4 /*yield*/, this.postSendStatusHandler.getStatus(id)];
                    case 1: return [2 /*return*/, (_a.status = _b.sent(),
                            _a)];
                }
            });
        });
    };
    PostService.prototype.isVersionInPreInsert = function (version) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.postSendStatusHandler.isVersionInPreInsert(version)];
            });
        });
    };
    PostService.prototype.sendPost = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var info;
            return __generator(this, function (_a) {
                // handle params, if has file item, should send file first then send post
                mainLogger.info('start to send log');
                info = PostServiceHandler.buildPostInfo(params);
                return [2 /*return*/, this.innerSendPost(info)];
            });
        });
    };
    PostService.prototype.reSendPost = function (postId) {
        return __awaiter(this, void 0, void 0, function () {
            var dao, post;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(postId < 0)) return [3 /*break*/, 2];
                        dao = daoManager.getDao(PostDao);
                        return [4 /*yield*/, dao.get(postId)];
                    case 1:
                        post = _a.sent();
                        if (post) {
                            post = PostServiceHandler.buildResendPostInfo(post);
                            return [2 /*return*/, this.innerSendPost(post)];
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/, null];
                }
            });
        });
    };
    PostService.prototype.innerSendPost = function (info) {
        return __awaiter(this, void 0, void 0, function () {
            var id, resp, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!info) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.handlePreInsertProcess(info)];
                    case 1:
                        _a.sent();
                        id = info.id;
                        delete info.id;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, PostAPI.sendPost(info)];
                    case 3:
                        resp = _a.sent();
                        if (resp && resp.data) {
                            info.id = id;
                            return [2 /*return*/, this.handleSendPostSuccess(resp.data, info)];
                            // resp = await baseHandleData(resp.data);
                        }
                        // error, notifiy, should add error handle after IResponse give back error info
                        return [2 /*return*/, this.handleSendPostFail(id, info.version)];
                    case 4:
                        e_2 = _a.sent();
                        mainLogger.warn('crash of innerSendPost()');
                        this.handleSendPostFail(id, info.version);
                        throw ErrorParser.parse(e_2);
                    case 5: return [2 /*return*/, null];
                }
            });
        });
    };
    PostService.prototype.handlePreInsertProcess = function (postInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var dao;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.postSendStatusHandler.addIdAndVersion(postInfo.id, postInfo.version);
                        notificationCenter.emitEntityPut(ENTITY.POST, [postInfo]);
                        notificationCenter.emitEntityPut(ENTITY.POST_SENT_STATUS, [
                            {
                                id: postInfo.id,
                                status: ESendStatus.INPROGRESS,
                            },
                        ]);
                        dao = daoManager.getDao(PostDao);
                        return [4 /*yield*/, dao.put(postInfo)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PostService.prototype.handleSendPostSuccess = function (data, oldPost) {
        return __awaiter(this, void 0, void 0, function () {
            var post, obj, result, dao;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.postSendStatusHandler.removeVersion(oldPost.version);
                        post = transform(data);
                        obj = {
                            id: oldPost.id,
                            data: post,
                        };
                        result = [obj];
                        notificationCenter.emitEntityReplace(ENTITY.POST, result);
                        dao = daoManager.getDao(PostDao);
                        return [4 /*yield*/, dao.delete(oldPost.id)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, dao.put(post)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    PostService.prototype.handleSendPostFail = function (id, version) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.postSendStatusHandler.removeVersion(version);
                notificationCenter.emitEntityPut(ENTITY.POST_SENT_STATUS, [
                    {
                        id: id,
                        status: ESendStatus.FAIL,
                    },
                ]);
                return [2 /*return*/, []];
            });
        });
    };
    PostService.prototype.sendItemFile = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var itemService, result, options, info, resp, posts, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        // {groupId, file}
                        if (!params.groupId) {
                            return [2 /*return*/, null];
                        }
                        itemService = ItemService.getInstance();
                        return [4 /*yield*/, itemService.sendFile(params)];
                    case 1:
                        result = _a.sent();
                        if (!result) return [3 /*break*/, 4];
                        options = {
                            text: '',
                            itemIds: [Number(result.id)],
                            groupId: Number(params.groupId),
                        };
                        info = PostServiceHandler.buildPostInfo(options);
                        delete info.id; // should merge sendItemFile function into sendPost
                        return [4 /*yield*/, PostAPI.sendPost(info)];
                    case 2:
                        resp = _a.sent();
                        return [4 /*yield*/, baseHandleData$1(resp.data)];
                    case 3:
                        posts = _a.sent();
                        return [2 /*return*/, posts[0]];
                    case 4: return [2 /*return*/, null];
                    case 5:
                        e_3 = _a.sent();
                        mainLogger.error("post service sendItemFile error" + e_3);
                        return [2 /*return*/, null];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * POST related operations
     * PIN,LIKE,DELETE,EDIT,FAVORITE
     */
    PostService.prototype.modifyPost = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var post, resp, result, e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, PostServiceHandler.buildModifiedPostInfo(params)];
                    case 1:
                        post = _a.sent();
                        if (!(params.postId && post)) return [3 /*break*/, 4];
                        return [4 /*yield*/, PostAPI.editPost(params.postId, post)];
                    case 2:
                        resp = _a.sent();
                        return [4 /*yield*/, baseHandleData$1(resp.data)];
                    case 3:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                    case 4: return [2 /*return*/, null];
                    case 5:
                        e_4 = _a.sent();
                        mainLogger.warn("modify post error " + JSON.stringify(e_4));
                        return [2 /*return*/, null];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    PostService.prototype.deletePost = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var postDao, post, response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (id < 0) {
                            return [2 /*return*/, null];
                        }
                        postDao = daoManager.getDao(PostDao);
                        return [4 /*yield*/, postDao.get(id)];
                    case 1:
                        post = _a.sent();
                        if (!post) return [3 /*break*/, 5];
                        post.deactivated = true;
                        post._id = post.id;
                        delete post.id;
                        return [4 /*yield*/, PostAPI.putDataById(id, post)];
                    case 2:
                        response = _a.sent();
                        if (!response.data) return [3 /*break*/, 4];
                        return [4 /*yield*/, baseHandleData$1(response.data)];
                    case 3:
                        result = _a.sent();
                        if (result && result.length) {
                            return [2 /*return*/, result[0]];
                        }
                        _a.label = 4;
                    case 4: 
                    // error
                    return [2 /*return*/, null];
                    case 5: 
                    // error
                    return [2 /*return*/, null];
                }
            });
        });
    };
    PostService.prototype.likePost = function (postId, personId, toLike) {
        return __awaiter(this, void 0, void 0, function () {
            var postDao, post, response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (postId < 0) {
                            return [2 /*return*/, null];
                        }
                        postDao = daoManager.getDao(PostDao);
                        return [4 /*yield*/, postDao.get(postId)];
                    case 1:
                        post = _a.sent();
                        if (!post) return [3 /*break*/, 5];
                        post.likes = post.likes || [];
                        if (toLike) {
                            if (post.likes.indexOf(personId) === -1) {
                                post.likes.push(personId);
                            }
                            else {
                                return [2 /*return*/, post];
                            }
                        }
                        else {
                            if (post.likes.indexOf(personId) !== -1) {
                                post.likes = post.likes.filter(function (id) { return id !== personId; });
                            }
                            else {
                                return [2 /*return*/, post];
                            }
                        }
                        post._id = post.id;
                        delete post.id;
                        return [4 /*yield*/, PostAPI.putDataById(postId, post)];
                    case 2:
                        response = _a.sent();
                        if (!response.data) return [3 /*break*/, 4];
                        return [4 /*yield*/, baseHandleData$1(response.data)];
                    case 3:
                        result = _a.sent();
                        if (result && result.length) {
                            return [2 /*return*/, result[0]];
                        }
                        _a.label = 4;
                    case 4: 
                    // error
                    return [2 /*return*/, null];
                    case 5: 
                    // error
                    return [2 /*return*/, null];
                }
            });
        });
    };
    PostService.prototype.bookmarkPost = function (postId, toBook) {
        return __awaiter(this, void 0, void 0, function () {
            var profileService, profile;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        profileService = ProfileService.getInstance();
                        return [4 /*yield*/, profileService.putFavoritePost(postId, toBook)];
                    case 1:
                        profile = _a.sent();
                        return [2 /*return*/, profile];
                }
            });
        });
    };
    PostService.prototype.getLastPostOfGroup = function (groupId) {
        var postDao = daoManager.getDao(PostDao);
        return postDao.queryLastPostByGroupId(groupId);
    };
    PostService.serviceName = 'PostService';
    return PostService;
}(BaseService));

function transform$1(item) {
    var clone = Object.assign({}, item);
    var groupIds = new Set();
    var groupStates = {};
    Object.keys(clone).forEach(function (key) {
        if (key === '_id') {
            clone.id = clone._id;
            delete clone[key];
        }
        var keys = [
            'deactivated_post_cursor',
            'group_missed_calls_count',
            'group_tasks_count',
            'last_read_through',
            'unread_count',
            'unread_mentions_count',
            'read_through',
            'marked_as_unread',
            'post_cursor',
            'previous_post_cursor',
        ];
        var m = key.match(new RegExp("(" + keys.join('|') + "):(\\d+)"));
        if (m) {
            var groupState = m[1];
            var groupId = m[2];
            var value = clone[key];
            if (!groupStates[groupId]) {
                groupStates[groupId] = {
                    id: Number(groupId),
                };
            }
            groupStates[groupId][groupState] = value;
            groupIds.add(groupId);
            delete clone[key];
        }
    });
    clone.groupState = __spread(Array.from(groupIds)).map(function (id) { return groupStates[id]; });
    clone.away_status_history = clone.away_status_history || [];
    return clone;
    /* eslint-enable no-underscore-dangle */
}
function getStates(state) {
    var transformedData = [];
    var myState = [];
    var groupStates = [];
    state.forEach(function (item) {
        var transformed = transform$1(item);
        transformedData.push(transformed);
        var groupState = transformed.groupState, rest = __rest(transformed, ["groupState"]);
        groupStates = groupStates.concat(groupState);
        if (Object.keys(rest).length) {
            myState.push(rest);
        }
    });
    return { myState: myState, groupStates: groupStates, transformedData: transformedData };
}
function stateHandleData(state) {
    return __awaiter(this, void 0, void 0, function () {
        var stateDao, groupStateDao, savePromises, _a, myState, groupStates;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (state.length === 0) {
                        return [2 /*return*/];
                    }
                    stateDao = daoManager.getDao(StateDao);
                    groupStateDao = daoManager.getDao(GroupStateDao);
                    savePromises = [];
                    _a = getStates(state), myState = _a.myState, groupStates = _a.groupStates;
                    notificationCenter.emitEntityPut(ENTITY.MY_STATE, myState);
                    savePromises.push(stateDao.bulkUpdate(myState));
                    if (groupStates.length) {
                        notificationCenter.emitEntityUpdate(ENTITY.GROUP_STATE, groupStates);
                        savePromises.push(groupStateDao.bulkUpdate(groupStates));
                    }
                    return [4 /*yield*/, Promise.all(savePromises)];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// export { getStates, transform };
// export default stateHandleData;

var StateService = /** @class */ (function (_super) {
    __extends(StateService, _super);
    function StateService() {
        var _a;
        var _this = this;
        var subscriptions = (_a = {},
            _a[SOCKET.STATE] = stateHandleData,
            _a);
        _this = _super.call(this, GroupStateDao, StateAPI, stateHandleData, subscriptions) || this;
        return _this;
    }
    StateService.buildMarkAsReadParam = function (groupId, lastPostId) {
        var _a;
        return _a = {},
            _a["unread_count:" + groupId] = 0,
            _a["unread_mentions_count:" + groupId] = 0,
            _a["read_through:" + groupId] = lastPostId,
            _a["marked_as_unread:" + groupId] = false,
            _a;
    };
    StateService.buildUpdateStateParam = function (groupId, lastPostId) {
        var _a;
        return _a = {
                last_group_id: groupId
            },
            _a["last_read_through:" + groupId] = lastPostId,
            _a;
    };
    // getGroupStateById(groupId) {
    //   const groupStateDao = daoManager.getDao(GroupStateDao);
    //   return groupStateDao.get(groupId);
    // }
    StateService.prototype.getById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result, myState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getByIdFromDao(id)];
                    case 1:
                        result = _a.sent();
                        if (!!result) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.getMyState()];
                    case 2:
                        myState = _a.sent();
                        if (!myState) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.getByIdFromAPI(myState.id)];
                    case 3:
                        result = _a.sent(); // state id
                        _a.label = 4;
                    case 4: return [2 /*return*/, result];
                }
            });
        });
    };
    StateService.prototype.markAsRead = function (groupId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.updateState(groupId, StateService.buildMarkAsReadParam)];
            });
        });
    };
    StateService.prototype.updateLastGroup = function (groupId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.updateState(groupId, StateService.buildUpdateStateParam)];
            });
        });
    };
    StateService.prototype.getAllGroupStatesFromLocal = function () {
        var groupStateDao = daoManager.getDao(GroupStateDao);
        return groupStateDao.getAll();
    };
    StateService.prototype.updateState = function (groupId, paramBuilder) {
        return __awaiter(this, void 0, void 0, function () {
            var lastPost, currentState, groupStateDao, state;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getLastPostOfGroup(groupId)];
                    case 1:
                        lastPost = _a.sent();
                        return [4 /*yield*/, this.getMyState()];
                    case 2:
                        currentState = _a.sent();
                        groupStateDao = daoManager.getDao(GroupStateDao);
                        return [4 /*yield*/, groupStateDao.get(groupId)];
                    case 3:
                        state = _a.sent();
                        if (!(currentState && lastPost && !!state && state.unread_count && state.unread_count > 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, StateAPI.saveStatePartial(currentState.id, paramBuilder(groupId, lastPost.id))];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    StateService.prototype.getLastPostOfGroup = function (groupId) {
        return __awaiter(this, void 0, void 0, function () {
            var postService, lastPost;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        postService = PostService.getInstance();
                        return [4 /*yield*/, postService.getLastPostOfGroup(groupId)];
                    case 1:
                        lastPost = _a.sent();
                        if (!lastPost) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, lastPost];
                }
            });
        });
    };
    StateService.prototype.getMyState = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stateDao, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        stateDao = daoManager.getDao(StateDao);
                        return [4 /*yield*/, stateDao.getFirst()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    StateService.serviceName = 'StateService';
    return StateService;
}(BaseService));

function checkIncompleteGroupsMembers(groups) {
    return __awaiter(this, void 0, void 0, function () {
        var e_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!groups.length) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, Promise.all(groups.map(function (group) { return __awaiter(_this, void 0, void 0, function () {
                            var personService;
                            return __generator(this, function (_a) {
                                if (group.members) {
                                    personService = PersonService.getInstance();
                                    return [2 /*return*/, personService.getPersonsByIds(group.members)];
                                }
                                return [2 /*return*/, group];
                            });
                        }); }))];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    e_1 = _a.sent();
                    mainLogger.warn("checkIncompleteGroupsMembers error: " + e_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, []];
            }
        });
    });
}
function getTransformData(groups) {
    return __awaiter(this, void 0, void 0, function () {
        var transformedData;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(groups.map(function (item) { return __awaiter(_this, void 0, void 0, function () {
                        var finalItem, resp, transformed;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    finalItem = item;
                                    if (!(finalItem._delta && item._id)) return [3 /*break*/, 2];
                                    return [4 /*yield*/, GroupAPI.requestGroupById(item._id)];
                                case 1:
                                    resp = _a.sent();
                                    if (resp && resp.data) {
                                        finalItem = resp.data;
                                    }
                                    else {
                                        return [2 /*return*/, null];
                                    }
                                    _a.label = 2;
                                case 2:
                                    transformed = transform(finalItem);
                                    return [2 /*return*/, transformed];
                            }
                        });
                    }); }))];
                case 1:
                    transformedData = _a.sent();
                    return [2 /*return*/, transformedData.filter(function (item) { return item !== null; })];
            }
        });
    });
}
function doNotification$1(deactivatedData, normalData) {
    return __awaiter(this, void 0, void 0, function () {
        var profileService, profile, favIds, archivedTeams, deactivatedTeams, deactivatedFavGroups, deactivatedGroups, addedTeams, addedGroups, addFavorites;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    profileService = ProfileService.getInstance();
                    return [4 /*yield*/, profileService.getProfile()];
                case 1:
                    profile = _a.sent();
                    favIds = (profile && profile.favorite_group_ids) || [];
                    archivedTeams = normalData.filter(function (item) { return item.is_archived; });
                    deactivatedTeams = deactivatedData
                        .filter(function (item) { return item.is_team && favIds.indexOf(item.id) === -1; });
                    deactivatedTeams = deactivatedTeams
                        .concat(archivedTeams.filter(function (item) { return favIds.indexOf(item.id) !== -1; }));
                    deactivatedFavGroups = deactivatedData
                        .filter(function (item) { return favIds.indexOf(item.id) !== -1; });
                    deactivatedFavGroups = deactivatedFavGroups.concat(archivedTeams.filter(function (item) { return favIds.indexOf(item.id) !== -1; }));
                    deactivatedGroups = deactivatedData
                        .filter(function (item) { return !item.is_team && favIds.indexOf(item.id) === -1; });
                    if (deactivatedFavGroups.length > 0) {
                        notificationCenter.emitEntityDelete(ENTITY.FAVORITE_GROUPS, deactivatedFavGroups);
                    }
                    if (deactivatedTeams.length > 0) {
                        notificationCenter.emitEntityDelete(ENTITY.TEAM_GROUPS, deactivatedTeams);
                    }
                    if (deactivatedGroups.length > 0) {
                        notificationCenter.emitEntityDelete(ENTITY.PEOPLE_GROUPS, deactivatedGroups);
                    }
                    addedTeams = normalData
                        .filter(function (item) { return item.is_team && favIds.indexOf(item.id) === -1; });
                    return [4 /*yield*/, filterGroups(addedTeams, GROUP_QUERY_TYPE.TEAM, 20)];
                case 2:
                    addedTeams = _a.sent();
                    addedGroups = normalData
                        .filter(function (item) { return !item.is_team && favIds.indexOf(item.id) === -1; });
                    return [4 /*yield*/, filterGroups(addedGroups, GROUP_QUERY_TYPE.GROUP, 10)];
                case 3:
                    addedGroups = _a.sent();
                    addFavorites = normalData.filter(function (item) { return favIds.indexOf(item.id) !== -1; });
                    addedTeams.length > 0 && notificationCenter.emitEntityPut(ENTITY.TEAM_GROUPS, addedTeams);
                    addedGroups.length > 0 && notificationCenter.emitEntityPut(ENTITY.PEOPLE_GROUPS, addedGroups);
                    addFavorites.length > 0 && notificationCenter.emitEntityPut(ENTITY.FAVORITE_GROUPS, addFavorites);
                    return [2 /*return*/];
            }
        });
    });
}
function operateGroupDao(deactivatedData, normalData) {
    return __awaiter(this, void 0, void 0, function () {
        var dao, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    dao = daoManager.getDao(GroupDao);
                    if (deactivatedData.length) {
                        daoManager.getDao(DeactivatedDao).bulkPut(deactivatedData);
                        dao.bulkDelete(deactivatedData.map(function (item) { return item.id; }));
                    }
                    if (!normalData.length) return [3 /*break*/, 2];
                    return [4 /*yield*/, dao.bulkPut(normalData)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [3 /*break*/, 4];
                case 3:
                    e_2 = _a.sent();
                    console.error("operateGroupDao error " + JSON.stringify(e_2));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function saveDataAndDoNotification(groups) {
    return __awaiter(this, void 0, void 0, function () {
        var deactivatedData, normalData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    deactivatedData = groups.filter(function (item) { return item && item.deactivated; });
                    normalData = groups.filter(function (item) { return item && !item.deactivated; });
                    return [4 /*yield*/, operateGroupDao(deactivatedData, normalData)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, doNotification$1(deactivatedData, normalData)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, normalData];
            }
        });
    });
}
function handleData(groups) {
    return __awaiter(this, void 0, void 0, function () {
        var accountDao, userId, transformData, data, normalGroups;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (groups.length === 0) {
                        return [2 /*return*/];
                    }
                    accountDao = daoManager.getKVDao(AccountDao);
                    userId = Number(accountDao.get(ACCOUNT_USER_ID));
                    return [4 /*yield*/, getTransformData(groups)];
                case 1:
                    transformData = _a.sent();
                    data = transformData
                        .filter(function (item) { return item !== null && item.members && item.members.indexOf(userId) !== -1; });
                    return [4 /*yield*/, saveDataAndDoNotification(data)];
                case 2:
                    normalGroups = _a.sent();
                    // check all group members exist in local or not if not, should get from remote
                    // seems we only need check normal groups, don't need to check deactivated data
                    return [4 /*yield*/, checkIncompleteGroupsMembers(normalGroups)];
                case 3:
                    // check all group members exist in local or not if not, should get from remote
                    // seems we only need check normal groups, don't need to check deactivated data
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function handleFavoriteGroupsChanged(oldProfile, newProfile) {
    return __awaiter(this, void 0, void 0, function () {
        var oldIds, newIds, moreFavorites, moreNormals, dao, resultGroups, teams, groups, resultGroups, teams, groups;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(oldProfile && newProfile)) return [3 /*break*/, 4];
                    oldIds = oldProfile.favorite_group_ids || [];
                    newIds = newProfile.favorite_group_ids || [];
                    if (!(oldIds.sort().toString() !== newIds.sort().toString())) return [3 /*break*/, 4];
                    moreFavorites = _.difference(newIds, oldIds);
                    moreNormals = _.difference(oldIds, newIds);
                    dao = daoManager.getDao(GroupDao);
                    if (!moreFavorites.length) return [3 /*break*/, 2];
                    return [4 /*yield*/, dao.queryGroupsByIds(moreFavorites)];
                case 1:
                    resultGroups = _a.sent();
                    notificationCenter.emitEntityPut(ENTITY.FAVORITE_GROUPS, resultGroups);
                    teams = resultGroups.filter(function (item) { return item.is_team; });
                    notificationCenter.emitEntityDelete(ENTITY.TEAM_GROUPS, teams);
                    groups = resultGroups.filter(function (item) { return !item.is_team; });
                    notificationCenter.emitEntityDelete(ENTITY.PEOPLE_GROUPS, groups);
                    _a.label = 2;
                case 2:
                    if (!moreNormals.length) return [3 /*break*/, 4];
                    return [4 /*yield*/, dao.queryGroupsByIds(moreNormals)];
                case 3:
                    resultGroups = _a.sent();
                    notificationCenter.emitEntityDelete(ENTITY.FAVORITE_GROUPS, resultGroups);
                    teams = resultGroups.filter(function (item) { return item.is_team; });
                    groups = resultGroups.filter(function (item) { return !item.is_team; });
                    notificationCenter.emitEntityPut(ENTITY.TEAM_GROUPS, teams);
                    notificationCenter.emitEntityPut(ENTITY.PEOPLE_GROUPS, groups);
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function handleGroupMostRecentPostChanged(posts) {
    return __awaiter(this, void 0, void 0, function () {
        var groupDao, groups;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    groupDao = daoManager.getDao(GroupDao);
                    return [4 /*yield*/, Promise.all(posts.map(function (post) { return __awaiter(_this, void 0, void 0, function () {
                            var group;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, groupDao.get(post.group_id)];
                                    case 1:
                                        group = _a.sent();
                                        if (group) {
                                            group.most_recent_content_modified_at = post.modified_at;
                                            group.most_recent_post_created_at = post.created_at;
                                            group.most_recent_post_id = post.id;
                                            return [2 /*return*/, group];
                                        }
                                        return [2 /*return*/, null];
                                }
                            });
                        }); }))];
                case 1:
                    groups = _a.sent();
                    return [4 /*yield*/, saveDataAndDoNotification(groups.filter(function (item) { return item !== null; }))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * extract out groups/teams which are latest than the oldest unread post
 * or just use default limit length
 */
function filterGroups(groups, groupType, defaultLength) {
    if (groupType === void 0) { groupType = GROUP_QUERY_TYPE.TEAM; }
    return __awaiter(this, void 0, void 0, function () {
        var stateService, states, result, statesIds, times, time_1, tmpGroups;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (groups.length <= defaultLength) {
                        return [2 /*return*/, groups];
                    }
                    stateService = StateService.getInstance();
                    return [4 /*yield*/, stateService.getAllGroupStatesFromLocal()];
                case 1:
                    states = _a.sent();
                    result = groups;
                    statesIds = states
                        ? states.filter(function (item) { return item.unread_count || item.unread_mentions_count; }).map(function (item) { return item.id; })
                        : [];
                    if (statesIds.length > 0) {
                        times = result
                            .filter(function (item) { return statesIds.includes(item.id); })
                            .map(function (item) { return item.most_recent_post_created_at || Infinity; })
                            .sort() || [];
                        if (times.length > 0) {
                            time_1 = times[0];
                            if (time_1 !== Infinity) {
                                tmpGroups = result.filter(function (item) {
                                    return item.most_recent_post_created_at && item.most_recent_post_created_at >= time_1;
                                });
                                if (tmpGroups.length > defaultLength) {
                                    result = tmpGroups;
                                    return [2 /*return*/, result];
                                }
                            }
                        }
                    }
                    if (result.length > defaultLength) {
                        result.length = defaultLength;
                    }
                    return [2 /*return*/, result];
            }
        });
    });
}

/*
 * @Author: Lily.li (lily.li@ringcentral.com)
 * @Date: 2018-06-06 15:55:39
 * @Last Modified by: Valor Lin (valor.lin@ringcentral.com)
 * @Last Modified time: 2018-08-06 15:53:43
 */
var MAX_LEVEL = 31;
var Permission = /** @class */ (function () {
    function Permission(params, userId, companyId) {
        this.group = params;
        this.userId = userId;
        this.companyId = companyId;
    }
    Permission.createPermissionsMask = function (newPermissions) {
        var permissions_mask = _.reduce(newPermissions, function (mask, value, key) {
            if (value) {
                return mask + PERMISSION_ENUM[key];
            }
            return mask;
        }, 0);
        return permissions_mask;
    };
    Permission.prototype.isPublic = function () {
        return this.group.is_public;
    };
    Permission.prototype.isGuest = function () {
        var guest_user_company_ids = this.group.guest_user_company_ids;
        return guest_user_company_ids && guest_user_company_ids.includes(this.companyId);
    };
    Permission.prototype.isSelfGroup = function () {
        var _a = this.group, is_team = _a.is_team, members = _a.members, creator_id = _a.creator_id;
        return !is_team && members && members.length === 1 && creator_id === members[0];
    };
    Permission.prototype.isTeamGroup = function () {
        return this.group.is_team;
    };
    Permission.prototype.isCommonGroup = function () {
        return !this.isTeamGroup() && !this.isSelfGroup();
    };
    Object.defineProperty(Permission.prototype, "level", {
        get: function () {
            var level = 0;
            this.isSelfGroup() && (level = MAX_LEVEL - PERMISSION_ENUM.TEAM_ADD_MEMBER);
            this.isCommonGroup() && (level = MAX_LEVEL - PERMISSION_ENUM.TEAM_ADMIN);
            this.isTeamGroup() && (level = this.getTeamGroupLevel() || 0);
            return level;
        },
        enumerable: true,
        configurable: true
    });
    Permission.prototype.getTeamGroupLevel = function () {
        if (!this.group.permissions) {
            return MAX_LEVEL;
        }
        var _a = this.group.permissions, admin = _a.admin, user = _a.user;
        if (admin && admin.uids.includes(this.userId)) {
            return admin.level || MAX_LEVEL;
        }
        if (user) {
            return user.level;
        }
        return 0;
    };
    Permission.prototype.levelToArray = function (level) {
        var res = [];
        var permission;
        for (permission in PERMISSION_ENUM) {
            if ((permission = Number(permission))) {
                permission & level && res.push(permission);
            }
        }
        return res;
    };
    Permission.prototype.getPermissions = function () {
        var permissions = this.levelToArray(this.level);
        return permissions.filter(this.hasPermission.bind(this));
    };
    Permission.prototype.hasPermission = function (permission) {
        var _a;
        var permissionMap = (_a = {},
            _a[PERMISSION_ENUM.TEAM_ADD_MEMBER] = !this.isGuest() && !this.isSelfGroup(),
            _a[PERMISSION_ENUM.TEAM_PIN_POST] = !this.isGuest(),
            _a);
        return permissionMap[permission] !== false;
    };
    return Permission;
}());

/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-06 10:00:30
 */
var GroupService = /** @class */ (function (_super) {
    __extends(GroupService, _super);
    function GroupService() {
        var _a;
        var _this = this;
        var subscriptions = (_a = {},
            _a[SOCKET.GROUP] = handleData,
            _a[SOCKET.POST] = handleGroupMostRecentPostChanged,
            _a[SERVICE.PROFILE_FAVORITE] = handleFavoriteGroupsChanged,
            _a);
        _this = _super.call(this, GroupDao, GroupAPI, handleData, subscriptions) || this;
        return _this;
    }
    GroupService.prototype.getGroupsByType = function (groupType, offset, limit) {
        if (groupType === void 0) { groupType = GROUP_QUERY_TYPE.ALL; }
        if (offset === void 0) { offset = 0; }
        if (limit === void 0) { limit = 20; }
        return __awaiter(this, void 0, void 0, function () {
            var result, dao, profileService, profile, profileService, profile, favoriteGroupIds, limitLength;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mainLogger.debug("offset:" + offset + " limit:" + limit + " groupType:" + groupType);
                        result = [];
                        dao = daoManager.getDao(GroupDao);
                        if (!(groupType === GROUP_QUERY_TYPE.FAVORITE)) return [3 /*break*/, 4];
                        profileService = ProfileService.getInstance();
                        return [4 /*yield*/, profileService.getProfile()];
                    case 1:
                        profile = _a.sent();
                        if (!(profile &&
                            profile.favorite_group_ids &&
                            profile.favorite_group_ids.length > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, dao.queryGroupsByIds(profile.favorite_group_ids)];
                    case 2:
                        result = (_a.sent());
                        _a.label = 3;
                    case 3: return [3 /*break*/, 10];
                    case 4:
                        if (!(groupType === GROUP_QUERY_TYPE.ALL)) return [3 /*break*/, 6];
                        return [4 /*yield*/, dao.queryAllGroups(offset, limit)];
                    case 5:
                        result = (_a.sent());
                        return [3 /*break*/, 10];
                    case 6:
                        profileService = ProfileService.getInstance();
                        return [4 /*yield*/, profileService.getProfile()];
                    case 7:
                        profile = _a.sent();
                        favoriteGroupIds = profile && profile.favorite_group_ids ? profile.favorite_group_ids : [];
                        return [4 /*yield*/, dao.queryGroups(offset, Infinity, groupType === GROUP_QUERY_TYPE.TEAM, favoriteGroupIds)];
                    case 8:
                        result = (_a.sent());
                        limitLength = groupType === GROUP_QUERY_TYPE.TEAM ? 20 : 10;
                        return [4 /*yield*/, filterGroups(result, groupType, limitLength)];
                    case 9:
                        result = _a.sent();
                        _a.label = 10;
                    case 10: return [2 /*return*/, result];
                }
            });
        });
    };
    // this function should refactor with getGroupsByType
    // we should support to get group by paging
    GroupService.prototype.getLastNGroups = function (n) {
        return __awaiter(this, void 0, void 0, function () {
            var result, dao;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mainLogger.debug("get last " + n + " groups");
                        result = [];
                        dao = daoManager.getDao(GroupDao);
                        return [4 /*yield*/, dao.getLastNGroups(n)];
                    case 1:
                        result = (_a.sent());
                        return [2 /*return*/, result];
                }
            });
        });
    };
    GroupService.prototype.getGroupsByIds = function (ids) {
        return __awaiter(this, void 0, void 0, function () {
            var groups;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!ids.length) return [3 /*break*/, 2];
                        return [4 /*yield*/, Promise.all(ids.map(function (id) { return __awaiter(_this, void 0, void 0, function () {
                                var group;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.getById(id)];
                                        case 1:
                                            group = _a.sent();
                                            return [2 /*return*/, group];
                                    }
                                });
                            }); }))];
                    case 1:
                        groups = (_a.sent());
                        return [2 /*return*/, groups.filter(function (group) { return group !== null; })];
                    case 2: return [2 /*return*/, []];
                }
            });
        });
    };
    GroupService.prototype.getGroupById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.warn('getGroupById() is deprecated use getById() instead.');
                return [2 /*return*/, _super.prototype.getById.call(this, id)];
            });
        });
    };
    GroupService.prototype.getGroupByPersonId = function (personId) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, members, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        userId = daoManager.getKVDao(AccountDao).get(ACCOUNT_USER_ID);
                        members = [Number(personId), Number(userId)];
                        members = uniqueArray(members);
                        return [4 /*yield*/, this.getGroupByMemberList(members)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        e_1 = _a.sent();
                        mainLogger.error("getGroupByPersonId error =>" + e_1);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    GroupService.prototype.getGroupByMemberList = function (members) {
        return __awaiter(this, void 0, void 0, function () {
            var mem, groupDao, result, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        mem = uniqueArray(members);
                        groupDao = daoManager.getDao(GroupDao);
                        return [4 /*yield*/, groupDao.queryGroupByMemberList(mem)];
                    case 1:
                        result = (_a.sent());
                        if (result.length !== 0) {
                            return [2 /*return*/, result];
                        }
                        return [4 /*yield*/, this.requestRemoteGroupByMemberList(mem)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        e_2 = _a.sent();
                        mainLogger.error("getGroupByMemberList error =>" + e_2);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    GroupService.prototype.requestRemoteGroupByMemberList = function (members) {
        return __awaiter(this, void 0, void 0, function () {
            var info, result, group, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        info = GroupServiceHandler.buildNewGroupInfo(members);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, GroupAPI.requestNewGroup(info)];
                    case 2:
                        result = _a.sent();
                        if (!result.data) return [3 /*break*/, 4];
                        group = transform(result.data);
                        return [4 /*yield*/, handleData([result.data])];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, [group]];
                    case 4: return [2 /*return*/, []];
                    case 5:
                        e_3 = _a.sent();
                        mainLogger.error("requestRemoteGroupByMemberList error " + JSON.stringify(e_3));
                        return [2 /*return*/, []];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    GroupService.prototype.getLatestGroup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var groupDao;
            return __generator(this, function (_a) {
                groupDao = daoManager.getDao(GroupDao);
                return [2 /*return*/, groupDao.getLatestGroup()];
            });
        });
    };
    GroupService.prototype.canPinPost = function (postId, group) {
        if (postId > 0 && group && !group.deactivated) {
            if (this.hasPermissionWithGroup(group, PERMISSION_ENUM.TEAM_PIN_POST)) {
                return true;
            }
        }
        return false;
    };
    GroupService.prototype.pinPost = function (postId, groupId, toPin) {
        return __awaiter(this, void 0, void 0, function () {
            var groupDao, group, path, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        groupDao = daoManager.getDao(GroupDao);
                        return [4 /*yield*/, groupDao.get(groupId)];
                    case 1:
                        group = _a.sent();
                        if (!(group && this.canPinPost(postId, group))) return [3 /*break*/, 3];
                        // pinned_post_ids
                        if (toPin) {
                            if (!group.pinned_post_ids || !group.pinned_post_ids.includes(postId)) {
                                group.pinned_post_ids = group.pinned_post_ids
                                    ? group.pinned_post_ids.concat(postId)
                                    : [postId];
                            }
                            else {
                                // do nothing
                                return [2 /*return*/, null];
                            }
                        }
                        else {
                            if (group.pinned_post_ids && group.pinned_post_ids.includes(postId)) {
                                group.pinned_post_ids = group.pinned_post_ids.filter(function (id) { return id !== postId; });
                            }
                            else {
                                // do nothing
                                return [2 /*return*/, null];
                            }
                        }
                        group._id = group.id;
                        delete group.id;
                        path = group.is_team ? "/team/" + group._id : "/group/" + group._id;
                        return [4 /*yield*/, GroupAPI.pinPost(path, group)];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, this.handleResponse(response)];
                    case 3: return [2 /*return*/, null];
                }
            });
        });
    };
    GroupService.prototype.getPermissions = function (group) {
        var accountDao = daoManager.getKVDao(AccountDao);
        var userId = accountDao.get(ACCOUNT_USER_ID);
        var companyId = accountDao.get(ACCOUNT_COMPANY_ID);
        var permission = new Permission(group, userId, companyId);
        return permission.getPermissions();
    };
    GroupService.prototype.hasPermissionWithGroupId = function (group_id, type) {
        return __awaiter(this, void 0, void 0, function () {
            var groupInfo, permissionList;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getById(group_id)];
                    case 1:
                        groupInfo = _a.sent();
                        permissionList = this.getPermissions(groupInfo);
                        return [2 /*return*/, permissionList.includes(type)];
                }
            });
        });
    };
    GroupService.prototype.hasPermissionWithGroup = function (group, type) {
        var permissionList = this.getPermissions(group);
        return permissionList.includes(type);
    };
    GroupService.prototype.addTeamMembers = function (groupId, memberIds) {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, GroupAPI.addTeamMembers(groupId, memberIds)];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, this.handleResponse(resp)];
                }
            });
        });
    };
    GroupService.prototype.createTeam = function (name, creator, memberIds, description, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, isPublic, _b, canAddMember, _c, canPost, _d, canAddIntegrations, _e, canPin, privacy, permissionFlags, userPermissionMask, team, resp, error_1;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 2, , 3]);
                        _a = options.isPublic, isPublic = _a === void 0 ? false : _a, _b = options.canAddMember, canAddMember = _b === void 0 ? false : _b, _c = options.canPost, canPost = _c === void 0 ? false : _c, _d = options.canAddIntegrations, canAddIntegrations = _d === void 0 ? false : _d, _e = options.canPin, canPin = _e === void 0 ? false : _e;
                        privacy = isPublic ? 'protected' : 'private';
                        permissionFlags = {
                            TEAM_ADD_MEMBER: privacy === 'protected' ? true : canAddMember,
                            TEAM_POST: canPost,
                            TEAM_ADD_INTEGRATIONS: canPost ? canAddIntegrations : false,
                            TEAM_PIN_POST: canPost ? canPin : false,
                            TEAM_ADMIN: false,
                        };
                        userPermissionMask = Permission.createPermissionsMask(permissionFlags);
                        team = {
                            privacy: privacy,
                            description: description,
                            set_abbreviation: name,
                            members: memberIds.concat(creator),
                            permissions: {
                                admin: {
                                    uids: [creator],
                                },
                                user: {
                                    uids: [],
                                    level: userPermissionMask,
                                },
                            },
                        };
                        return [4 /*yield*/, GroupAPI.createTeam(team)];
                    case 1:
                        resp = _f.sent();
                        return [2 /*return*/, this.handleResponse(resp)];
                    case 2:
                        error_1 = _f.sent();
                        throw ErrorParser.parse(error_1);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    GroupService.prototype.handleResponse = function (resp) {
        return __awaiter(this, void 0, void 0, function () {
            var group;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(resp && resp.data)) return [3 /*break*/, 2];
                        group = transform(resp.data);
                        return [4 /*yield*/, handleData([resp.data])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, group];
                    case 2: 
                    // should handle errors when error handling ready
                    return [2 /*return*/, null];
                }
            });
        });
    };
    GroupService.serviceName = 'GroupService';
    return GroupService;
}(BaseService));

var ServiceManager$1 = /** @class */ (function (_super) {
    __extends(ServiceManager, _super);
    function ServiceManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ServiceManager.prototype.getInstance = function (ServiceClass) {
        return this.get(ServiceClass);
    };
    return ServiceManager;
}(Manager));
var serviceManager = new ServiceManager$1();

var _this$6 = undefined;
function transform$2(obj) {
    return {
        id: obj.person_id,
        presence: obj.presence,
    };
}
var presenceHandleData = function (presences) { return __awaiter(_this$6, void 0, void 0, function () {
    var transformedData, presenceService;
    return __generator(this, function (_a) {
        if (presences.length === 0) {
            return [2 /*return*/];
        }
        transformedData = presences.map(function (item) { return transform$2(item); });
        notificationCenter.emitEntityPut(ENTITY.PRESENCE, transformedData);
        presenceService = serviceManager.getInstance(PresenceService);
        presenceService.saveToMemory(transformedData);
        return [2 /*return*/];
    });
}); };

var PresenceService = /** @class */ (function (_super) {
    __extends(PresenceService, _super);
    function PresenceService() {
        var _a;
        var _this = this;
        var subscriptions = (_a = {},
            _a[SOCKET.PRESENCE] = function (presence) {
                presenceHandleData([].concat(presence));
            },
            _a);
        _this = _super.call(this, null, null, null, subscriptions) || this;
        // when serviceManager's property "instances" is recycled, it will be destroyed.
        _this.caches = {};
        return _this;
    }
    PresenceService.prototype.saveToMemory = function (presences) {
        var _this = this;
        presences.forEach(function (presence) {
            _this.caches[presence.id] = presence;
        });
    };
    PresenceService.prototype.getById = function (id) {
        return Promise.resolve(this.caches[id]);
    };
    PresenceService.key = 'PresenceService';
    return PresenceService;
}(BaseService));

/**
 * @Author: Andy Hu
 * @Date:   2018-05-30T15:37:24+08:00
 * @Email:  andy.hu@ringcentral.com
 * @Project: Fiji
 * @Last modified by:   andy.hu
 * @Last modified time: 2018-06-13T10:22:24+08:00
 * @Copyright: © RingCentral. All rights reserve
 */
var SearchAPI = /** @class */ (function (_super) {
    __extends(SearchAPI, _super);
    function SearchAPI() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SearchAPI.search = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.glipNetworkClient.get('/search', params)];
            });
        });
    };
    SearchAPI.scrollSearch = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.glipNetworkClient.get('/search_scroll', params)];
            });
        });
    };
    SearchAPI.basePath = '/search';
    return SearchAPI;
}(Api));

/*
 * @Author: Andy Hu
 * @Date: 2018-06-14 23:05:07
 * Copyright © RingCentral. All rights reserved.
 */
var handleData$1 = (function (_a) {
    var results = _a.results, requestId = _a.request_id, scroll_request_id = _a.scroll_request_id;
    var searchService = SearchService.getInstance();
    // cancel the former non-active request
    if (requestId !== searchService.activeServerRequestId) {
        searchService.cancelSearchRequest(requestId);
        return;
    }
    if (!results || results.length === 0) {
        notificationCenter.emitService(SERVICE.SEARCH_END);
        searchService.cancelSearchRequest(searchService.activeServerRequestId);
        return;
    }
    handleSearchResult(results);
});
function handleSearchResult(results) {
    var transformedData = transformAll(results);
    var posts = transformedData.filter(isPost);
    notificationCenter.emitService(SERVICE.SEARCH_SUCCESS, posts);
}
function isPost(item) {
    var id = item.id;
    var typeId = GlipTypeUtil.extractTypeId(id);
    return typeId === TypeDictionary.TYPE_ID_POST;
}

var SearchService = /** @class */ (function (_super) {
    __extends(SearchService, _super);
    function SearchService() {
        var _a;
        var _this = this;
        var subscriptions = (_a = {},
            _a[SOCKET.SEARCH] = handleData$1,
            _a[SOCKET.SEARCH_SCROLL] = handleData$1,
            _a);
        _this = _super.call(this, null, null, null, subscriptions) || this;
        return _this;
    }
    SearchService.prototype.searchContact = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var groupDao, personDao, teams, people, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        groupDao = daoManager.getDao(GroupDao);
                        personDao = daoManager.getDao(PersonDao);
                        return [4 /*yield*/, groupDao.searchTeamByKey(key)];
                    case 1:
                        teams = _a.sent();
                        return [4 /*yield*/, personDao.searchPeopleByKey(key)];
                    case 2:
                        people = _a.sent();
                        return [2 /*return*/, {
                                people: people,
                                teams: teams,
                            }];
                    case 3:
                        e_1 = _a.sent();
                        mainLogger.info("searchContact key ==> " + key + ", error ===> " + e_1);
                        return [2 /*return*/, { people: [], teams: [] }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SearchService.prototype.searchMembers = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var personDao, people, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        personDao = daoManager.getDao(PersonDao);
                        return [4 /*yield*/, personDao.searchPeopleByKey(key)];
                    case 1:
                        people = _a.sent();
                        return [2 /*return*/, people];
                    case 2:
                        e_2 = _a.sent();
                        mainLogger.info("searchMembers key ==> " + key + ", error ===> " + e_2);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SearchService.prototype.cleanQuery = function (queryString) {
        if (queryString === void 0) { queryString = ''; }
        var specialCharactersReg = /[\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]/g; // eslint-disable-line
        var queryStringCleaned = queryString.replace(specialCharactersReg, ' ').trim();
        var shortQueryWords = function (word) {
            return word.length >= SearchService.MIN_QUERY_WORD_LENGTH;
        };
        return queryStringCleaned
            .split(' ')
            .filter(shortQueryWords)
            .join(' ');
    };
    SearchService.prototype.cancelSearchRequest = function (requestId) {
        return __awaiter(this, void 0, void 0, function () {
            var params;
            return __generator(this, function (_a) {
                params = { previous_server_request_id: requestId };
                return [2 /*return*/, SearchAPI.search(params)];
            });
        });
    };
    SearchService.prototype.search = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var cleanedQuery, requestId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.lastQuery = query;
                        cleanedQuery = this.cleanQuery(query.queryString);
                        if (!cleanedQuery) {
                            this.cancel();
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.remoteSearch(query)];
                    case 1:
                        requestId = (_a.sent()).request_id;
                        this.activeServerRequestId = requestId;
                        return [2 /*return*/];
                }
            });
        });
    };
    SearchService.prototype.remoteSearch = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var _params, q, params, resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _params = pick(query, __spread(SearchService.filterKeys, ['scroll_size', 'slice_size']));
                        q = query.queryString;
                        params = Object.assign({ q: q }, _params);
                        return [4 /*yield*/, SearchAPI.search(params)];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, resp.data];
                }
            });
        });
    };
    SearchService.prototype.fetchResultsByPage = function (query) {
        var params = {
            scroll_request_id: query.pageNum,
            search_request_id: this.activeServerRequestId,
        };
        return SearchAPI.scrollSearch(params);
    };
    SearchService.prototype.cancel = function () {
        if (this.activeServerRequestId) {
            this.cancelSearchRequest(this.activeServerRequestId);
            delete this.activeServerRequestId;
        }
    };
    SearchService.serviceName = 'SearchService';
    SearchService.MIN_QUERY_WORD_LENGTH = 1;
    SearchService.filterKeys = [
        'group_id', 'begin_time', 'end_time',
        'creator_id', 'type', 'client_request_id',
    ];
    return SearchService;
}(BaseService));

var SOCKET_LOGGER = 'SOCKET_LOGGER';
var SocketFSM = /** @class */ (function (_super) {
    __extends(SocketFSM, _super);
    function SocketFSM(serverUrl, glipToken) {
        var _this = _super.call(this, {
            transitions: [
                { name: 'init', from: 'none', to: 'idle' },
                { name: 'start', from: 'idle', to: 'connecting' },
                { name: 'stop', from: 'disconnected', to: 'disconnected' },
                { name: 'stop', from: 'disconnecting', to: 'disconnecting' },
                { name: 'stop', from: ['connecting', 'connected'], to: 'disconnecting' },
                { name: 'finishConnect', from: 'connecting', to: 'connected' },
                { name: 'failConnect', from: 'connecting', to: 'disconnected' },
                {
                    name: 'fireDisconnect',
                    from: ['connecting', 'disconnecting', 'connected'],
                    to: 'disconnected',
                },
                { name: 'fireTryReconnect', from: 'disconnected', to: 'connecting' },
            ],
            methods: {
                onInvalidTransition: function (transition, from, to) {
                    this.error("onInvalidTransition " + transition + ": " + from + " => " + to);
                },
                onPendingTransition: function (transition, from, to) {
                    this.warn("onPendingTransition " + transition + ": " + from + " => " + to);
                },
                onTransition: function (lc) {
                    this.info("onTransition " + lc.transition + ": " + lc.from + " => " + lc.to);
                    return true;
                },
                onEnterState: function () {
                    this.info("onEnterState " + this.state);
                    // TO-DO: move out to manager?
                    notificationCenter.emit(SOCKET.STATE_CHANGE, {
                        state: this.state,
                    });
                },
                onInit: function () {
                    this.info("onInit " + this.state);
                    this.socketClient = new SocketClient(this.serverUrl, this.glipToken);
                    this.registerSocketEvents();
                },
                onStart: function () {
                    this.socketClient.socket.connect();
                },
                onStop: function () {
                    var _this = this;
                    this.isStopped = true;
                    setTimeout(function () {
                        if (_this.socketClient && _this.socketClient.socket) {
                            _this.socketClient.socket.reconnection = false;
                            _this.socketClient.socket.disconnect();
                        }
                        // TO-DO: to be test
                        // for connecting state, will have a follow-up socket disconnect event?
                        if (_this.state === 'disconnected') {
                            _this.cleanup();
                        }
                    });
                },
                onFinishConnect: function () {
                    //
                },
                onFireDisconnect: function () {
                    if (this.isStopped) {
                        this.cleanup();
                    }
                },
            },
        }) || this;
        _this.serverUrl = serverUrl;
        _this.glipToken = glipToken;
        _this.socketClient = null;
        _this.isStopped = false;
        _this.latestPongTime = 0;
        _this.logPrefix = '';
        SocketFSM.instanceID += 1;
        _this.name = "_FSM" + SocketFSM.instanceID;
        _this.logPrefix = "[" + SOCKET_LOGGER + " " + _this.name + "]";
        _this.info("serverUrl: " + _this.serverUrl);
        _this.init();
        return _this;
    }
    SocketFSM.prototype.info = function (message) {
        mainLogger.info(this.logPrefix + " " + message);
    };
    SocketFSM.prototype.warn = function (message) {
        mainLogger.warn(this.logPrefix + " " + message);
    };
    SocketFSM.prototype.error = function (message) {
        mainLogger.error(this.logPrefix + " " + message);
    };
    SocketFSM.prototype.cleanup = function () {
        if (this.socketClient) {
            if (this.socketClient.socket) {
                this.socketClient.socket.removeAllListeners();
                this.socketClient.socket = null;
                this.info('cleanup done.');
            }
            this.socketClient = null;
        }
    };
    SocketFSM.prototype.registerSocketEvents = function () {
        var _this = this;
        this.socketClient.socket.on('connect', function (data) {
            _this.info("socket-> connect. " + (data || ''));
            _this.finishConnect();
        });
        this.socketClient.socket.on('connect_error', function (data) {
            _this.info("socket-> connect_error. " + (data || ''));
            _this.failConnect();
        });
        this.socketClient.socket.on('connect_timeout', function (data) {
            _this.info("socket-> connect_timeout. " + (data || ''));
        });
        this.socketClient.socket.on('connecting', function (data) {
            _this.info("socket-> connecting. " + (data || ''));
        });
        this.socketClient.socket.on('disconnect', function (data) {
            _this.info("socket-> disconnect. " + (data || ''));
            _this.fireDisconnect();
        });
        this.socketClient.socket.on('error', function (data) {
            _this.info("socket-> error. " + (data || ''));
        });
        this.socketClient.socket.on('reconnect', function (data) {
            _this.info("socket-> reconnect. " + (data || ''));
            notificationCenter.emit(SOCKET.RECONNECT, data);
        });
        this.socketClient.socket.on('reconnect_attempt', function (data) {
            _this.info("socket-> reconnect_attempt. " + (data || ''));
        });
        this.socketClient.socket.on('reconnect_failed', function (data) {
            _this.info("socket-> reconnect_failed. " + (data || ''));
        });
        this.socketClient.socket.on('reconnect_error', function (data) {
            _this.info("socket-> reconnect_error. " + (data || ''));
        });
        this.socketClient.socket.on('reconnecting', function (data) {
            _this.info("socket-> reconnecting. " + (data || ''));
            _this.fireTryReconnect();
        });
        this.socketClient.socket.on('ping', function (data) {
            _this.info("socket-> ping. " + (data || ''));
        });
        this.socketClient.socket.on('pong', function (data) {
            _this.info("socket-> pong. " + (data || ''));
            _this.latestPongTime = new Date().getTime();
            _this.info("latestPongTime " + _this.latestPongTime);
        });
        this.socketClient.socket.on('presense', function (data) {
            _this.info("socket-> presense. " + (data || ''));
            // TO-DO: move out
            notificationCenter.emit(SOCKET.PRESENCE, data);
        });
        this.socketClient.socket.on('message', function (data) {
            _this.info("socket-> message. " + (data || ''));
            dataDispatcher.onDataArrived(data);
        });
        this.socketClient.socket.on('partial', function (data) {
            _this.info("socket-> partial. " + (data || ''));
        });
        this.socketClient.socket.on('response', function (data) {
            _this.info("socket-> response. " + (data || ''));
        });
        this.socketClient.socket.on('typing', function (data) {
            _this.info("socket-> typing. " + (data || ''));
        });
        this.socketClient.socket.on('system_message', function (data) {
            _this.info("socket-> system_message. " + (data || ''));
        });
        this.socketClient.socket.on('client_config', function (data) {
            _this.info("socket-> client_config. " + (data || ''));
        });
        this.socketClient.socket.on('glip_ping', function (data) {
            _this.info("socket-> glip_ping. " + (data || ''));
        });
        this.socketClient.socket.on('glip_pong', function (data) {
            _this.info("socket-> glip_pong. " + (data || ''));
        });
    };
    SocketFSM.instanceID = 0;
    return SocketFSM;
}(StateMachine));

/*
 * @Author: steven.zhuang
 * @Date: 2018-06-22 16:59:44
 * Copyright © RingCentral. All rights reserved.
 */
var SOCKET_LOGGER$1 = 'SOCKET_LOGGER';
var SocketManager = /** @class */ (function () {
    function SocketManager() {
        this.activeFSM = null;
        // private activeFSM: any = null;
        this.closeingFSMs = {};
        this.successConnectedUrls = [];
        this.hasLoggedIn = false;
        this.logPrefix = "[" + SOCKET_LOGGER$1 + " manager]";
        this._subscribeExternalEvent();
    }
    SocketManager.getInstance = function () {
        if (!SocketManager.instance) {
            mainLogger.info("[" + SOCKET_LOGGER$1 + " manager] getInstance");
            SocketManager.instance = new SocketManager();
        }
        return SocketManager.instance;
    };
    SocketManager.prototype.info = function (message) {
        mainLogger.info(this.logPrefix + " " + message);
    };
    SocketManager.prototype.warn = function (message) {
        mainLogger.warn(this.logPrefix + " " + message);
    };
    SocketManager.prototype.error = function (message) {
        mainLogger.error(this.logPrefix + " " + message);
    };
    SocketManager.prototype.hasActiveFSM = function () {
        return this.activeFSM !== null;
    };
    SocketManager.prototype.ongoingFSMCount = function () {
        var count = 0;
        if (this.activeFSM) {
            count += 1;
        }
        if (this.closeingFSMs) {
            count += Object.keys(this.closeingFSMs).length;
        }
        return count;
    };
    SocketManager.prototype._subscribeExternalEvent = function () {
        var _this = this;
        //  TO-DO: to be test. Should get this event once
        // 1. get scoreboard event from IDL
        // 2. get socket reconnect event
        notificationCenter.on(SERVICE.LOGIN, function () {
            _this._onLogin();
        });
        notificationCenter.on(SERVICE.LOGOUT, function () {
            _this._onLogout();
        });
        notificationCenter.on(CONFIG.SOCKET_SERVER_HOST, function () {
            _this._onServerHostUpdated();
        });
        notificationCenter.on(SOCKET.STATE_CHANGE, function (_a) {
            var state = _a.state;
            _this._onSocketStateChanged(state);
        });
        notificationCenter.on(SOCKET.NETWORK_CHANGE, function (_a) {
            var state = _a.state;
            switch (state) {
                case 'offline':
                    _this._onOffline();
                    break;
                case 'online':
                    _this._onOnline();
                    break;
                case 'focus':
                    _this._onFocus();
                    break;
                default:
                    break;
            }
        });
        notificationCenter.on(SOCKET.RECONNECT, function (data) {
            _this._onReconnect(data);
        });
        // TO-DO: /can-connect API reponse.
    };
    SocketManager.prototype._onLogin = function () {
        this.info('onLogin');
        this.hasLoggedIn = true;
        this.successConnectedUrls = [];
        this._stopActiveFSM();
        this._startFSM();
    };
    SocketManager.prototype._onLogout = function () {
        this.info('onLogout');
        this.hasLoggedIn = false;
        this._stopActiveFSM();
    };
    SocketManager.prototype._onServerHostUpdated = function () {
        var hasActive = this.hasActiveFSM();
        var configDao = daoManager.getKVDao(ConfigDao);
        var serverUrl = configDao.get(SOCKET_SERVER_HOST);
        // tslint:disable-next-line:max-line-length
        this.info("onServerHostUpdated: " + serverUrl + ", hasLoggedIn: " + this.hasLoggedIn + ", hasActiveFSM: " + hasActive);
        if (!this.hasLoggedIn) {
            this.info("Ignore server updated event due to not logged-in");
            return;
        }
        // Ignore invalid url
        if (!serverUrl) {
            this.info("Server URL is changed, but it is an invalid URL.");
            return;
        }
        var runningUrl = this.activeFSM && this.activeFSM.serverUrl;
        if (runningUrl !== serverUrl) {
            this.info("serverUrl changed: " + runningUrl + " ==> " + serverUrl);
            /* To avoid run into death loop in such case:
                scoreboard from /index is different to which from socket reconnect event.
                Solution:
                Save the URL which is connected success, ignore reseting to these tried URLs
            */
            var isNewUrl = this.successConnectedUrls.indexOf(serverUrl) === -1;
            if (!hasActive || isNewUrl) {
                // tslint:disable-next-line:max-line-length
                this.info("Restart due to serverUrl update. hasActive: " + hasActive + ", isNewUrl: " + isNewUrl);
                this._stopActiveFSM();
                this._startFSM();
            }
            else if (!isNewUrl) {
                this.warn("Server URL is changed, but it is used before.");
            }
        }
    };
    SocketManager.prototype._onSocketStateChanged = function (state) {
        if (state === 'connected') {
            var activeState = this.activeFSM && this.activeFSM.state;
            if (state === activeState) {
                var activeUrl = this.activeFSM.serverUrl;
                if (this.successConnectedUrls.indexOf(activeUrl) === -1) {
                    this.successConnectedUrls.push(activeUrl);
                }
            }
            else {
                this.warn("Invalid activeState: " + activeState);
            }
        }
    };
    SocketManager.prototype._onOffline = function () {
        this.info('onOffline');
        this._stopActiveFSM();
    };
    SocketManager.prototype._onOnline = function () {
        this.info('onOnline');
        if (!this.hasLoggedIn) {
            this.info("Ignore online event due to not logged-in");
            return;
        }
        this._stopActiveFSM();
        this._startFSM();
    };
    SocketManager.prototype._onFocus = function () {
        if (!this.activeFSM)
            return;
        var state = this.activeFSM.state;
        // TO-DO:
        if (state !== 'connected' && state !== 'connecting') {
            notificationCenter.emit(SOCKET.STATE_CHANGE, {
                state: 'refresh',
            });
        }
    };
    SocketManager.prototype._onReconnect = function (data) {
        // socket emit reconnect
        if (typeof data === 'number')
            return;
        try {
            var body = JSON.parse(data.body);
            var configDao = daoManager.getKVDao(ConfigDao);
            configDao.put(SOCKET_SERVER_HOST, body.server);
            notificationCenter.emitConfigPut(CONFIG.SOCKET_SERVER_HOST, body.server);
        }
        catch (error) {
            this.warn("fail on socket reconnect: " + error);
        }
    };
    SocketManager.prototype._startFSM = function () {
        // TO-DO: 1. jitter 2. ignore for same serverURL when activeFSM is connected?
        var authDao = daoManager.getKVDao(AuthDao);
        var configDao = daoManager.getKVDao(ConfigDao);
        var glipToken = authDao.get(AUTH_GLIP_TOKEN);
        var serverHost = configDao.get(SOCKET_SERVER_HOST);
        if (serverHost) {
            this.activeFSM = new SocketFSM(serverHost, glipToken);
            this.activeFSM.start();
        }
        // TO-DO: should subscribe closed event to remove self from mananger?
    };
    SocketManager.prototype._stopActiveFSM = function () {
        if (this.activeFSM) {
            this.activeFSM.stop();
            // this.closeingFSMs[this.activeFSM.name] = this.activeFSM;
            this.activeFSM = null;
        }
    };
    return SocketManager;
}());

/*
 * @Author: steven.zhuang
 * @Date: 2018-06-22 16:59:56
 * Copyright © RingCentral. All rights reserved.
 */
// TO-DO: when to load this manager?
var socketManager = SocketManager.getInstance();

// classes

var index$3 = /*#__PURE__*/Object.freeze({
    BaseService: BaseService,
    AccountService: AccountService,
    AuthService: AuthService,
    ConfigService: ConfigService,
    CompanyService: CompanyService$$1,
    GroupService: GroupService,
    ItemService: ItemService,
    PersonService: PersonService,
    PostService: PostService,
    PresenceService: PresenceService,
    ProfileService: ProfileService,
    SearchService: SearchService,
    StateService: StateService,
    notificationCenter: notificationCenter,
    uploadManager: uploadManager,
    serviceManager: serviceManager,
    get SOCKET () { return SOCKET; },
    ENTITY: ENTITY,
    CONFIG: CONFIG,
    SERVICE: SERVICE,
    DOCUMENT: DOCUMENT,
    GROUP_QUERY_TYPE: GROUP_QUERY_TYPE,
    EVENT_TYPES: EVENT_TYPES,
    get PERMISSION_ENUM () { return PERMISSION_ENUM; },
    SHOULD_UPDATE_NETWORK_TOKEN: SHOULD_UPDATE_NETWORK_TOKEN
});

/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-06-08 11:06:00
 */
var LogUploadLogManager = /** @class */ (function () {
    function LogUploadLogManager() {
    }
    LogUploadLogManager.instance = function () {
        if (this._instance) {
            return this._instance;
        }
        this._instance = new this();
        return this._instance;
    };
    LogUploadLogManager.prototype.doUpload = function (userInfo, logInfo) {
        return axios({
            method: 'POST',
            url: "/log/",
            data: { userInfo: userInfo, logInfo: logInfo },
        });
    };
    return LogUploadLogManager;
}());

var DEFAULT_EMAIL = 'service@glip.com';
notificationCenter.on(DOCUMENT.VISIBILITYCHANGE, function (_a) {
    var isHidden = _a.isHidden;
    if (isHidden) {
        LogControlManager.instance().doUpload();
    }
});
var LogControlManager = /** @class */ (function () {
    function LogControlManager() {
        this._isUploading = false;
        this._enabledLog = true;
        this._isDebugMode = true;
    }
    LogControlManager.instance = function () {
        if (this._instance) {
            return this._instance;
        }
        this._instance = new LogControlManager();
        return this._instance;
    };
    LogControlManager.prototype.setDebugMode = function (isDebug) {
        this._isDebugMode = isDebug;
        this._updateLogSystemLevel();
    };
    LogControlManager.prototype.enableLog = function (enable) {
        this._enabledLog = enable;
        this._updateLogSystemLevel();
    };
    LogControlManager.prototype.flush = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.doUpload();
                return [2 /*return*/];
            });
        });
    };
    LogControlManager.prototype.doUpload = function () {
        return __awaiter(this, void 0, void 0, function () {
            var logs, userInfo, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._isUploading) {
                            return [2 /*return*/];
                        }
                        if (this._isDebugMode) {
                            // should not doupload in debug mode
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, logManager.getLogs()];
                    case 1:
                        logs = _a.sent();
                        if (this.logIsEmpty(logs)) {
                            return [2 /*return*/];
                        }
                        this._isUploading = true;
                        return [4 /*yield*/, this._getUserInfo()];
                    case 2:
                        userInfo = _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, 6, 7]);
                        return [4 /*yield*/, LogUploadLogManager.instance().doUpload(userInfo, logs)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 5:
                        err_1 = _a.sent();
                        mainLogger.error(err_1);
                        return [3 /*break*/, 7];
                    case 6:
                        logManager.clearLogs();
                        this._isUploading = false;
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    LogControlManager.prototype.logIsEmpty = function (logs) {
        if (logs) {
            var keys = Object.keys(logs);
            for (var i = 0; i < keys.length; i += 1) {
                if (Array.isArray(logs[keys[i]]) && logs[keys[i]].length !== 0) {
                    return false;
                }
            }
        }
        return true;
    };
    LogControlManager.prototype._getUserInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var accountService, email, id, userId, clientId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        accountService = AccountService.getInstance();
                        return [4 /*yield*/, accountService.getUserEmail()];
                    case 1:
                        email = (_a.sent()) || DEFAULT_EMAIL;
                        id = accountService.getCurrentUserId();
                        userId = id ? id.toString() : '';
                        clientId = accountService.getClientId();
                        return [2 /*return*/, {
                                email: email,
                                userId: userId,
                                clientId: clientId,
                            }];
                }
            });
        });
    };
    LogControlManager.prototype._updateLogSystemLevel = function () {
        // set log level to log system
        // TODO let it all level now, should reset to above code after implement service framework
        mainLogger.info("_isDebugMode : " + this._isDebugMode + " _enabledLog: " + this._enabledLog);
        var level = LOG_LEVEL.ALL;
        logManager.setAllLoggerLevel(level);
    };
    return LogControlManager;
}());

/*
 * @Author: Lily.li
 * @Date: 2018-06-22 12:08:27
 * Copyright © RingCentral. All rights reserved.
 */
var ProgressBar = /** @class */ (function () {
    function ProgressBar() {
        this._counter = 0;
        this._step = 1;
        this._isDone = false;
    }
    Object.defineProperty(ProgressBar.prototype, "counter", {
        get: function () {
            return this._counter;
        },
        enumerable: true,
        configurable: true
    });
    ProgressBar.prototype.start = function () {
        this._counter += 1;
        NProgress.start();
    };
    ProgressBar.prototype.update = function (e) {
        var _this = this;
        var percentage = Math.min(Math.floor(Number(e.loaded) / e.total), 1);
        if (!e.lengthComputable) {
            this._step > 0 ? (this._step -= 0.1) : (this._step = 0);
            percentage -= this._step;
            requestAnimationFrame(function () {
                console.log((percentage * 100).toFixed(2) + '%');
                if (percentage <= 0.9 && !_this._isDone) {
                    NProgress.inc(percentage);
                    _this.update(e);
                }
                else {
                    _this.stop();
                }
            });
            return;
        }
        NProgress.inc(percentage);
    };
    ProgressBar.prototype.stop = function () {
        this._counter -= 1;
        if (this._counter <= 0) {
            this._isDone = true;
            NProgress.done();
        }
    };
    return ProgressBar;
}());
var progressBar = new ProgressBar();

var _this$7 = undefined;
var fetchIndexData = function () { return __awaiter(_this$7, void 0, void 0, function () {
    var params, configDao, lastIndexTimestamp, requestConfig, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                progressBar.start();
                params = {};
                configDao = daoManager.getKVDao(ConfigDao);
                lastIndexTimestamp = configDao.get(LAST_INDEX_TIMESTAMP);
                if (lastIndexTimestamp) {
                    notificationCenter.emitService(SERVICE.FETCH_INDEX_DATA_EXIST);
                    // index newer than api need move back 5 mins
                    params.newer_than = String(lastIndexTimestamp - 300000);
                }
                requestConfig = {
                    onDownloadProgress: function (e) {
                        progressBar.update(e);
                    },
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, , 3, 4]);
                return [4 /*yield*/, indexData(params, requestConfig)];
            case 2:
                result = _a.sent();
                return [3 /*break*/, 4];
            case 3:
                progressBar.stop();
                return [7 /*endfinally*/];
            case 4:
                // logger.timeEnd('fetch index data');
                mainLogger.debug("fetch index data: , " + result);
                return [2 /*return*/, result];
        }
    });
}); };

/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-04-16 09:35:24
 * Copyright © RingCentral. All rights reserved.
 */
var accountHandleData = function (_a) {
    var userId = _a.userId, companyId = _a.companyId, profileId = _a.profileId, clientConfig = _a.clientConfig;
    var dao = daoManager.getKVDao(AccountDao);
    if (userId) {
        notificationCenter.emitConfigPut(ACCOUNT_USER_ID, userId);
        dao.put(ACCOUNT_USER_ID, userId);
    }
    if (companyId) {
        notificationCenter.emitConfigPut(ACCOUNT_COMPANY_ID, companyId);
        dao.put(ACCOUNT_COMPANY_ID, companyId);
    }
    if (profileId) {
        notificationCenter.emitConfigPut(ACCOUNT_PROFILE_ID, profileId);
        dao.put(ACCOUNT_PROFILE_ID, profileId);
    }
    if (clientConfig) {
        notificationCenter.emitConfigPut(ACCOUNT_CLIENT_CONFIG, clientConfig);
        dao.put(ACCOUNT_CLIENT_CONFIG, clientConfig);
    }
};

var _this$8 = undefined;
var dispatchIncomingData = function (data) {
    var userId = data.user_id, companyId = data.company_id, profile = data.profile, _a = data.companies, companies = _a === void 0 ? [] : _a, _b = data.items, items = _b === void 0 ? [] : _b, _c = data.presences, presences = _c === void 0 ? [] : _c, state = data.state, _d = data.people, people = _d === void 0 ? [] : _d, _e = data.groups, groups = _e === void 0 ? [] : _e, _f = data.teams, teams = _f === void 0 ? [] : _f, _g = data.posts, posts = _g === void 0 ? [] : _g, _h = data.max_posts_exceeded, maxPostsExceeded = _h === void 0 ? false : _h, clientConfig = data.client_config;
    var arrState = [];
    if (state && Object.keys(state).length > 0) {
        arrState.push(state);
    }
    var arrProfile = [];
    if (profile && Object.keys(profile).length > 0) {
        arrProfile.push(profile);
    }
    return Promise.all([
        accountHandleData({
            userId: userId,
            companyId: companyId,
            clientConfig: clientConfig,
            profileId: profile ? profile._id : undefined,
        }),
        companyHandleData(companies),
        itemHandleData(items),
        presenceHandleData(presences),
        stateHandleData(arrState),
    ])
        .then(function () { return profileHandleData(arrProfile); })
        .then(function () { return personHandleData(people); })
        .then(function () { return handleData(groups); })
        .then(function () { return handleData(teams); })
        .then(function () { return postHandleData(posts, maxPostsExceeded); });
};
var handleData$2 = function (result) { return __awaiter(_this$8, void 0, void 0, function () {
    var _a, _b, timestamp, _c, scoreboard, configDao, error_1;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, , 3]);
                if (!(result instanceof Object) || !(result.data instanceof Object)) {
                    return [2 /*return*/]; // sometimes indexData return false
                }
                // logger.time('handle index data');
                return [4 /*yield*/, dispatchIncomingData(result.data)];
            case 1:
                // logger.time('handle index data');
                _d.sent();
                _a = result.data, _b = _a.timestamp, timestamp = _b === void 0 ? null : _b, _c = _a.scoreboard, scoreboard = _c === void 0 ? null : _c;
                configDao = daoManager.getKVDao(ConfigDao);
                if (timestamp) {
                    configDao.put(LAST_INDEX_TIMESTAMP, timestamp);
                    notificationCenter.emitConfigPut(CONFIG.LAST_INDEX_TIMESTAMP, timestamp);
                }
                if (scoreboard) {
                    configDao.put(SOCKET_SERVER_HOST, scoreboard);
                    notificationCenter.emitConfigPut(CONFIG.SOCKET_SERVER_HOST, scoreboard);
                }
                notificationCenter.emitService(SERVICE.FETCH_INDEX_DATA_DONE);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _d.sent();
                mainLogger.error(error_1);
                notificationCenter
                    .emitService(SERVICE.FETCH_INDEX_DATA_ERROR, { error: ErrorParser.parse(error_1) });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };

var SyncService = /** @class */ (function (_super) {
    __extends(SyncService, _super);
    function SyncService() {
        var _a;
        var _this = this;
        var subscriptions = (_a = {},
            _a[SOCKET.STATE_CHANGE] = function (_a) {
                var state = _a.state;
                if (state === 'connected' || state === 'refresh') {
                    _this.syncData();
                }
            },
            _a);
        _this = _super.call(this, null, null, null, subscriptions) || this;
        return _this;
    }
    SyncService.prototype.syncData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetchIndexData()];
                    case 1:
                        result = _a.sent();
                        handleData$2(result);
                        return [2 /*return*/];
                }
            });
        });
    };
    return SyncService;
}(BaseService));

var AM = AccountManager;
var defaultDBConfig = {
    adapter: 'dexie',
};
var Sdk = /** @class */ (function () {
    function Sdk(daoManager$$1, accountManager, serviceManager, networkManager, syncService) {
        this.daoManager = daoManager$$1;
        this.accountManager = accountManager;
        this.serviceManager = serviceManager;
        this.networkManager = networkManager;
        this.syncService = syncService;
    }
    Sdk.prototype.init = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var apiConfig, dbConfig, loginResp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        apiConfig = merge({}, defaultConfig, config.api);
                        dbConfig = merge({}, defaultDBConfig, config.db);
                        // Initialize foundation
                        Foundation.init({
                            // TODO refactor foundation, extract biz logic from `foundation` to `sdk`.
                            rcConfig: {
                                rc: apiConfig.rc,
                                glip2: apiConfig.glip2,
                                server: apiConfig.rc.server,
                                apiPlatform: apiConfig.rc.apiPlatform,
                                apiPlatformVersion: apiConfig.rc.apiPlatformVersion,
                            },
                            dbAdapter: dbConfig.adapter,
                        });
                        Api.init(apiConfig);
                        // Sync service should always start before login
                        this.serviceManager.startService(SyncService.name);
                        notificationCenter.on(SHOULD_UPDATE_NETWORK_TOKEN, this.updateNetworkToken.bind(this));
                        // Listen to account events to init network and service
                        this.accountManager.on(AM.EVENT_LOGIN, this.onLogin.bind(this));
                        this.accountManager.on(AM.EVENT_LOGOUT, this.onLogout.bind(this));
                        this.accountManager.on(AM.EVENT_SUPPORTED_SERVICE_CHANGE, this.updateServiceStatus.bind(this));
                        loginResp = this.accountManager.syncLogin(AutoAuthenticator.name);
                        if (loginResp && loginResp.success) {
                            // TODO replace all LOGIN listen on notificationCenter
                            // with accountManager.on(EVENT_LOGIN)
                            notificationCenter.emitService(SERVICE.LOGIN);
                        }
                        return [4 /*yield*/, this.daoManager.initDatabase()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Sdk.prototype.onLogin = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.updateNetworkToken();
                        return [4 /*yield*/, this.syncService.syncData()];
                    case 1:
                        _a.sent();
                        this.accountManager.updateSupportedServices();
                        return [2 /*return*/];
                }
            });
        });
    };
    Sdk.prototype.onLogout = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.networkManager.clearToken();
                        this.serviceManager.stopAllServices();
                        return [4 /*yield*/, this.daoManager.deleteDatabase()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Sdk.prototype.updateNetworkToken = function () {
        var authDao = this.daoManager.getKVDao(AuthDao);
        var glipToken = authDao.get(AUTH_GLIP_TOKEN);
        var rcToken = authDao.get(AUTH_RC_TOKEN);
        var glip2Token = authDao.get(AUTH_GLIP2_TOKEN);
        if (glipToken) {
            this.networkManager.setOAuthToken(new Token(glipToken), HandleByGlip);
            this.networkManager.setOAuthToken(new Token(glipToken), HandleByUpload);
        }
        if (rcToken) {
            this.networkManager.setOAuthToken(rcToken, HandleByRingCentral);
            this.networkManager.setOAuthToken(rcToken, HandleByGlip2);
        }
        if (glip2Token) {
            this.networkManager.setOAuthToken(glip2Token, HandleByGlip2);
        }
    };
    Sdk.prototype.updateServiceStatus = function (services, isStart) {
        if (isStart) {
            this.serviceManager.startServices(services);
        }
        else {
            this.serviceManager.stopServices(services);
        }
    };
    return Sdk;
}());

/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-07-08 07:52:37
 * Copyright © RingCentral. All rights reserved.
 */
var registerConfigs = {
    classes: [
        // DAOs
        // { name: AccountDao.name, value: AccountDao },
        // { name: PostDao.name, value: PostDao },
        // { name: GroupDao.name, value: GroupDao },
        // { name: CompanyDao.name, value: CompanyDao },
        // { name: ItemDao.name, value: ItemDao },
        // { name: PersonDao.name, value: PersonDao },
        // { name: ProfileDao.name, value: ProfileDao },
        // { name: StateDao.name, value: StateDao },
        // { name: ConfigDao.name, value: ConfigDao },
        // { name: AuthDao.name, value: AuthDao },
        // Authenticator
        { name: RCPasswordAuthenticator.name, value: RCPasswordAuthenticator },
        { name: AutoAuthenticator.name, value: AutoAuthenticator, injects: [DaoManager.name] },
        { name: UnifiedLoginAuthenticator.name, value: UnifiedLoginAuthenticator },
        // Account
        { name: RCAccount.name, value: RCAccount },
        { name: GlipAccount.name, value: GlipAccount },
        // Services
        { name: PostService.name, value: PostService },
        { name: GroupService.name, value: GroupService },
        { name: CompanyService$$1.name, value: CompanyService$$1 },
        { name: ItemService.name, value: ItemService },
        { name: PersonService.name, value: PersonService },
        { name: PresenceService.name, value: PresenceService },
        { name: ProfileService.name, value: ProfileService },
        { name: SearchService.name, value: SearchService },
        { name: StateService.name, value: StateService },
        { name: ConfigService.name, value: ConfigService, injects: [AuthService.name] },
        { name: AuthService.name, value: AuthService, injects: [AccountManager.name] },
        { name: AccountService.name, value: AccountService },
        { name: SyncService.name, value: SyncService },
        // Manager
        {
            name: AccountManager.name,
            value: AccountManager,
            injects: [Container.name, ServiceManager.name],
        },
        {
            name: ServiceManager.name,
            value: ServiceManager,
            injects: [Container.name],
        },
        // Sdk
        {
            name: Sdk.name,
            value: Sdk,
            injects: [
                DaoManager.name,
                AccountManager.name,
                ServiceManager.name,
                NetworkManager.name,
                SyncService.name,
            ],
        },
    ],
    asyncClasses: [],
    constants: [
        // TODO register as class instead
        { name: DaoManager.name, value: daoManager },
        { name: SocketManager.name, value: socketManager },
        { name: NetworkManager.name, value: NetworkManager.Instance },
    ],
};

/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-05-23 09:41:54
 * Copyright © RingCentral. All rights reserved.
 */
registerConfigs.classes.forEach(function (config) { return container.registerClass(config); });
// registerConfigs.asyncClasses.forEach(config => container.registerAsyncClass(config));
registerConfigs.constants.forEach(function (config) { return container.registerConstantValue(config); });
var sdk = container.get(Sdk.name);

export { sdk as Sdk, sdk, index$3 as service, index as utils, index$1 as dao, index$2 as api, TypeDictionary as GlipTypeDictionary, LogControlManager, AbstractAccount, AccountManager, AbstractService, ServiceManager, Container };
