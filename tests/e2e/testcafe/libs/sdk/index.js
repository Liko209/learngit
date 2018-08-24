'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

let eventemitter2 = require('eventemitter2');
let HttpStatus = require('http-status-codes');
let Dexie = _interopDefault(require('dexie'));
let foundation = require('./foundation');
let _ = _interopDefault(require('lodash'));
let stringNaturalCompare = require('string-natural-compare');
let merge = _interopDefault(require('lodash/merge'));
let btoa = _interopDefault(require('btoa'));

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

let extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (let p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

let __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (let s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
          for (let p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    let _$$1 = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
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
    let m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    let i = m.call(o), r, ar = [], e;
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
    for (let ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-07-12 13:34:51
 * Copyright © RingCentral. All rights reserved
*/
//  collision rate is less than 1/2^^122
function generateUUID() {
    let date = new Date().getTime();
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (date + Math.random() * 16) % 16 | 0;
        date = Math.floor(date / 16);
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
    return uuid;
}

/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-07-09 15:32:58
 * Copyright © RingCentral. All rights reserved
*/
let EVENT_TYPES = {
    REPLACE: 'replace',
    PUT: 'put',
    UPDATE: 'update',
    DELETE: 'delete',
};
let PERMISSION_ENUM;
(function (PERMISSION_ENUM) {
  PERMISSION_ENUM[PERMISSION_ENUM["TEAM_POST"] = 1] = "TEAM_POST";
    PERMISSION_ENUM[PERMISSION_ENUM["TEAM_ADD_MEMBER"] = 2] = "TEAM_ADD_MEMBER";
    PERMISSION_ENUM[PERMISSION_ENUM["TEAM_ADD_INTEGRATIONS"] = 4] = "TEAM_ADD_INTEGRATIONS";
    PERMISSION_ENUM[PERMISSION_ENUM["TEAM_PIN_POST"] = 8] = "TEAM_PIN_POST";
    PERMISSION_ENUM[PERMISSION_ENUM["TEAM_ADMIN"] = 16] = "TEAM_ADMIN";
})(PERMISSION_ENUM || (PERMISSION_ENUM = {}));

// interface Item {
//   id: number;
// }
/**
 * transform array to map structure
 * @param {array} entities
 */
let transform2Map = function (entities) {
    const map = new Map();
    entities.forEach(function (item) {
        map.set(item.id, item);
    });
    return map;
};
let NotificationCenter = /** @class */ (function (_super) {
    __extends(NotificationCenter, _super);
    function NotificationCenter() {
        return _super.call(this, { wildcard: true }) || this;
    }
    NotificationCenter.prototype.trigger = function (key) {
        const args = [];
        for (let _i = 1; _i < arguments.length; _i++) {
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
}(eventemitter2.EventEmitter2));
let notificationCenter = new NotificationCenter();

/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-03-22 13:03:39
 * Copyright © RingCentral. All rights reserved.
 */
let BaseError = /** @class */ (function (_super) {
    __extends(BaseError, _super);
    function BaseError(code, message) {
        const _newTarget = this.constructor;
        const _this = _super.call(this, message) || this;
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
let ErrorTypes = {
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
let ErrorParser = /** @class */ (function () {
    function ErrorParser() {
    }
    ErrorParser.parse = function (err) {
        // need refactor
        // if (!err) return new BaseError(ErrorTypes.UNDEFINED_ERROR, 'Server Crash');
        if (err instanceof Dexie.DexieError) {
            return ErrorParser.dexie(err);
        }
        if (err instanceof foundation.BaseResponse) {
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
        const data = err.data;
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

let Throw = function (code, message) {
    throw new BaseError(code, message);
};
let Aware = function (code, message) {
    notificationCenter.emit('Error', { error: new BaseError(code, message) });
};

let TypeDictionary = {
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
let INTEGRATION_LOWER_ID = 7000;
let GlipTypeUtil = /** @class */ (function () {
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
let _a;
let socketMessageMap = (_a = {},
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
    let _a;
    if (typeof message === 'object') {
        const type = message.type, data = message.data;
        return _a = {}, _a[type] = data, _a;
    }
    let objects = JSON.parse(message).body.objects;
    let result = {};
    objects.forEach(function (arr) {
        arr.forEach(function (obj) {
            if (obj.search_results) {
                result['search'] = obj.search_results;
            }
            const objTypeId = GlipTypeUtil.extractTypeId(obj._id);
            if (socketMessageMap[objTypeId]) {
                const key = socketMessageMap[objTypeId];
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
    const str = [];
    Object.entries(params).forEach(function (_a) {
        const _b = __read(_a, 2), key = _b[0], value = _b[1];
        if (Object.prototype.hasOwnProperty.call(params, key)) {
            str.push(key + "=" + value);
        }
    });
    return str.join('&');
}

/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-02-05 15:07:23
 * Copyright © RingCentral. All rights reserved.
 */
let NetworkClient = /** @class */ (function () {
    // todo refactor config
    function NetworkClient(networkRequests, apiPlatform, defaultVia, apiPlatformVersion) {
        if (apiPlatformVersion === void 0) { apiPlatformVersion = ''; }
        this.apiPlatform = apiPlatform;
        this.networkRequests = networkRequests;
        this.apiPlatformVersion = apiPlatformVersion;
        this.apiMap = new Map();
        this.defaultVia = defaultVia;
    }
    NetworkClient.prototype.request = function (query) {
        const _this = this;
        const via = query.via, path = query.path, method = query.method, params = query.params;
        return new Promise(function (resolve, reject) {
            const apiMapKey = path + '_' + method + "_" + serializeUrlParams(params || {});
            const duplicate = _this._isDuplicate(method, apiMapKey);
            const promiseResolvers = _this.apiMap.get(apiMapKey) || [];
            promiseResolvers.push({ resolve: resolve, reject: reject });
            _this.apiMap.set(apiMapKey, promiseResolvers);
            if (!duplicate) {
                const request = _this.getRequestByVia(query, via);
                request.callback = _this.buildCallback(apiMapKey);
                foundation.NetworkManager.Instance.addApiRequest(request);
            }
        });
    };
    NetworkClient.prototype.buildCallback = function (apiMapKey) {
        const _this = this;
        return function (resp) {
            const promiseResolvers = _this.apiMap.get(apiMapKey);
            if (!promiseResolvers)
                return;
            if (resp.status >= 200 && resp.status < 300) {
                promiseResolvers.forEach(function (_a) {
                    const resolve = _a.resolve;
                    return resolve({
                        status: resp.status,
                        headers: resp.headers,
                        data: resp.data,
                    });
                });
            }
            else {
                promiseResolvers.forEach(function (_a) {
                    const reject = _a.reject;
                    console.log('Network reject', resp);
                    reject(resp);
                });
            }
            _this.apiMap.delete(apiMapKey);
        };
    };
    NetworkClient.prototype.getRequestByVia = function (query, via) {
        if (via === void 0) { via = this.defaultVia; }
        const path = query.path, method = query.method, data = query.data, headers = query.headers, params = query.params, authFree = query.authFree, requestConfig = query.requestConfig;
        const versionPath = this.apiPlatformVersion ? "/" + this.apiPlatformVersion : '';
        const finalPath = "" + versionPath + this.apiPlatform + path;
        return new foundation.NetworkRequestBuilder()
            .setHost(this.networkRequests.host || '')
            .setHandlerType(this.networkRequests.handlerType)
            .setPath(finalPath)
            .setMethod(method)
            .setData(data)
            .setHeaders(headers || {})
            .setParams(params)
            .setAuthfree(authFree || false)
            .setRequestConfig(requestConfig || {})
            .setVia(via)
            .build();
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
            method: foundation.NETWORK_METHOD.GET,
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
            method: foundation.NETWORK_METHOD.POST,
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
            method: foundation.NETWORK_METHOD.PUT,
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
            method: foundation.NETWORK_METHOD.DELETE,
        });
    };
    NetworkClient.prototype._isDuplicate = function (method, apiMapKey) {
        if (method !== foundation.NETWORK_METHOD.GET && method !== foundation.NETWORK_METHOD.DELETE) {
            return false;
        }
        return this.apiMap.has(apiMapKey);
    };
    return NetworkClient;
}());

let defaultConfig = {
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

let HandleByGlip = new /** @class */ (function (_super) {
    __extends(class_1, _super);
    function class_1() {
        const _this = _super !== null && _super.apply(this, arguments) || this;
        _this.defaultVia = foundation.NETWORK_VIA.HTTP;
        return _this;
    }
    class_1.prototype.requestDecoration = function (tokenHandler) {
        const _this = this;
        const handler = tokenHandler;
        return function (request) {
            if (request.needAuth()) {
                request.params = __assign({}, request.params, { tk: (handler.accessToken()) });
            }
            if (_this.rcTokenProvider && request.via === foundation.NETWORK_VIA.SOCKET) {
                request.headers = __assign({}, request.headers, { 'X-RC-Access-Token-Data': _this.rcTokenProvider() });
            }
            return request;
        };
    };
    return class_1;
}(foundation.AbstractHandleType))();

let has = Object.prototype.hasOwnProperty;

let hexTable = (function () {
    const array = [];
    for (let i = 0; i < 256; ++i) {
        array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
    }

    return array;
}());

let compactQueue = function compactQueue(queue) {
    let obj;

    while (queue.length) {
        const item = queue.pop();
        obj = item.obj[item.prop];

        if (Array.isArray(obj)) {
            const compacted = [];

            for (let j = 0; j < obj.length; ++j) {
                if (typeof obj[j] !== 'undefined') {
                    compacted.push(obj[j]);
                }
            }

            item.obj[item.prop] = compacted;
        }
    }

    return obj;
};

let arrayToObject = function arrayToObject(source, options) {
    const obj = options && options.plainObjects ? Object.create(null) : {};
    for (let i = 0; i < source.length; ++i) {
        if (typeof source[i] !== 'undefined') {
            obj[i] = source[i];
        }
    }

    return obj;
};

let merge$1 = function merge$$1(target, source, options) {
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

    let mergeTarget = target;
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
        const value = source[key];

        if (has.call(acc, key)) {
            acc[key] = merge$$1(acc[key], value, options);
        } else {
            acc[key] = value;
        }
        return acc;
    }, mergeTarget);
};

let assign = function assignSingleSource(target, source) {
    return Object.keys(source).reduce(function (acc, key) {
        acc[key] = source[key];
        return acc;
    }, target);
};

let decode = function (str) {
    try {
        return decodeURIComponent(str.replace(/\+/g, ' '));
    } catch (e) {
        return str;
    }
};

let encode = function encode(str) {
    // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
    // It has been adapted here for stricter adherence to RFC 3986
    if (str.length === 0) {
        return str;
    }

    const string = typeof str === 'string' ? str : String(str);

    let out = '';
    for (let i = 0; i < string.length; ++i) {
        let c = string.charCodeAt(i);

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

let compact = function compact(value) {
    const queue = [{ obj: { o: value }, prop: 'o' }];
    const refs = [];

    for (let i = 0; i < queue.length; ++i) {
        const item = queue[i];
        const obj = item.obj[item.prop];

        const keys = Object.keys(obj);
        for (let j = 0; j < keys.length; ++j) {
            const key = keys[j];
            const val = obj[key];
            if (typeof val === 'object' && val !== null && refs.indexOf(val) === -1) {
                queue.push({ obj: obj, prop: key });
                refs.push(val);
            }
        }
    }

    return compactQueue(queue);
};

let isRegExp = function isRegExp(obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
};

let isBuffer = function isBuffer(obj) {
    if (obj === null || typeof obj === 'undefined') {
        return false;
    }

    return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
};

let utils = {
    arrayToObject: arrayToObject,
    assign: assign,
    compact: compact,
    decode: decode,
    encode: encode,
    isBuffer: isBuffer,
    isRegExp: isRegExp,
    merge: merge$1
};

let replace = String.prototype.replace;
let percentTwenties = /%20/g;

let formats = {
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

let arrayPrefixGenerators = {
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

let toISO = Date.prototype.toISOString;

let defaults = {
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

let stringify = function stringify( // eslint-disable-line func-name-matching
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
    let obj = object;
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
            const keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder);
            return [formatter(keyValue) + '=' + formatter(encoder(obj, defaults.encoder))];
        }
        return [formatter(prefix) + '=' + formatter(String(obj))];
    }

    let values = [];

    if (typeof obj === 'undefined') {
        return values;
    }

    let objKeys;
    if (Array.isArray(filter)) {
        objKeys = filter;
    } else {
        const keys = Object.keys(obj);
        objKeys = sort ? keys.sort(sort) : keys;
    }

    for (let i = 0; i < objKeys.length; ++i) {
        const key = objKeys[i];

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

let stringify_1 = function (object, opts) {
    let obj = object;
    const options = opts ? utils.assign({}, opts) : {};

    if (options.encoder !== null && options.encoder !== undefined && typeof options.encoder !== 'function') {
        throw new TypeError('Encoder has to be a function.');
    }

    const delimiter = typeof options.delimiter === 'undefined' ? defaults.delimiter : options.delimiter;
    const strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : defaults.strictNullHandling;
    const skipNulls = typeof options.skipNulls === 'boolean' ? options.skipNulls : defaults.skipNulls;
    const encode = typeof options.encode === 'boolean' ? options.encode : defaults.encode;
    const encoder = typeof options.encoder === 'function' ? options.encoder : defaults.encoder;
    const sort = typeof options.sort === 'function' ? options.sort : null;
    const allowDots = typeof options.allowDots === 'undefined' ? false : options.allowDots;
    const serializeDate = typeof options.serializeDate === 'function' ? options.serializeDate : defaults.serializeDate;
    const encodeValuesOnly = typeof options.encodeValuesOnly === 'boolean' ? options.encodeValuesOnly : defaults.encodeValuesOnly;
    if (typeof options.format === 'undefined') {
        options.format = formats['default'];
    } else if (!Object.prototype.hasOwnProperty.call(formats.formatters, options.format)) {
        throw new TypeError('Unknown format option provided.');
    }
    const formatter = formats.formatters[options.format];
    let objKeys;
    let filter;

    if (typeof options.filter === 'function') {
        filter = options.filter;
        obj = filter('', obj);
    } else if (Array.isArray(options.filter)) {
        filter = options.filter;
        objKeys = filter;
    }

    let keys = [];

    if (typeof obj !== 'object' || obj === null) {
        return '';
    }

    let arrayFormat;
    if (options.arrayFormat in arrayPrefixGenerators) {
        arrayFormat = options.arrayFormat;
    } else if ('indices' in options) {
        arrayFormat = options.indices ? 'indices' : 'repeat';
    } else {
        arrayFormat = 'indices';
    }

    const generateArrayPrefix = arrayPrefixGenerators[arrayFormat];

    if (!objKeys) {
        objKeys = Object.keys(obj);
    }

    if (sort) {
        objKeys.sort(sort);
    }

    for (let i = 0; i < objKeys.length; ++i) {
        const key = objKeys[i];

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

    const joined = keys.join(delimiter);
    const prefix = options.addQueryPrefix === true ? '?' : '';

    return joined.length > 0 ? prefix + joined : '';
};

let has$1 = Object.prototype.hasOwnProperty;

let defaults$1 = {
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

let parseValues = function parseQueryStringValues(str, options) {
    const obj = {};
    const cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, '') : str;
    const limit = options.parameterLimit === Infinity ? undefined : options.parameterLimit;
    const parts = cleanStr.split(options.delimiter, limit);

    for (let i = 0; i < parts.length; ++i) {
        const part = parts[i];

        const bracketEqualsPos = part.indexOf(']=');
        const pos = bracketEqualsPos === -1 ? part.indexOf('=') : bracketEqualsPos + 1;

        let key, val;
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

let parseObject = function (chain, val, options) {
    let leaf = val;

    for (let i = chain.length - 1; i >= 0; --i) {
        let obj;
        const root = chain[i];

        if (root === '[]') {
            obj = [];
            obj = obj.concat(leaf);
        } else {
            obj = options.plainObjects ? Object.create(null) : {};
            const cleanRoot = root.charAt(0) === '[' && root.charAt(root.length - 1) === ']' ? root.slice(1, -1) : root;
            const index = parseInt(cleanRoot, 10);
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

let parseKeys = function parseQueryStringKeys(givenKey, val, options) {
    if (!givenKey) {
        return;
    }

    // Transform dot notation to bracket notation
    const key = options.allowDots ? givenKey.replace(/\.([^.[]+)/g, '[$1]') : givenKey;

    // The regex chunks

    const brackets = /(\[[^[\]]*])/;
    const child = /(\[[^[\]]*])/g;

    // Get the parent

    let segment = brackets.exec(key);
    const parent = segment ? key.slice(0, segment.index) : key;

    // Stash the parent if it exists

    const keys = [];
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

    let i = 0;
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

let parse = function (str, opts) {
    const options = opts ? utils.assign({}, opts) : {};

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

    const tempObj = typeof str === 'string' ? parseValues(str, options) : str;
    let obj = options.plainObjects ? Object.create(null) : {};

    // Iterate over the keys and setup the new object

    const keys = Object.keys(tempObj);
    for (let i = 0; i < keys.length; ++i) {
        const key = keys[i];
        const newObj = parseKeys(key, tempObj[key], options);
        obj = utils.merge(obj, newObj, options);
    }

    return utils.compact(obj);
};

let lib = {
    formats: formats,
    parse: parse,
    stringify: stringify_1
};
let lib_3 = lib.stringify;

let HandleByGlip2 = new /** @class */ (function (_super) {
    __extends(class_1, _super);
    function class_1() {
        const _this = _super !== null && _super.apply(this, arguments) || this;
        _this.defaultVia = foundation.NETWORK_VIA.HTTP;
        _this.tokenRefreshable = true;
        return _this;
    }
    class_1.prototype.basic = function () {
        return btoa(Api.httpConfig.glip2.clientId + ":" + Api.httpConfig.glip2.clientSecret);
    };
    class_1.prototype.requestDecoration = function (tokenHandler) {
        const handler = tokenHandler;
        return function (request) {
            if (_.isEmpty(tokenHandler)) {
                throw new Error('token handler can not be null.');
            }
            const headers = request.headers;
            if (!headers.Authorization) {
                if (request.needAuth() && handler.isOAuthTokenAvailable()) {
                    headers.Authorization = "Bearer " + handler.accessToken();
                }
                else {
                    headers.Authorization = "Basic " + handler.getBasic();
                }
            }
            const authorization = headers.Authorization;
            if (authorization.startsWith('Basic')) {
                request.data = lib_3(request.data);
            }
            return request;
        };
    };
    return class_1;
}(foundation.AbstractHandleType))();

/*
* @Author: Chris Zhan (chris.zhan@ringcentral.com)
* @Date: 2018-03-05 11:25:49
* Copyright © RingCentral. All rights reserved.
*/
let Query = /** @class */ (function () {
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
        const _b = _a === void 0 ? {} : _a, sortBy = _b.sortBy, desc = _b.desc;
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
            let result;
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
            let result;
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
            let result;
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

let BaseDao = /** @class */ (function () {
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
            const _this = this;
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
            const _this = this;
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
            let array, primKey, saved;
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
            const _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.ensureDBOpened()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.db.getTransaction('rw', [this.collection], function () { return __awaiter(_this, void 0, void 0, function () {
                                const _this = this;
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
    BaseDao.prototype.doInTransation = function (func) {
        return __awaiter(this, void 0, void 0, function () {
            const _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.ensureDBOpened()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.db.getTransaction('rw', [this.collection], function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, func()];
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
    BaseDao.prototype.isDexieDB = function () {
        return this.db instanceof foundation.DexieDB;
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

let BaseKVDao = /** @class */ (function () {
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
        const _this = this;
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

/**
 * Generator unique and indices
 * @param {String} unique
 * @param {Array} indices
 * return {*}
 */
let gen = function (unique, indices, onUpgrade) {
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
let schema = {
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
let ACCOUNT_USER_ID = 'user_id';
let ACCOUNT_PROFILE_ID = 'profile_id';
let ACCOUNT_COMPANY_ID = 'company_id';
let ACCOUNT_CLIENT_CONFIG = 'client_config';
let ACCOUNT_KEYS = [
    ACCOUNT_USER_ID,
    ACCOUNT_PROFILE_ID,
    ACCOUNT_COMPANY_ID,
    ACCOUNT_CLIENT_CONFIG,
];

/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-01 13:24:11
 */
let AccountDao = /** @class */ (function (_super) {
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
let AUTH_GLIP_TOKEN = 'GLIP_TOKEN';
let AUTH_RC_TOKEN = 'RC_TOKEN';
let AUTH_GLIP2_TOKEN = 'GLIP2_TOKEN';
let AUTH_KEYS = [AUTH_GLIP_TOKEN, AUTH_RC_TOKEN, AUTH_GLIP2_TOKEN];

let AuthDao = /** @class */ (function (_super) {
    __extends(AuthDao, _super);
    function AuthDao(kvStorage) {
        return _super.call(this, AuthDao.COLLECTION_NAME, kvStorage, AUTH_KEYS) || this;
    }
    AuthDao.COLLECTION_NAME = 'auth';
    return AuthDao;
}(BaseKVDao));

let CompanyDao = /** @class */ (function (_super) {
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
let LAST_INDEX_TIMESTAMP = 'LAST_INDEX_TIMESTAMP';
let SOCKET_SERVER_HOST = 'SOCKET_SERVER_HOST';
let CONFIG_KEYS = [LAST_INDEX_TIMESTAMP, SOCKET_SERVER_HOST];
let ENV = 'ENV';
let DB_SCHEMA_VERSION = 'DB_SCHEMA_VERSION';
let CLIENT_ID = 'CLIENT_ID';

let ConfigDao = /** @class */ (function (_super) {
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
let GroupDao = /** @class */ (function (_super) {
    __extends(GroupDao, _super);
    // TODO, use IDatabase after import foundation module in
    function GroupDao(db) {
        return _super.call(this, GroupDao.COLLECTION_NAME, db) || this;
    }
    GroupDao.prototype.queryGroups = function (offset, limit, isTeam, excludeIds) {
        if (excludeIds === void 0) { excludeIds = []; }
        return __awaiter(this, void 0, void 0, function () {
            let query;
            return __generator(this, function (_a) {
                foundation.mainLogger.debug("queryGroup isTeam:" + isTeam + " excludeIds:" + excludeIds);
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
                foundation.mainLogger.debug('queryAllGroups');
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
                foundation.mainLogger.debug("searchTeamByKey ==> " + key);
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
                foundation.mainLogger.debug("queryGroupByMemberList members ==> " + members);
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
                        .filter(function (item) { return !item.is_archived && !item.is_team; })
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

let GroupStateDao = /** @class */ (function (_super) {
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
let ItemDao = /** @class */ (function (_super) {
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
            let query;
            return __generator(this, function (_a) {
                query = this.createQuery().contain('group_ids', groupId);
                return [2 /*return*/, limit ? query.limit(limit).toArray() : query.toArray()];
            });
        });
    };
    ItemDao.COLLECTION_NAME = 'item';
    return ItemDao;
}(BaseDao));

let ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');
let DEFAULT_LIMIT = 50;
let PersonDao = /** @class */ (function (_super) {
    __extends(PersonDao, _super);
    // TODO, use IDatabase after import foundation module in
    function PersonDao(db) {
        return _super.call(this, PersonDao.COLLECTION_NAME, db) || this;
    }
    PersonDao.prototype.getAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            let persons;
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
        const _b = _a === void 0 ? {} : _a, _c = _b.offset, offset = _c === void 0 ? 0 : _c, _d = _b.limit, limit = _d === void 0 ? DEFAULT_LIMIT : _d;
        return __awaiter(this, void 0, void 0, function () {
            let persons;
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
        const _b = (_a === void 0 ? {} : _a).limit, limit = _b === void 0 ? DEFAULT_LIMIT : _b;
        return __awaiter(this, void 0, void 0, function () {
            let promises, map, persons;
            const _this = this;
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
                            const filteredPersons = persons.filter(function (person) {
                                const display_name = _this._getNameOfPerson(person);
                                return display_name && display_name.toLowerCase().indexOf(prefix) === 0;
                            });
                            map.set(prefix.toUpperCase(), filteredPersons.slice(0, limit));
                        });
                        // Find persons don't starts with a letter in a-Z
                        promises.unshift((function () { return __awaiter(_this, void 0, void 0, function () {
                            let persons;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this._getPersonsNotStartsWithAlphabet({ limit })];
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
            let length;
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
            let trimmedFullKeyword, keywordParts, keyword, q1_1, q2_1, q3, q1, q2;
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
        const limit = _a.limit;
        return __awaiter(this, void 0, void 0, function () {
            const _this = this;
            return __generator(this, function (_b) {
                return [2 /*return*/, this.createQuery()
                        .orderBy('display_name')
                        .filter(function (person) {
                        const display = _this._getNameOfPerson(person);
                        return !!display && !ALPHABET.includes(display[0].toLowerCase());
                    })
                        .limit(limit)
                        .toArray()];
            });
        });
    };
    PersonDao.prototype._getPersonsCountNotStartsWithAlphabet = function () {
        return __awaiter(this, void 0, void 0, function () {
            const _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createQuery()
                        .orderBy('display_name')
                        .filter(function (person) {
                        const display = _this._getNameOfPerson(person);
                        return !!display && !ALPHABET.includes(display[0].toLowerCase());
                    })
                        .count()];
            });
        });
    };
    PersonDao.prototype._personCompare = function (a, b) {
        const aName = this._getNameOfPerson(a);
        const bName = this._getNameOfPerson(b);
        return stringNaturalCompare.caseInsensitive(aName, bName);
    };
    PersonDao.prototype._getNameOfPerson = function (person) {
        return person && (person.display_name || person.first_name || person.email);
    };
    PersonDao.prototype._searchPersonsByPrefix = function (prefix) {
        return __awaiter(this, void 0, void 0, function () {
            let q1, q2, q3, reg, persons;
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
                            const display_name = person.display_name, first_name = person.first_name;
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

let PostDao = /** @class */ (function (_super) {
    __extends(PostDao, _super);
    // TODO, use IDatabase after import foundation module in
    function PostDao(db) {
        return _super.call(this, PostDao.COLLECTION_NAME, db) || this;
    }
    PostDao.prototype.queryPostsByGroupId = function (groupId, offset, limit) {
        if (offset === void 0) { offset = 0; }
        if (limit === void 0) { limit = Infinity; }
        return __awaiter(this, void 0, void 0, function () {
            let query, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        foundation.mainLogger.debug('queryPostsByGroupId groupId:' + groupId + ' offset:' + offset + ' limit:' + limit);
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
            let query;
            return __generator(this, function (_a) {
                query = this.createQuery();
                return [2 /*return*/, query.anyOf('id', ids).toArray()];
            });
        });
    };
    PostDao.prototype.queryLastPostByGroupId = function (groupId) {
        const query = this.createQuery();
        return query
            .orderBy('created_at', true)
            .equal('group_id', groupId)
            .filter(function (item) { return !item.deactivated; })
            .first();
    };
    PostDao.prototype.queryOldestPostByGroupId = function (groupId) {
        const query = this.createQuery();
        return query
            .orderBy('created_at')
            .equal('group_id', groupId)
            .filter(function (item) { return !item.deactivated; })
            .first();
    };
    PostDao.prototype.purgePostsByGroupId = function (groupId, preserveCount) {
        if (preserveCount === void 0) { preserveCount = 0; }
        return __awaiter(this, void 0, void 0, function () {
            let query, result;
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
            let query;
            return __generator(this, function (_a) {
                query = this.createQuery();
                return [2 /*return*/, query.lessThan('id', 0).toArray()];
            });
        });
    };
    PostDao.COLLECTION_NAME = 'post';
    return PostDao;
}(BaseDao));

let ProfileDao = /** @class */ (function (_super) {
    __extends(ProfileDao, _super);
    // TODO, use IDatabase after import foundation module in
    function ProfileDao(db) {
        return _super.call(this, ProfileDao.COLLECTION_NAME, db) || this;
    }
    ProfileDao.COLLECTION_NAME = 'profile';
    return ProfileDao;
}(BaseDao));

let StateDao = /** @class */ (function (_super) {
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

let DeactivatedDao = /** @class */ (function (_super) {
    __extends(DeactivatedDao, _super);
    function DeactivatedDao(db) {
        return _super.call(this, DeactivatedDao.COLLECTION_NAME, db) || this;
    }
    DeactivatedDao.COLLECTION_NAME = 'deactivated';
    return DeactivatedDao;
}(BaseDao));

let Manager = /** @class */ (function () {
    function Manager() {
        this.instances = new Map();
    }
    Manager.prototype.get = function (Class) {
        const args = [];
        for (let _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        let instance;
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
    Object.defineProperty(Manager.prototype, 'size', {
        get () {
            return this.instances.size;
        },
        enumerable: true,
        configurable: true
    });
    return Manager;
}());

let DaoManager = /** @class */ (function (_super) {
    __extends(DaoManager, _super);
    function DaoManager() {
        const _this = _super.call(this) || this;
        if (typeof window === undefined) {
            _this.kvStorageManager = new foundation.KVStorageManager();
            _this.dbManager = new foundation.DBManager();
        }
        return _this;
    }
    DaoManager.prototype.initDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            let db;
            const _this = this;
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
                        if (db instanceof foundation.DexieDB) {
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
        const database = this.dbManager.getDatabase();
        return this.get(DaoClass, database);
    };
    DaoManager.prototype.getKVDao = function (KVDaoClass) {
        const storage = this.kvStorageManager.getStorage();
        return this.get(KVDaoClass, storage);
    };
    DaoManager.prototype.getStorageQuotaOccupation = function () {
        return __awaiter(this, void 0, void 0, function () {
            let navigator, estimate;
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
        const currentSchemaVersion = this.getKVDao(ConfigDao).get(DB_SCHEMA_VERSION);
        return typeof currentSchemaVersion === 'number' && currentSchemaVersion === schema.version;
    };
    return DaoManager;
}(Manager));

/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-05-23 09:42:06
 * Copyright © RingCentral. All rights reserved.
 */
let daoManager = new DaoManager();

let isObject = function (value) { return Object.prototype.toString.call(value) === '[object Object]'; };
// const isArray = value => Object.prototype.toString.call(value) === '[object Array]';
// const isBoolean = value => Object.prototype.toString.call(value) === '[object Boolean]';
// const isNumber = value => Object.prototype.toString.call(value) === '[object Number]';
// const isString = value => Object.prototype.toString.call(value) === '[object String]';
// const isNull = value => Object.prototype.toString.call(value) === '[object Null]';
// const isUndefined = value => Object.prototype.toString.call(value) === '[object Undefined]';
let isFunction = function (value) { return Object.prototype.toString.call(value) === '[object Function]'; };
// const isRegExp = value => Object.prototype.toString.call(value) === '[object RegExp]';
let isIEOrEdge = typeof navigator !== 'undefined'
    && /(MSIE|Trident|Edge)/.test(navigator.userAgent);
let transform = function (item) {
    if (isObject(item)) {
        /* eslint-disable no-underscore-dangle, no-param-reassign */
        item.id = item.id || item._id || 0;
        delete item._id;
        /* eslint-enable no-underscore-dangle, no-param-reassign */
    }
    return item;
};

let EVENT_SUPPORTED_SERVICE_CHANGE = 'SUPPORTED_SERVICE_CHANGE';
let AbstractAccount = /** @class */ (function (_super) {
    __extends(AbstractAccount, _super);
    function AbstractAccount() {
        const _this = _super !== null && _super.apply(this, arguments) || this;
        _this._supportedServices = [];
        return _this;
    }
    AbstractAccount.prototype.getSupportedServices = function () {
        return this._supportedServices;
    };
    AbstractAccount.prototype.setSupportedServices = function (services) {
        const newServices = _.difference(services, this._supportedServices);
        const removedServices = _.difference(this._supportedServices, services);
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
}(eventemitter2.EventEmitter2));

let EVENT_LOGIN = 'ACCOUNT_MANAGER.EVENT_LOGIN';
let EVENT_LOGOUT = 'ACCOUNT_MANAGER.EVENT_LOGOUT';
let EVENT_SUPPORTED_SERVICE_CHANGE$1 = 'ACCOUNT_MANAGER.EVENT_SUPPORTED_SERVICE_CHANGE';
let AccountManager = /** @class */ (function (_super) {
    __extends(AccountManager, _super);
    function AccountManager(_container) {
        const _this = _super.call(this) || this;
        _this._container = _container;
        _this._isLogin = false;
        _this._accountMap = new Map();
        _this._accounts = [];
        return _this;
    }
    AccountManager.prototype.syncLogin = function (authType, params) {
        const authenticator = this._container.get(authType);
        const resp = authenticator.authenticate(params);
        return this._handleLoginResponse(resp);
    };
    AccountManager.prototype.login = function (authType, params) {
        return __awaiter(this, void 0, void 0, function () {
            let authenticator, resp;
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
        const servicesArray = this._accounts.map(function (account) { return account.getSupportedServices(); });
        return _.flatten(servicesArray);
    };
    AccountManager.prototype.isSupportedService = function (type) {
        const services = this.getSupportedServices();
        return services.includes(type);
    };
    AccountManager.prototype._createAccounts = function (accountInfos) {
        const _this = this;
        const accounts = accountInfos.map(function (_a) {
            const type = _a.type;
            const account = _this._container.get(type);
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
        const accounts = this._createAccounts(resp.accountInfos);
        return {
            accounts,
            success: true,
        };
    };
    AccountManager.EVENT_LOGIN = EVENT_LOGIN;
    AccountManager.EVENT_LOGOUT = EVENT_LOGOUT;
    AccountManager.EVENT_SUPPORTED_SERVICE_CHANGE = EVENT_SUPPORTED_SERVICE_CHANGE$1;
    return AccountManager;
}(eventemitter2.EventEmitter2));

/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-06-24 13:47:01
 * Copyright © RingCentral. All rights reserved
*/
let AbstractService = /** @class */ (function () {
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

let ServiceManager = /** @class */ (function (_super) {
    __extends(ServiceManager, _super);
    function ServiceManager(_container) {
        const _this = _super.call(this) || this;
        _this._container = _container;
        _this._serviceMap = new Map();
        return _this;
    }
    ServiceManager.prototype.getServices = function (names) {
        const services = [];
        this._serviceMap.forEach(function (service, name) {
            if (names.includes(name)) {
                services.push(service);
            }
        });
        return services;
    };
    ServiceManager.prototype.getAllServices = function () {
        const services = [];
        this._serviceMap.forEach(function (value) { return services.push(value); });
        return services;
    };
    ServiceManager.prototype.getAllServiceNames = function () {
        const names = [];
        this._serviceMap.forEach(function (service, name) { return names.push(name); });
        return names;
    };
    ServiceManager.prototype.getService = function (name) {
        return this._serviceMap.get(name) || null;
    };
    ServiceManager.prototype.startService = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            let service;
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
            let promises;
            const _this = this;
            return __generator(this, function (_a) {
                promises = services.map(function (service) { return _this.startService(service); });
                return [2 /*return*/, Promise.all(promises)];
            });
        });
    };
    ServiceManager.prototype.stopService = function (name) {
        const service = this.getService(name);
        if (service) {
            service.stop();
            this._serviceMap.delete(name);
        }
    };
    ServiceManager.prototype.stopServices = function (services) {
        const _this = this;
        services.forEach(function (service) {
            _this.stopService(service);
        });
    };
    ServiceManager.prototype.stopAllServices = function () {
        const _this = this;
        this.getAllServiceNames().forEach(function (service) { return _this.stopService(service); });
    };
    return ServiceManager;
}(eventemitter2.EventEmitter2));

/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-07-06 17:27:18
 * Copyright © RingCentral. All rights reserved.
 */
let container = new foundation.Container({
    singleton: true,
});

let DataDispatcher = /** @class */ (function (_super) {
    __extends(DataDispatcher, _super);
    function DataDispatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataDispatcher.prototype.register = function (key, dataHandler) {
        this.on(key, dataHandler);
    };
    DataDispatcher.prototype.unregister = function (key, dataHandler) {
        this.off(key, dataHandler);
    };
    DataDispatcher.prototype.onDataArrived = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            let entries;
            const _this = this;
            return __generator(this, function (_a) {
                entries = parseSocketMessage(data);
                return [2 /*return*/, Promise.all(Object.keys(entries).map(function (key) {
                        return _this.emitAsync('SOCKET.' + key.toUpperCase(), entries[key]);
                    }))];
            });
        });
    };
    return DataDispatcher;
}(eventemitter2.EventEmitter2));
let dataDispatcher = new DataDispatcher();

let throwError = function (text) {
    throw new Error(
    // tslint:disable-next-line:max-line-length
    text + ' is undefined! ' + text + ' must be passed to Service constructor like this super(DaoClass, ApiClass, handleData)');
};
let BaseService = /** @class */ (function (_super) {
    __extends(BaseService, _super);
    function BaseService(DaoClass, ApiClass, handleData, _subscriptions) {
        if (_subscriptions === void 0) { _subscriptions = {}; }
        const _this = _super.call(this) || this;
        _this.DaoClass = DaoClass;
        _this.ApiClass = ApiClass;
        _this.handleData = handleData;
        _this._subscriptions = _subscriptions;
        foundation.mainLogger.info('BaseService constructor');
        return _this;
    }
    BaseService.getInstance = function () {
        return container.get(this.name);
    };
    BaseService.prototype.getById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            let result;
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
            let dao, result;
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
            let result, arr;
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
        const _b = _a === void 0 ? {} : _a, _c = _b.offset, offset = _c === void 0 ? 0 : _c, _d = _b.limit, limit = _d === void 0 ? Infinity : _d;
        return __awaiter(this, void 0, void 0, function () {
            let dao;
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
        const _b = _a === void 0 ? {} : _a, _c = _b.offset, offset = _c === void 0 ? 0 : _c, _d = _b.limit, limit = _d === void 0 ? Infinity : _d;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_e) {
                return [2 /*return*/, this.getAllFromDao({ offset, limit })];
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
            const _b = __read(_a, 2), eventName = _b[0], fn = _b[1];
            if (eventName.startsWith('SOCKET')) {
                return dataDispatcher.register(eventName, fn);
            }
            notificationCenter.on(eventName, fn);
        });
    };
    BaseService.prototype._unsubscribe = function () {
        Object.entries(this._subscriptions).forEach(function (_a) {
            const _b = __read(_a, 2), eventName = _b[0], fn = _b[1];
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
let AccountService = /** @class */ (function (_super) {
    __extends(AccountService, _super);
    function AccountService() {
        const _this = _super.call(this) || this;
        _this.accountDao = daoManager.getKVDao(AccountDao);
        return _this;
    }
    AccountService.prototype.getCurrentUserId = function () {
        const userId = this.accountDao.get(ACCOUNT_USER_ID);
        if (!userId) {
            foundation.mainLogger.warn('there is not UserId Id');
            return null;
        }
        return Number(userId);
    };
    AccountService.prototype.getCurrentUserProfileId = function () {
        const profileId = this.accountDao.get(ACCOUNT_PROFILE_ID);
        if (!profileId) {
            foundation.mainLogger.warn('there is not profile Id');
            return null;
        }
        return Number(profileId);
    };
    AccountService.prototype.getCurrentCompanyId = function () {
        const companyId = this.accountDao.get(ACCOUNT_COMPANY_ID);
        if (!companyId) {
            foundation.mainLogger.warn('there is not companyId Id');
            return null;
        }
        return Number(companyId);
    };
    AccountService.prototype.getCurrentUserInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            let userId, company_id, personDao, personInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userId = Number(this.accountDao.get(ACCOUNT_USER_ID));
                        company_id = Number(this.accountDao.get(ACCOUNT_COMPANY_ID));
                        if (!userId) {
                            return [2 /*return*/, {}];
                        }
                        personDao = daoManager.getDao(PersonDao);
                        return [4 /*yield*/, personDao.get(userId)];
                    case 1:
                        personInfo = _a.sent();
                        if (!personInfo) {
                            return [2 /*return*/, {}];
                        }
                        foundation.mainLogger.debug('getCurrentUserInfo: ' + personInfo);
                        return [2 /*return*/, {
                                company_id,
                                email: personInfo.email,
                                display_name: personInfo.display_name,
                            }];
                }
            });
        });
    };
    AccountService.prototype.getUserEmail = function () {
        return __awaiter(this, void 0, void 0, function () {
            let userId, personDao, personInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userId = Number(this.accountDao.get(ACCOUNT_USER_ID));
                        if (!userId) {
                            return [2 /*return*/, ''];
                        }
                        personDao = daoManager.getDao(PersonDao);
                        return [4 /*yield*/, personDao.get(userId)];
                    case 1:
                        personInfo = _a.sent();
                        if (!personInfo) {
                            return [2 /*return*/, ''];
                        }
                        return [2 /*return*/, personInfo.email];
                }
            });
        });
    };
    AccountService.prototype.getClientId = function () {
        const configDao = daoManager.getKVDao(ConfigDao);
        let id = configDao.get(CLIENT_ID);
        if (id) {
            return id;
        }
        id = generateUUID();
        configDao.put(CLIENT_ID, id);
        return id;
    };
    AccountService.prototype.refreshRCToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            let authDao, rcToken, refresh_token, endpoint_id, refreshedRCAuthData, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        authDao = daoManager.getKVDao(AuthDao);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        rcToken = authDao.get(AUTH_RC_TOKEN);
                        refresh_token = rcToken.refresh_token, endpoint_id = rcToken.endpoint_id;
                        return [4 /*yield*/, refreshToken({ refresh_token, endpoint_id })];
                    case 2:
                        refreshedRCAuthData = _a.sent();
                        authDao.put(AUTH_RC_TOKEN, refreshedRCAuthData.data);
                        notificationCenter.emitConfigPut(AUTH_RC_TOKEN, refreshedRCAuthData.data);
                        return [2 /*return*/, refreshedRCAuthData.data];
                    case 3:
                        err_1 = _a.sent();
                        Aware(ErrorTypes.OAUTH, err_1.message);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AccountService.serviceName = 'AccountService';
    return AccountService;
}(BaseService));

let HandleByRingCentral = new /** @class */ (function (_super) {
    __extends(class_1, _super);
    function class_1() {
        const _this = _super !== null && _super.apply(this, arguments) || this;
        _this.defaultVia = foundation.NETWORK_VIA.HTTP;
        _this.survivalModeSupportable = true;
        _this.tokenExpirable = true;
        _this.tokenRefreshable = true;
        return _this;
    }
    class_1.prototype.basic = function () {
        return btoa(Api.httpConfig.rc.clientId + ':' + Api.httpConfig.rc.clientSecret);
    };
    class_1.prototype.requestDecoration = function (tokenHandler) {
        const handler = tokenHandler;
        return function (request) {
            if (_.isEmpty(handler)) {
                throw new Error('token handler can not be null.');
            }
            const headers = request.headers;
            if (!headers.Authorization) {
                if (request.needAuth() && handler.isOAuthTokenAvailable()) {
                    headers.Authorization = 'Bearer ' + handler.accessToken();
                }
                else {
                    headers.Authorization = 'Basic ' + handler.getBasic();
                }
            }
            const authorization = headers.Authorization;
            if (authorization.startsWith('Basic')) {
                request.data = lib_3(request.data);
            }
            return request;
        };
    };
    class_1.prototype.doRefreshToken = function (token) {
        const _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            let accountService, refreshedToken, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        accountService = AccountService.getInstance();
                        return [4 /*yield*/, accountService.refreshRCToken()];
                    case 1:
                        refreshedToken = _a.sent();
                        if (refreshedToken) {
                            token.access_token = refreshedToken.access_token;
                            token.accessTokenExpireIn = refreshedToken.accessTokenExpireIn;
                            token.refreshToken = refreshedToken.refreshToken;
                            token.refreshTokenExpireIn = refreshedToken.refreshTokenExpireIn;
                            token.timestamp = refreshedToken.timestamp;
                            resolve(token);
                        }
                        else {
                            reject(token);
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        reject(err_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    return class_1;
}(foundation.AbstractHandleType))();

let HandleByUpload = new /** @class */ (function (_super) {
    __extends(class_1, _super);
    function class_1() {
        const _this = _super !== null && _super.apply(this, arguments) || this;
        _this.defaultVia = foundation.NETWORK_VIA.HTTP;
        _this.survivalModeSupportable = true;
        return _this;
    }
    class_1.prototype.requestDecoration = function (tokenHandler) {
        const handler = tokenHandler;
        return function (request) {
            if (request.needAuth()) {
                if (_.isEmpty(tokenHandler)) {
                    throw new Error('token handler can not be null.');
                }
                if (handler.isOAuthTokenAvailable()) {
                    request.params = __assign({}, request.params);
                }
            }
            return request;
        };
    };
    return class_1;
}(foundation.AbstractHandleType))();

/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-05-02 16:47:08
 * Copyright © RingCentral. All rights reserved.
 */
let types = [
    HandleByGlip,
    HandleByRingCentral,
    HandleByGlip2,
    HandleByUpload,
];
let Api = /** @class */ (function () {
    function Api() {
    }
    Api.init = function (config) {
        this._httpConfig = merge({}, defaultConfig, config);
        Api.setupHandlers();
    };
    Api.setupHandlers = function () {
        foundation.NetworkSetup.setup(types);
        // This explicit set rc handler accessToken as the RC token provider for glip handler
        const tokenManager = foundation.NetworkManager.Instance.getTokenManager();
        const rcTokenHandler = tokenManager && tokenManager.getOAuthTokenHandler(HandleByRingCentral);
        HandleByGlip.rcTokenProvider =
            rcTokenHandler && rcTokenHandler.accessToken.bind(rcTokenHandler);
    };
    Object.defineProperty(Api, 'httpConfig', {
        get () {
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
        if (!this._httpConfig) {
            Throw(ErrorTypes.HTTP, 'Api not initialized');
        }
        let networkClient = this.httpSet.get(name);
        if (!networkClient) {
            const currentConfig = this._httpConfig[name];
            const networkRequests = {
                host: currentConfig.server,
                handlerType: type,
            };
            networkClient = new NetworkClient(networkRequests, currentConfig.apiPlatform, type.defaultVia, currentConfig.apiPlatformVersion);
            this.httpSet.set(name, networkClient);
        }
        return networkClient;
    };
  Object.defineProperty(Api, 'glipNetworkClient', {
        get () {
            return this.getNetworkClient('glip', HandleByGlip);
        },
        enumerable: true,
        configurable: true
    });
  Object.defineProperty(Api, 'glip2NetworkClient', {
        get () {
            return this.getNetworkClient('glip2', HandleByGlip2);
        },
        enumerable: true,
        configurable: true
    });
  Object.defineProperty(Api, 'glipDesktopNetworkClient', {
        get () {
            return this.getNetworkClient('glip_desktop', HandleByGlip);
        },
        enumerable: true,
        configurable: true
    });
  Object.defineProperty(Api, 'rcNetworkClient', {
        get () {
            return this.getNetworkClient('rc', HandleByRingCentral);
        },
        enumerable: true,
        configurable: true
    });
  Object.defineProperty(Api, 'uploadNetworkClient', {
      get () {
            return this.getNetworkClient('upload', HandleByUpload);
        },
      enumerable: true,
      configurable: true
    });
  Api.getDataById = function (id) {
    return this.glipNetworkClient.get(this.basePath + '/' + id);
  };
  Api.postData = function (data) {
    return this.glipNetworkClient.post('' + this.basePath, data);
  };
  Api.putDataById = function (id, data) {
    return this.glipNetworkClient.put(this.basePath + '/' + id, data);
  };
  Api.basePath = '';
  Api.httpSet = new Map();
  return Api;
}());

/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-08-09 14:53:49
 * Copyright © RingCentral. All rights reserved.
 */
let RINGCENTRAL_API = {
  API_OAUTH_TOKEN: '/oauth/token',
  API_REFRESH_TOKEN: '/oauth/token',
  API_GENERATE_CODE: '/v1.0/interop/generate-code',
  API_EXTENSION_INFO: '/v1.0/account/~/extension/~',
  API_PROFILE: '/glip/profile',
};

/**
 * @param {string} grant_type
 * @param {string} username
 * @param {string} password
 * return authData for glip login by password
 */
function loginRCByPassword(data) {
  const model = __assign({}, data, { grant_type: 'password' });
  const query = {
    path: RINGCENTRAL_API.API_OAUTH_TOKEN,
    method: foundation.NETWORK_METHOD.POST,
    data: model,
    authFree: true,
    via: foundation.NETWORK_VIA.HTTP,
  };
  return Api.rcNetworkClient.http(query);
}
/**
 * @param {string} refresh_token
 * @param {string} grant_type
 */
function refreshToken(data) {
  const model = __assign({}, data, { grant_type: 'refresh_token' });
  const query = {
    path: RINGCENTRAL_API.API_REFRESH_TOKEN,
    method: foundation.NETWORK_METHOD.POST,
    data: model,
    authFree: true,
    via: foundation.NETWORK_VIA.HTTP,
  };
  return Api.rcNetworkClient.http(query);
}

/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-02-05 15:04:34
 * @Last Modified by: Shining Miao (shining.miao@ringcentral.com)
 * @Last Modified time: 2018-03-13 10:12:05
 */
let GLIP_API = {
  get API_OAUTH_TOKEN() {
    return '/login';
  },
};

/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-08-09 13:45:49
 * Copyright © RingCentral. All rights reserved.
 */
/**
 * @param {string} rcAccessTokenData
 * @param {string} username
 * @param {string} password
 * @param {boolean} mobile(option)
 * get glip 1.0 api's requset header (x-authorization) by authData
 */
function loginGlip(authData) {
  const model = {
    rc_access_token_data: btoa(JSON.stringify(authData)),
  };
  const query = {
    path: GLIP_API.API_OAUTH_TOKEN,
    method: foundation.NETWORK_METHOD.PUT,
    data: model,
    authFree: true,
  };
  return Api.glipNetworkClient.http(__assign({}, query, { via: foundation.NETWORK_VIA.HTTP }));
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
  return Api.glipNetworkClient.get('/index', params, foundation.NETWORK_VIA.HTTP, requestConfig, headers);
}
function initialData(params, requestConfig, headers) {
  if (requestConfig === void 0) { requestConfig = {}; }
  if (headers === void 0) { headers = {}; }
  return Api.glipDesktopNetworkClient
        .get('/initial', params, foundation.NETWORK_VIA.HTTP, requestConfig, headers);
}
function remainingData(params, requestConfig, headers) {
  if (requestConfig === void 0) { requestConfig = {}; }
  if (headers === void 0) { headers = {}; }
  return Api.glipDesktopNetworkClient
        .get('/remaining', params, foundation.NETWORK_VIA.HTTP, requestConfig, headers);
}

/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-05-17 20:35:22
 * Copyright © RingCentral. All rights reserved.
 */

let SDK = /** @class */ (function () {
  function SDK(apiConfig) {
    this.apiConfig = apiConfig;
  }
  SDK.prototype.platform = function () {
    return new Platform(this.apiConfig);
  };
  return SDK;
}());
let Platform = /** @class */ (function () {
  function Platform(config) {
    Api.init(config);
    this.networkManager = foundation.NetworkManager.Instance;
  }
  Platform.prototype.login = function (params) {
    return __awaiter(this, void 0, void 0, function () {
            let rcAuthData, glipAuthData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, loginRCByPassword(params)];
                    case 1:
                        rcAuthData = _a.sent();
                        return [4 /*yield*/, loginGlip(rcAuthData.data)];
                    case 2:
                        glipAuthData = _a.sent();
                        this._updateToken(glipAuthData.headers['x-authorization'], rcAuthData.data);
                        return [2 /*return*/];
                }
            });
        });
  };
  Platform.prototype._updateToken = function (access_token, rcToken) {
    if (!access_token) {
            return console.warn('access token undefined');
        }
    this.networkManager.setOAuthToken(new foundation.Token(access_token), HandleByGlip);
    this.networkManager.setOAuthToken(new foundation.Token(access_token), HandleByUpload);
    this.networkManager.setOAuthToken(rcToken, HandleByRingCentral);
    this.networkManager.setOAuthToken(rcToken, HandleByGlip2);
  };
  return Platform;
}());

// /*
// export { sdk, service, utils, dao, api };

let CompanyAPI = /** @class */ (function (_super) {
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

let GroupAPI = /** @class */ (function (_super) {
  __extends(GroupAPI, _super);
  function GroupAPI() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  GroupAPI.modifyGroupById = function (id, data) {
    return this.glipNetworkClient.put(`/team/${id}`, data);
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
    return this.glipNetworkClient.put('/add_team_members/' + groupId, {
            members: memberIds,
        });
  };
  GroupAPI.createTeam = function (data) {
    return this.glipNetworkClient.post('/team', data);
  };
    /**
     *
     * @param {*} id  group id
     * return group or null
     */
  GroupAPI.basePath = '/group';
  return GroupAPI;
}(Api));

let _a$1;
let ITEMPATH = (_a$1 = {},
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
  let url = '/';
  const typeId = GlipTypeUtil.extractTypeId(id);
  if (typeId > TypeDictionary.TYPE_ID_CUSTOM_ITEM) {
    url = '/integration_item';
  }
  else {
    const path = ITEMPATH[typeId];
    url += path || 'item';
  }
  return url + '/' + id;
}
let ItemAPI = /** @class */ (function (_super) {
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
      method: foundation.NETWORK_METHOD.POST,
      via: foundation.NETWORK_VIA.HTTP,
      data: files,
      requestConfig: {
        onUploadProgress (event) {
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
    return this.glipNetworkClient.get('/pages_body/' + id);
  };
  ItemAPI.basePath = '/item';
  return ItemAPI;
}(Api));

let PersonAPI = /** @class */ (function (_super) {
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

let PostAPI = /** @class */ (function (_super) {
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

let ProfileAPI = /** @class */ (function (_super) {
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

/**
 * @Author: Andy Hu
 * @Date:   2018-05-30T15:37:24+08:00
 * @Email:  andy.hu@ringcentral.com
 * @Project: Fiji
 * @Last modified by:   andy.hu
 * @Last modified time: 2018-06-13T10:22:24+08:00
 * @Copyright: © RingCentral. All rights reserve
 */
let SearchAPI = /** @class */ (function (_super) {
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

let StateAPI = /** @class */ (function (_super) {
  __extends(StateAPI, _super);
  function StateAPI() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  StateAPI.saveStatePartial = function (id, state) {
    return this.glipNetworkClient.put('/save_state_partial/' + id, state);
  };
    /**
     *
     * @param {*} id  group id
     * return group or null
     */
  StateAPI.basePath = '/state';
  return StateAPI;
}(Api));

exports.SDK = SDK;
exports.CompanyAPI = CompanyAPI;
exports.GLIP_API = GLIP_API;
exports.GroupAPI = GroupAPI;
exports.ItemAPI = ItemAPI;
exports.PersonAPI = PersonAPI;
exports.PostAPI = PostAPI;
exports.ProfileAPI = ProfileAPI;
exports.SearchAPI = SearchAPI;
exports.StateAPI = StateAPI;
exports.loginGlip = loginGlip;
exports.indexData = indexData;
exports.initialData = initialData;
exports.remainingData = remainingData;
exports.Api= Api
