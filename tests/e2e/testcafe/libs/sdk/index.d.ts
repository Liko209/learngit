declare module 'sdk/types/api' {
	 type BaseConfig = {
	    server?: string;
	    apiPlatform: string;
	    apiPlatformVersion?: string;
	}; type RcConfig = BaseConfig & {
	    clientId: string;
	    redirectUri: string;
	    clientSecret: string;
	}; type Glip2Config = BaseConfig & {
	    clientId: string;
	    redirectUri: string;
	    clientSecret: string;
	    brandId: number;
	}; type GlipConfig = BaseConfig; type UploadConfig = BaseConfig; type ApiConfig = {
	    rc: RcConfig;
	    glip: GlipConfig;
	    glip2: Glip2Config;
	    upload: UploadConfig;
	}; type PartialApiConfig = {
	    rc?: Partial<RcConfig>;
	    glip?: Partial<GlipConfig>;
	    glip2?: Partial<Glip2Config>;
	    upload?: Partial<UploadConfig>;
	}; type HttpConfigType = 'glip' | 'glip2' | 'rc' | 'upload' | 'glip_desktop';
	export { BaseConfig, RcConfig, Glip2Config, GlipConfig, UploadConfig, ApiConfig, PartialApiConfig, HttpConfigType, };

}
declare module 'sdk/types/db' {
	 type DBConfig = {
	    adapter: string;
	};
	export { DBConfig };

}
declare module 'sdk/types/pagination' {
	interface IPagination {
	    offset: number;
	    limit: number;
	}
	export { IPagination };

}
declare module 'sdk/types' {
	import { PartialApiConfig } from 'sdk/types/api';
	import { DBConfig } from 'sdk/types/db';
	interface Newable<T> {
	    new (...args: any[]): T;
	}
	interface SdkConfig {
	    api?: PartialApiConfig;
	    db?: Partial<DBConfig>;
	}
	export { Newable, SdkConfig };
	export * from 'sdk/types/api';
	export * from 'sdk/types/db';
	export * from 'sdk/types/pagination';

}
declare module 'sdk/Manager' {
	import { Newable } from 'sdk/types'; class Manager<Base> {
	    private instances;
	    get<T extends Base>(Class: Newable<T>, ...args: any[]): T;
	    destroy(): void;
	    clear(): void;
	    readonly size: number;
	}
	export default Manager;

}
declare module 'sdk/component/featureFlag/interface' {
	 type Handler<T> = (data: T[]) => any; type IFlag = {
	    [key: string]: string;
	}; enum PERMISSION {
	    CALL = "call"
	} type IFeatureConfig = {
	    [key in BETA_FEATURE]?: string[] | PERMISSION[];
	};
	interface INotifier<T> {
	    subscribe: (handler: Handler<T>) => any;
	    unsubscribe: (handler: Handler<T>) => any;
	    broadcast: (data: T) => any;
	}
	interface AccountInfo {
	    userId: number;
	    companyId: number;
	}
	interface IFlagCalculator {
	    isFeatureEnabled: (flags: IFlag, feature: BETA_FEATURE) => boolean;
	    getFlagValue: (flags: IFlag, flag: string) => boolean;
	} enum BETA_FEATURE {
	    LOG = 0,
	    SMS = 1
	} enum FLAG_PREFIX {
	    EMAIL = 0,
	    DOMAIN = 1,
	    STATUS = 2
	} type Middleware = (props: string, next?: Middleware) => boolean; type Next = (props: string) => boolean;
	export { INotifier, Next, IFlag, Handler, IFeatureConfig, AccountInfo, IFlagCalculator, BETA_FEATURE, FLAG_PREFIX, PERMISSION, Middleware, };

}
declare module 'sdk/component/featureFlag/configChangeNotifier' {
	import { IFlag, Handler, INotifier } from 'sdk/component/featureFlag/interface';
	import { EventEmitter2 } from 'eventemitter2'; class ConfigChangeNotifier extends EventEmitter2 implements INotifier<IFlag> {
	    broadcast(touchedFlags: IFlag): void;
	    subscribe(handler: Handler<IFlag>): void;
	    unsubscribe(handler: Handler<IFlag>): void;
	}
	export default ConfigChangeNotifier;

}
declare module 'sdk/dao/base/Query' {
	import { IDatabaseCollection, IQueryCriteria, IQuery, IFilter, IDatabase } from 'foundation'; class Query<T> implements IQuery<T> {
	    collection: IDatabaseCollection<T>;
	    db: IDatabase;
	    criteria: IQueryCriteria<T>[];
	    parallel?: IQuery<T>[];
	    constructor(collection: IDatabaseCollection<T>, db: IDatabase);
	    reset(): Query<T>;
	    /**
	     * Only use one time
	     * @param {String} key search key
	     * @param {Boolean} desc is desc
	     */
	    orderBy(key: string, desc?: boolean): Query<T>;
	    reverse(): Query<T>;
	    or(query: Query<T>): Query<T>;
	    equal(key: string, value: any, ignoreCase?: boolean): Query<T>;
	    notEqual(key: string, value: any): Query<T>;
	    between(key: string, lowerBound: any, upperBound: any, includeLower: any, includeUpper: any): Query<T>;
	    greaterThan(key: string, value: any): Query<T>;
	    greaterThanOrEqual(key: string, value: any): Query<T>;
	    lessThan(key: string, value: any): Query<T>;
	    lessThanOrEqual(key: string, value: any): Query<T>;
	    anyOf(key: string, array: any[], ignoreCase?: boolean): Query<T>;
	    startsWith(key: string, value: string, ignoreCase?: boolean): Query<T>;
	    contain(key: string, value: any): Query<T>;
	    filter(filter: IFilter<T>): Query<T>;
	    offset(n: number): Query<T>;
	    limit(n: number): Query<T>;
	    toArray({ sortBy, desc }?: {
	        sortBy?: string;
	        desc?: boolean;
	    }): Promise<T[]>;
	    count(): Promise<number>;
	    first(): Promise<T | null>;
	    last(): Promise<T | null>;
	}
	export default Query;

}
declare module 'sdk/utils/jsUtils' {
	 function uniqueArray<T>(array: T[]): T[];
	export { uniqueArray };

}
declare module 'sdk/utils/mathUtils' {
	 function randomInt(): number; function versionHash(): number; function generateUUID(): string;
	export { randomInt, versionHash, generateUUID };

}
declare module 'sdk/service/constants' {
	 const GROUP_QUERY_TYPE: {
	    ALL: string;
	    GROUP: string;
	    TEAM: string;
	    FAVORITE: string;
	}; const EVENT_TYPES: {
	    REPLACE: string;
	    PUT: string;
	    UPDATE: string;
	    DELETE: string;
	}; enum PERMISSION_ENUM {
	    TEAM_POST = 1,
	    TEAM_ADD_MEMBER = 2,
	    TEAM_ADD_INTEGRATIONS = 4,
	    TEAM_PIN_POST = 8,
	    TEAM_ADMIN = 16
	} const SHOULD_UPDATE_NETWORK_TOKEN = "should_update_network_token";
	export { GROUP_QUERY_TYPE, EVENT_TYPES, PERMISSION_ENUM, SHOULD_UPDATE_NETWORK_TOKEN };

}
declare module 'sdk/service/notificationCenter' {
	import { EventEmitter2 } from 'eventemitter2'; class NotificationCenter extends EventEmitter2 {
	    constructor();
	    trigger(key: string, ...args: any[]): void;
	    /**
	     * emit event for ui layer of store entity insert or update
	     * @param {string} key
	     * @param {array} entities
	     */
	    emitEntityPut(key: string, entities: any[]): void;
	    emitEntityUpdate(key: string, entities: any[]): void;
	    emitEntityReplace(key: string, entities: any[]): void;
	    emitEntityDelete(key: string, entities: any[]): void;
	    emitConfigPut(key: string, payload: any): void;
	    emitConfigDelete(key: string): void;
	    emitService(key: string, payload?: any): void;
	} const notificationCenter: NotificationCenter;
	export { NotificationCenter };
	export default notificationCenter;

}
declare module 'sdk/utils/error/base' {
	 class BaseError extends Error {
	    code: number;
	    constructor(code: number, message: string);
	}
	export default BaseError;

}
declare module 'sdk/utils/error/types' {
	 const ErrorTypes: {
	    UNDEFINED_ERROR: number;
	    HTTP: number;
	    DB: number;
	    SERVICE: number;
	    INVALIDTE_PARAMETERS: number;
	    OAUTH: number;
	    NETWORK: number;
	    INVALID_GRANT: number;
	};
	export default ErrorTypes;

}
declare module 'sdk/utils/error/parser' {
	import BaseError from 'sdk/utils/error/base'; class ErrorParser {
	    static parse(err: any): BaseError;
	    static dexie(err: any): BaseError;
	    static http(err: any): BaseError;
	}
	export default ErrorParser;

}
declare module 'sdk/utils/error' {
	import BaseError from 'sdk/utils/error/base';
	import ErrorTypes from 'sdk/utils/error/types';
	import ErrorParser from 'sdk/utils/error/parser'; const Throw: (code: number, message: string) => never; const Aware: (code: number, message: string) => void;
	export { BaseError, ErrorTypes, ErrorParser, Throw, Aware, };

}
declare module 'sdk/utils/glip-type-dictionary/types' {
	 const TypeDictionary: {
	    TYPE_ID_COMPANY: number;
	    TYPE_ID_GROUP: number;
	    TYPE_ID_PERSON: number;
	    TYPE_ID_POST: number;
	    TYPE_ID_PROJECT: number;
	    TYPE_ID_TEAM: number;
	    TYPE_ID_STATE: number;
	    TYPE_ID_PLUGIN: number;
	    TYPE_ID_TASK: number;
	    TYPE_ID_FILE: number;
	    TYPE_ID_PRESENCE: number;
	    TYPE_ID_STORED_FILE: number;
	    TYPE_ID_BUG: number;
	    TYPE_ID_EVENT: number;
	    TYPE_ID_PROFILE: number;
	    TYPE_ID_EMAIL_STATE: number;
	    TYPE_ID_LINK: number;
	    TYPE_ID_PAGE: number;
	    TYPE_ID_ACCOUNT: number;
	    TYPE_ID_MEETING: number;
	    TYPE_ID_MEGA_MEETING: number;
	    TYPE_ID_ADDLIVE_MEETING: number;
	    TYPE_ID_PAYMENT: number;
	    TYPE_ID_DO_IMPORT: number;
	    TYPE_ID_GMAIL_IMPORT: number;
	    TYPE_ID_INTEGRATION: number;
	    TYPE_ID_INTEGRATION_ITEM: number;
	    TYPE_ID_REFERRAL: number;
	    TYPE_ID_POLL: number;
	    TYPE_ID_CODE: number;
	    TYPE_ID_GOOGLE_SIGNON: number;
	    TYPE_ID_LINKEDIN_SIGNON: number;
	    TYPE_ID_QUESTION: number;
	    TYPE_ID_IMPORT_ITEM: number;
	    TYPE_ID_SLACK_IMPORT: number;
	    TYPE_ID_HIPCHAT_IMPORT: number;
	    TYPE_ID_ASANA_IMPORT: number;
	    TYPE_ID_TRELLO_IMPORT: number;
	    TYPE_ID_RC_SIGNON: number;
	    TYPE_ID_CONFERENCE: number;
	    TYPE_ID_CALL: number;
	    TYPE_ID_SIP: number;
	    TYPE_ID_EXPORT: number;
	    TYPE_ID_INTERACTIVE_MESSAGE_ITEM: number;
	    TYPE_ID_FLIP2GLIP_EMAIL: number;
	    TYPE_ID_OUTLOOK_IMPORT: number;
	    TYPE_ID_RC_PHONE_TAB: number;
	    TYPE_ID_RC_CALL: number;
	    TYPE_ID_RC_VOICEMAIL: number;
	    TYPE_ID_RC_FAX: number;
	    TYPE_ID_RC_PRESENCE: number;
	    TYPE_ID_RC_BLOCK: number;
	    TYPE_ID_RC_SMSES: number;
	    TYPE_ID_CUSTOM_ITEM: number;
	    TYPE_ID_JIRA_ITEM: number;
	    TYPE_ID_GITHUB_ITEM: number;
	    TYPE_ID_HARVEST_ITEM: number;
	    TYPE_ID_STRIPE_ITEM: number;
	    TYPE_ID_ZENDESK_ITEM: number;
	    TYPE_ID_ASANA_ITEM: number;
	    TYPE_ID_BITBUCKET_ITEM: number;
	    TYPE_ID_BOX_ITEM: number;
	    TYPE_ID_BUGSNAG_ITEM: number;
	    TYPE_ID_BUILDBOX_ITEM: number;
	    TYPE_ID_CIRCLECI_ITEM: number;
	    TYPE_ID_CLOUD66_ITEM: number;
	    TYPE_ID_CODESHIP_ITEM: number;
	    TYPE_ID_CONCUR_ITEM: number;
	    TYPE_ID_CRASHLYTICS_ITEM: number;
	    TYPE_ID_DATADOG_ITEM: number;
	    TYPE_ID_EXPENSIFY_ITEM: number;
	    TYPE_ID_FRESHBOOKS_ITEM: number;
	    TYPE_ID_GETSATISFACTION_ITEM: number;
	    TYPE_ID_GOSQUARED_ITEM: number;
	    TYPE_ID_HANGOUTS_ITEM: number;
	    TYPE_ID_HONEYBADGER_ITEM: number;
	    TYPE_ID_HUBOT_ITEM: number;
	    TYPE_ID_HUBSPOT_ITEM: number;
	    TYPE_ID_INSIGHTLY_ITEM: number;
	    TYPE_ID_JENKINS_ITEM: number;
	    TYPE_ID_LIBRATO_ITEM: number;
	    TYPE_ID_MAILCHIMP_ITEM: number;
	    TYPE_ID_MARKETO_ITEM: number;
	    TYPE_ID_NAGIOS_ITEM: number;
	    TYPE_ID_NINEFOLD_ITEM: number;
	    TYPE_ID_ONEDRIVE_ITEM: number;
	    TYPE_ID_OPSGENIE_ITEM: number;
	    TYPE_ID_PAGERDUTY_ITEM: number;
	    TYPE_ID_PAPERTRAIL_ITEM: number;
	    TYPE_ID_PHABRICATOR_ITEM: number;
	    TYPE_ID_PINGDOM_ITEM: number;
	    TYPE_ID_PIVOTALTRACKER_ITEM: number;
	    TYPE_ID_QUICKBOOKS_ITEM: number;
	    TYPE_ID_REAMAZE_ITEM: number;
	    TYPE_ID_ROLLCALL_ITEM: number;
	    TYPE_ID_RSS_ITEM: number;
	    TYPE_ID_SALESFORCE_ITEM: number;
	    TYPE_ID_SCREENHERO_ITEM: number;
	    TYPE_ID_SEMAPHORE_ITEM: number;
	    TYPE_ID_SENTRY_ITEM: number;
	    TYPE_ID_STATUSPAGEIO_ITEM: number;
	    TYPE_ID_SUBVERSION_ITEM: number;
	    TYPE_ID_SUPPORTFU_ITEM: number;
	    TYPE_ID_TRAVIS_ITEM: number;
	    TYPE_ID_TRELLO_ITEM: number;
	    TYPE_ID_TWITTER_ITEM: number;
	    TYPE_ID_USERVOICE_ITEM: number;
	    TYPE_ID_VOCUS_ITEM: number;
	    TYPE_ID_ZAPIER_ITEM: number;
	    TYPE_ID_ZOHO_ITEM: number;
	    TYPE_ID_DONEDONE_ITEM: number;
	    TYPE_ID_AIRBRAKE_ITEM: number;
	    TYPE_ID_NEW_RELIC_ITEM: number;
	    TYPE_ID_TRAVIS_CI_ITEM: number;
	    TYPE_ID_HEROKU_ITEM: number;
	    TYPE_ID_CONFLUENCE_ITEM: number;
	    TYPE_ID_SERVICE_NOW_ITEM: number;
	    TYPE_ID_RAYGUN_ITEM: number;
	    TYPE_ID_MAGNUMCI_ITEM: number;
	    TYPE_ID_RUNSCOPE_ITEM: number;
	    TYPE_ID_CIRCLE_CI_ITEM: number;
	    TYPE_ID_GO_SQUARED_ITEM: number;
	    TYPE_ID_OPS_GENIE_ITEM: number;
	    TYPE_ID_SUMO_LOGIC_ITEM: number;
	    TYPE_ID_APP_SIGNAL_ITEM: number;
	    TYPE_ID_USERLIKE_ITEM: number;
	    TYPE_ID_DESK_ITEM: number;
	    TYPE_ID_VICTOR_OPS_ITEM: number;
	    TYPE_ID_GLIPFORCE_ITEM: number;
	    TYPE_ID_STATUS_PAGE_ITEM: number;
	};
	export default TypeDictionary;

}
declare module 'sdk/utils/glip-type-dictionary/util' {
	export default class GlipTypeUtil {
	    static isIntegrationType(typeId: number): boolean;
	    static extractTypeId(objectId: number): number;
	}

}
declare module 'sdk/utils/glip-type-dictionary' {
	import TypeDictionary from 'sdk/utils/glip-type-dictionary/types';
	import GlipTypeUtil from 'sdk/utils/glip-type-dictionary/util';
	interface SystemMessage {
	    type: string;
	    data: object[];
	} function parseSocketMessage(message: string | SystemMessage): {
	    [x: string]: object[];
	};
	export { TypeDictionary, GlipTypeUtil, parseSocketMessage };

}
declare module 'sdk/utils/serialize' {
	export function serializeUrlParams(params: object): string;

}
declare module 'sdk/utils' {
	export * from 'sdk/utils/jsUtils';
	export * from 'sdk/utils/mathUtils';
	export * from 'sdk/utils/error';
	export * from 'sdk/utils/glip-type-dictionary';
	export * from 'sdk/utils/serialize';

}
declare module 'sdk/dao/base/BaseDao' {
	import { IDatabase } from 'foundation';
	import Query from 'sdk/dao/base/Query'; class BaseDao<T extends {}> {
	    static COLLECTION_NAME: string;
	    private collection;
	    private db;
	    constructor(collectionName: string, db: IDatabase);
	    put(item: T | T[]): Promise<void>;
	    bulkPut(array: T[]): Promise<void>;
	    get(key: number): Promise<T | null>;
	    clear(): Promise<void>;
	    /**
	     *
	     * @param {*} primaryKey
	     * return undefined no matter if a record was deleted or not
	     */
	    delete(key: number): Promise<void>;
	    bulkDelete(keys: number[]): Promise<void>;
	    update(item: Partial<T> | Partial<T>[]): Promise<void>;
	    bulkUpdate(array: Partial<T>[]): Promise<void>;
	    getAll(): Promise<T[]>;
	    doInTransation(func: any): Promise<void>;
	    isDexieDB(): boolean;
	    createQuery(): Query<T>;
	    createEmptyQuery(): Query<T>;
	    private _validateItem;
	    private _validateKey;
	}
	export default BaseDao;

}
declare module 'sdk/dao/base/BaseKVDao' {
	import { KVStorage } from 'foundation'; class BaseKVDao {
	    private kvStorage;
	    private collectionName;
	    private keys;
	    constructor(collectionName: string, kvStorage: KVStorage, keys: string[]);
	    getKey(key: string): string;
	    put(key: string, value: any): void;
	    get(key: string): any;
	    remove(key: string): void;
	    clear(): void;
	}
	export default BaseKVDao;

}
declare module 'sdk/dao/base' {
	export { default as BaseDao } from 'sdk/dao/base/BaseDao';
	export { default as BaseKVDao } from 'sdk/dao/base/BaseKVDao';
	export { default as Query } from 'sdk/dao/base/Query';

}
declare module 'sdk/dao/account/constants' {
	export const ACCOUNT_USER_ID = "user_id";
	export const ACCOUNT_PROFILE_ID = "profile_id";
	export const ACCOUNT_COMPANY_ID = "company_id";
	export const ACCOUNT_CLIENT_CONFIG = "client_config";
	export const ACCOUNT_KEYS: string[];

}
declare module 'sdk/dao/account' {
	import { KVStorage } from 'foundation';
	import { BaseKVDao } from 'sdk/dao/base'; class AccountDao extends BaseKVDao {
	    static COLLECTION_NAME: string;
	    constructor(kvStorage: KVStorage);
	}
	export default AccountDao;

}
declare module 'sdk/dao/constants' {
	export const STORAGE_TYPES: {
	    KV: number;
	    DB: number;
	};

}
declare module 'sdk/dao/schema' {
	import { ISchema } from 'foundation'; const schema: ISchema;
	export default schema;

}
declare module 'sdk/dao/auth/constants' {
	export const AUTH_GLIP_TOKEN = "GLIP_TOKEN";
	export const AUTH_RC_TOKEN = "RC_TOKEN";
	export const AUTH_GLIP2_TOKEN = "GLIP2_TOKEN";
	export const AUTH_KEYS: string[];

}
declare module 'sdk/dao/auth' {
	import { KVStorage } from 'foundation';
	import { BaseKVDao } from 'sdk/dao/base'; class AuthDao extends BaseKVDao {
	    static COLLECTION_NAME: string;
	    constructor(kvStorage: KVStorage);
	}
	export default AuthDao;

}
declare module 'sdk/models' {
	/*
	import { BaseModel } from 'sdk/models';
	 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
	 * @Date: 2018-06-06 10:17:59
	 * Copyright © RingCentral. All rights reserved.
	 */
	export type BaseModel = {
	  id: number;
	  _id?: number;
	  created_at: number;
	  modified_at: number;
	  creator_id: number;
	  is_new: boolean;
	  deactivated: boolean;
	  version: number;
	  model_id?: string;
	  model_size?: number;
	};

	export type Raw < T > = Pick<T, Exclude<keyof T, 'id'>> & {
	  _id: number;
	  id?: number;
	};

	export type Group = BaseModel & {
	  members: number[];
	  company_id: number;
	  set_abbreviation: string;
	  email_friendly_abbreviation: string;
	  most_recent_content_modified_at: number;
	  most_recent_post_created_at?: number;
	  most_recent_post_id?: number;
	  is_team?: boolean;
	  is_archived?: boolean;
	  guest_user_company_ids?: number[];
	  removed_guest_user_ids?: number[];
	  privacy?: string; // 'public'|'protected'|'private'
	  team_folder?: string;
	  converted_to_team?: object;
	  converted_from_group?: object;
	  pinned_post_ids?: number[];
	  permissions?: {
	    admin?: {
	      uids: number[];
	      level?: number;
	    };
	    user?: {
	      uids: number[];
	      level?: number;
	    };
	  };
	  post_cursor?: number;
	  deactivated_post_cursor?: number;
	  _delta?: object;
	  is_public?: boolean;
	  description?: string;
	};

	export type Profile = BaseModel & {
	  person_id?: number;
	  favorite_group_ids: number[];
	  favorite_post_ids: number[];
	};

	export type Company = BaseModel & {
	  name: string;
	  domain: string;
	  admins: number[];
	};

	export type Person = BaseModel & {
	  company_id: number;
	  email: string;
	  is_webmail?: boolean;
	  first_user?: boolean;
	  externally_registered?: boolean;
	  state_id?: number;
	  profile_id?: number;
	  first_name?: string;
	  last_name?: string;
	  display_name?: string;
	  headshot?: string;
	  locked?: boolean;
	  inviter_id?: number;
	  rc_phone_numbers?: object[];
	  sanitized_rc_extension?: object;
	};

	export type UserInfo = {
	  email: string;
	  display_name: string;
	  company_id: number;
	};

	export type State = BaseModel & {
	  person_id: number;
	  current_group_id: number;
	  away_status_history?: string[];
	  current_plugin: string;
	};

	export type MyState = State;

	export type GroupState = BaseModel & {
	  id: number;
	  unread_count?: number;
	  unread_mentions_count?: number;
	  read_through?: number;
	  last_read_through?: number;
	  marked_as_unread?: number;
	};

	export type Post = BaseModel & {
	  group_id: number;
	  company_id: number;
	  text: string;
	  item_ids: number[];
	  post_ids: number[]; // quoted posts
	  likes?: number[];
	  activity?: string;
	  at_mention_item_ids?: number[];
	  at_mention_non_item_ids?: number[];
	  new_version?: number;
	  from_group_id?: number;
	  links?: object[];
	  items?: object[];
	};

	export type Item = BaseModel & {
	  group_ids: number[];
	  post_ids: number[];
	  company_id: number;
	  type_id: number;
	};

	export type FileItem = Item & {
	  name: string;
	};

	export type NoteItem = Item & {
	  body: string;
	  title: string;
	};

	export type StoredFile = Raw<BaseModel> & {
	  storage_url: string;
	  download_url: string;
	  storage_path: string;
	  last_modified: number;
	  size: number;
	};

	export type Presence = {
	  _id?: number;
	  person_id: number;
	  presence: string;
	};

}
declare module 'sdk/dao/company' {
	import { BaseDao } from 'sdk/dao/base';
	import { Company } from 'sdk/models';
	import { IDatabase } from 'foundation'; class CompanyDao extends BaseDao<Company> {
	    static COLLECTION_NAME: string;
	    constructor(db: IDatabase);
	}
	export default CompanyDao;

}
declare module 'sdk/dao/config/constants' {
	export const LAST_INDEX_TIMESTAMP = "LAST_INDEX_TIMESTAMP";
	export const SOCKET_SERVER_HOST = "SOCKET_SERVER_HOST";
	export const CONFIG_KEYS: string[];
	export const ENV = "ENV";
	export const DB_SCHEMA_VERSION = "DB_SCHEMA_VERSION";
	export const CLIENT_ID = "CLIENT_ID";

}
declare module 'sdk/dao/config' {
	import { KVStorage } from 'foundation';
	import { BaseKVDao } from 'sdk/dao/base'; class ConfigDao extends BaseKVDao {
	    static COLLECTION_NAME: string;
	    constructor(kvStorage: KVStorage);
	    getEnv(): string;
	    putEnv(env: string): void;
	}
	export default ConfigDao;

}
declare module 'sdk/dao/group' {
	import { BaseDao } from 'sdk/dao/base';
	import { Group } from 'sdk/models';
	import { IDatabase } from 'foundation'; class GroupDao extends BaseDao<Group> {
	    static COLLECTION_NAME: string;
	    constructor(db: IDatabase);
	    queryGroups(offset: number, limit: number, isTeam: boolean, excludeIds?: number[]): Promise<Group[]>;
	    queryGroupsByIds(ids: number[]): Promise<Group[]>;
	    queryAllGroups(offset?: number, limit?: number): Promise<Group[]>;
	    searchTeamByKey(key: string): Promise<Group[]>;
	    queryGroupByMemberList(members: number[]): Promise<Group[]>;
	    getLatestGroup(): Promise<Group | null>;
	    getLastNGroups(n: number): Promise<Group[]>;
	}
	export default GroupDao;

}
declare module 'sdk/dao/groupState' {
	import { BaseDao } from 'sdk/dao/base';
	import { GroupState } from 'sdk/models';
	import { IDatabase } from 'foundation'; class GroupStateDao extends BaseDao<GroupState> {
	    static COLLECTION_NAME: string;
	    constructor(db: IDatabase);
	    getAll(): Promise<GroupState[]>;
	}
	export default GroupStateDao;

}
declare module 'sdk/dao/item' {
	import { BaseDao } from 'sdk/dao/base';
	import { Item } from 'sdk/models';
	import { IDatabase } from 'foundation'; class ItemDao extends BaseDao<Item> {
	    static COLLECTION_NAME: string;
	    constructor(db: IDatabase);
	    getItemsByIds(ids: number[]): Promise<Item[]>;
	    getItemsByGroupId(groupId: number, limit?: number): Promise<Item[]>;
	}
	export default ItemDao;

}
declare module 'sdk/dao/person' {
	import { BaseDao } from 'sdk/dao/base';
	import { IPagination } from 'sdk/types';
	import { Person } from 'sdk/models';
	import { IDatabase } from 'foundation'; class PersonDao extends BaseDao<Person> {
	    static COLLECTION_NAME: string;
	    constructor(db: IDatabase);
	    getAll(): Promise<Person[]>;
	    getAllCount(): Promise<number>;
	    getPersonsByPrefix(prefix: string, { offset, limit }?: Partial<IPagination>): Promise<Person[]>;
	    getPersonsOfEachPrefix({ limit }?: Partial<IPagination>): Promise<Map<string, Person[]>>;
	    getPersonsCountByPrefix(prefix: string): Promise<number>;
	    searchPeopleByKey(fullKeyword?: string): Promise<Person[]>;
	    private _getPersonsNotStartsWithAlphabet;
	    private _getPersonsCountNotStartsWithAlphabet;
	    private _personCompare;
	    private _getNameOfPerson;
	    private _searchPersonsByPrefix;
	}
	export default PersonDao;

}
declare module 'sdk/dao/post' {
	import { BaseDao } from 'sdk/dao/base';
	import { Post } from 'sdk/models';
	import { IDatabase } from 'foundation'; class PostDao extends BaseDao<Post> {
	    static COLLECTION_NAME: string;
	    constructor(db: IDatabase);
	    queryPostsByGroupId(groupId: number, offset?: number, limit?: number): Promise<Post[]>;
	    queryManyPostsByIds(ids: number[]): Promise<Post[]>;
	    queryLastPostByGroupId(groupId: number): Promise<Post | null>;
	    queryOldestPostByGroupId(groupId: number): Promise<Post | null>;
	    purgePostsByGroupId(groupId: number, preserveCount?: number): Promise<void>;
	    queryPreInsertPost(): Promise<Post[]>;
	}
	export default PostDao;

}
declare module 'sdk/dao/profile' {
	import { BaseDao } from 'sdk/dao/base';
	import { Profile } from 'sdk/models';
	import { IDatabase } from 'foundation'; class ProfileDao extends BaseDao<Profile> {
	    static COLLECTION_NAME: string;
	    constructor(db: IDatabase);
	}
	export default ProfileDao;

}
declare module 'sdk/dao/state' {
	import { BaseDao } from 'sdk/dao/base';
	import { MyState } from 'sdk/models';
	import { IDatabase } from 'foundation'; class StateDao extends BaseDao<MyState> {
	    static COLLECTION_NAME: string;
	    constructor(db: IDatabase);
	    getFirst(): Promise<MyState | null>;
	}
	export default StateDao;

}
declare module 'sdk/dao/deactivated' {
	import { BaseDao } from 'sdk/dao/base';
	import { IDatabase } from 'foundation'; class DeactivatedDao extends BaseDao<any> {
	    static COLLECTION_NAME: string;
	    constructor(db: IDatabase);
	}
	export default DeactivatedDao;

}
declare module 'sdk/dao/DaoManager' {
	import BaseDao from 'sdk/dao/base/BaseDao';
	import BaseKVDao from 'sdk/dao/base/BaseKVDao';
	import Manager from 'sdk/Manager';
	import { Newable } from 'sdk/types'; class DaoManager extends Manager<BaseDao<any> | BaseKVDao> {
	    private kvStorageManager;
	    private dbManager;
	    constructor();
	    initDatabase(): Promise<void>;
	    openDatabase(): Promise<void>;
	    closeDatabase(): Promise<void>;
	    deleteDatabase(): Promise<void>;
	    isDatabaseOpen(): boolean;
	    getDao<T extends BaseDao<any>>(DaoClass: Newable<T>): T;
	    getKVDao<T extends BaseKVDao>(KVDaoClass: Newable<T>): T;
	    getStorageQuotaOccupation(): Promise<number>;
	    private _isSchemaCompatible;
	}
	export default DaoManager;

}
declare module 'sdk/dao' {
	export * from 'sdk/dao/base';
	export * from 'sdk/dao/constants';
	export { default as schema } from 'sdk/dao/schema';
	export { default as AccountDao } from 'sdk/dao/account';
	export { default as AuthDao } from 'sdk/dao/auth';
	export { default as CompanyDao } from 'sdk/dao/company';
	export { default as ConfigDao } from 'sdk/dao/config';
	export { default as GroupDao } from 'sdk/dao/group';
	export { default as GroupStateDao } from 'sdk/dao/groupState';
	export { default as ItemDao } from 'sdk/dao/item';
	export { default as PersonDao } from 'sdk/dao/person';
	export { default as PostDao } from 'sdk/dao/post';
	export { default as ProfileDao } from 'sdk/dao/profile';
	export { default as StateDao } from 'sdk/dao/state';
	export { default as DeactivatedDao } from 'sdk/dao/deactivated';
	import DaoManager from 'sdk/dao/DaoManager'; const daoManager: DaoManager;
	export { daoManager };

}
declare module 'sdk/component/featureFlag/FlagCalculator' {
	import { IFlag, IFeatureConfig, BETA_FEATURE, AccountInfo, IFlagCalculator } from 'sdk/component/featureFlag/interface'; class FlagCalculator implements IFlagCalculator {
	    featureConfig: IFeatureConfig;
	    _flags: IFlag | {};
	    _permissionKeys: string[];
	    constructor(featureConfig: IFeatureConfig);
	    readonly accountInfo: AccountInfo;
	    isFeatureEnabled(flags: IFlag, feature: BETA_FEATURE): boolean;
	    getFlagValue(flags: IFlag, flagName: string): boolean;
	    private _pipeLiner;
	    private _checkFeatureStatus;
	    private _isInBetaEmailList;
	    private _isInBetaDomainList;
	    private _isInList;
	    private _hasPermission;
	}
	export default FlagCalculator;

}
declare module 'sdk/component/featureFlag/utils' {
	 type Option = {
	    equal: Function;
	} | null; function strictDiff(subjects: object[]): {}; function diff(opts: Option, subjects: object[]): {};
	export { diff, strictDiff };

}
declare module 'sdk/service/utils' {
	 const isFunction: (value: any) => boolean; const isIEOrEdge: boolean; const transform: <T extends {
	    id: number;
	}>(item: any) => T; const transformAll: <T extends {
	    id: number;
	}>(target: any) => T[]; const baseHandleData: ({ data, dao, eventKey }: any) => Promise<any>;
	export { transform, transformAll, baseHandleData, isFunction, isIEOrEdge };

}
declare module 'sdk/framework/account/IAccount' {
	interface IAccount {
	    updateSupportedServices(data: any): Promise<void>;
	    getSupportedServices(): string[];
	    on(event: string, callback: Function): void;
	}
	export { IAccount };

}
declare module 'sdk/framework/account/AbstractAccount' {
	import { EventEmitter2 } from 'eventemitter2';
	import { IAccount } from 'sdk/framework/account/IAccount'; abstract class AbstractAccount extends EventEmitter2 implements IAccount {
	    static EVENT_SUPPORTED_SERVICE_CHANGE: string;
	    private _supportedServices;
	    abstract updateSupportedServices(data: any): Promise<void>;
	    getSupportedServices(): string[];
	    setSupportedServices(services: string[]): void;
	}
	export { AbstractAccount };

}
declare module 'sdk/framework/account/IAccountObserver' {
	interface IAccountObserver {
	    onAuthChange(accountType: string, success: boolean): void;
	    onSupportedServiceChange(services: string[], start: boolean): void;
	}
	export { IAccountObserver };

}
declare module 'sdk/framework/account/AccountConfig' {
	import { IAccount } from 'sdk/framework/account/IAccount';
	import { IAccountObserver } from 'sdk/framework/account/IAccountObserver';
	interface AccountConfig {
	    type: string;
	    accountCreator: (type: string, accountObserver: IAccountObserver) => IAccount;
	}
	export { AccountConfig };

}
declare module 'sdk/framework/account/IAuthenticator' {
	interface IAuthParams {
	}
	interface IAccountInfo {
	    type: string;
	    data: any;
	}
	interface IAuthResponse {
	    success: boolean;
	    error?: Error;
	    accountInfos?: IAccountInfo[];
	    data?: any;
	}
	interface IAuthenticator {
	    authenticate(param: IAuthParams): Promise<IAuthResponse>;
	}
	interface ISyncAuthenticator {
	    authenticate(param: IAuthParams): IAuthResponse;
	}
	export { IAuthParams, IAccountInfo, IAuthenticator, IAuthResponse, ISyncAuthenticator };

}
declare module 'sdk/framework/account/AccountManager' {
	import { EventEmitter2 } from 'eventemitter2';
	import { Container } from 'foundation';
	import { IAccount } from 'sdk/framework/account/IAccount'; class AccountManager extends EventEmitter2 {
	    private _container;
	    static EVENT_LOGIN: string;
	    static EVENT_LOGOUT: string;
	    static EVENT_SUPPORTED_SERVICE_CHANGE: string;
	    private _isLogin;
	    private _accountMap;
	    private _accounts;
	    constructor(_container: Container);
	    syncLogin(authType: string, params?: any): {
	        success: boolean;
	        error: Error;
	        accounts?: undefined;
	    } | {
	        accounts: IAccount[];
	        success: boolean;
	        error?: undefined;
	    };
	    login(authType: string, params?: any): Promise<{
	        success: boolean;
	        error: Error;
	        accounts?: undefined;
	    } | {
	        accounts: IAccount[];
	        success: boolean;
	        error?: undefined;
	    }>;
	    logout(): Promise<void>;
	    getAccount(type: string): IAccount | null;
	    hasAccount(type: string): boolean;
	    isLoggedInFor(type: string): boolean;
	    isLoggedIn(): boolean;
	    updateSupportedServices(data?: any): void;
	    getSupportedServices(): string[];
	    isSupportedService(type: string): boolean;
	    private _createAccounts;
	    private _handleLoginResponse;
	}
	export { AccountManager };

}
declare module 'sdk/framework/account' {
	export * from 'sdk/framework/account/AbstractAccount';
	export * from 'sdk/framework/account/AccountConfig';
	export * from 'sdk/framework/account/AccountManager';
	export * from 'sdk/framework/account/IAccount';
	export * from 'sdk/framework/account/IAuthenticator';

}
declare module 'sdk/framework/service/IService' {
	interface IService {
	    isStarted(): boolean;
	    start(): void;
	    stop(): void;
	}
	export { IService };

}
declare module 'sdk/framework/service/AbstractService' {
	import { IService } from 'sdk/framework/service/IService'; abstract class AbstractService implements IService {
	    private _isStarted;
	    start(): void;
	    stop(): void;
	    isStarted(): boolean;
	    protected abstract onStarted(): void;
	    protected abstract onStopped(): void;
	}
	export { AbstractService };

}
declare module 'sdk/framework/service/ServiceConfig' {
	import { IService } from 'sdk/framework/service/IService';
	interface ServiceConfig {
	    accounts: string[];
	    service: string;
	    serviceCreator: () => IService;
	}
	export { ServiceConfig };

}
declare module 'sdk/framework/service/ServiceManager' {
	import { Container } from 'foundation';
	import { IService } from 'sdk/framework/service/IService';
	import { EventEmitter2 } from 'eventemitter2'; class ServiceManager extends EventEmitter2 {
	    private _container;
	    private _serviceMap;
	    constructor(_container: Container);
	    getServices(names: string[]): IService[];
	    getAllServices(): IService[];
	    getAllServiceNames(): string[];
	    getService(name: string): IService | null;
	    startService(name: string): Promise<IService>;
	    startServices(services: string[]): Promise<IService[]>;
	    stopService(name: string): void;
	    stopServices(services: string[]): void;
	    stopAllServices(): void;
	}
	export { ServiceManager };

}
declare module 'sdk/framework/service' {
	export * from 'sdk/framework/service/AbstractService';
	export * from 'sdk/framework/service/IService';
	export * from 'sdk/framework/service/ServiceConfig';
	export * from 'sdk/framework/service/ServiceManager';

}
declare module 'sdk/framework' {
	export * from 'sdk/framework/account';
	export * from 'sdk/framework/service';

}
declare module 'sdk/container' {
	import { Container } from 'foundation'; const container: Container;
	export { container };

}
declare module 'sdk/service/eventKey' {
	 enum SOCKET {
	    COMPANY = "SOCKET.COMPANY",
	    GROUP = "SOCKET.GROUP",
	    ITEM = "SOCKET.ITEM",
	    PERSON = "SOCKET.PERSON",
	    POST = "SOCKET.POST",
	    PRESENCE = "SOCKET.PRESENCE",
	    PROFILE = "SOCKET.PROFILE",
	    STATE = "SOCKET.STATE",
	    STATE_CHANGE = "SOCKET.STATE_CHANGE",
	    NETWORK_CHANGE = "SOCKET.NETWORK_CHANGE",
	    SEARCH = "SOCKET.SEARCH",
	    SEARCH_SCROLL = "SOCKET.SEARCH_SCROLL",
	    RECONNECT = "SOCKET.RECONNECT",
	    CLIENT_CONFIG = "SOCKET.CLIENT_CONFIG"
	} const ENTITY: {
	    COMPANY: string;
	    GROUP: string;
	    ITEM: string;
	    PERSON: string;
	    POST: string;
	    POST_OLD_NEW: string;
	    POST_SENT_STATUS: string;
	    PRESENCE: string;
	    PROFILE: string;
	    MY_STATE: string;
	    GROUP_STATE: string;
	    FAVORITE_GROUPS: string;
	    TEAM_GROUPS: string;
	    PEOPLE_GROUPS: string;
	}; const CONFIG: {
	    LAST_INDEX_TIMESTAMP: string;
	    SOCKET_SERVER_HOST: string;
	}; const SERVICE: {
	    LOGIN: string;
	    LOGOUT: string;
	    FETCH_INDEX_DATA_EXIST: string;
	    FETCH_INDEX_DATA_DONE: string;
	    FETCH_INDEX_DATA_ERROR: string;
	    PROFILE_FAVORITE: string;
	    SEARCH_SUCCESS: string;
	    SEARCH_END: string;
	    DO_SIGN_OUT: string;
	}; const DOCUMENT: {
	    VISIBILITYCHANGE: string;
	}; const WINDOW: {
	    ONLINE: string;
	    BLUR: string;
	};
	export { SOCKET, ENTITY, CONFIG, SERVICE, DOCUMENT, WINDOW };

}
declare module 'sdk/service/BaseService' {
	import { BaseModel } from 'sdk/models';
	import { AbstractService } from 'sdk/framework'; class BaseService<SubModel extends BaseModel = BaseModel> extends AbstractService {
	    DaoClass?: any;
	    ApiClass?: any;
	    handleData?: any;
	    private _subscriptions;
	    static serviceName: string;
	    constructor(DaoClass?: any, ApiClass?: any, handleData?: any, _subscriptions?: Object);
	    static getInstance<T extends BaseService<any>>(): T;
	    getById(id: number): Promise<SubModel>;
	    getByIdFromDao(id: number): Promise<SubModel>;
	    getByIdFromAPI(id: number): Promise<SubModel>;
	    getAllFromDao({ offset, limit }?: {
	        offset?: number;
	        limit?: number;
	    }): Promise<SubModel[]>;
	    getAll({ offset, limit }?: {
	        offset?: number;
	        limit?: number;
	    }): Promise<SubModel[]>;
	    protected onStarted(): void;
	    protected onStopped(): void;
	    private _subscribe;
	    private _unsubscribe;
	    private _checkDaoClass;
	}
	export default BaseService;

}
declare module 'sdk/api/NetworkClient' {
	import { NETWORK_VIA, IHandleType, IRequest, NETWORK_METHOD, BaseResponse } from 'foundation';
	export interface IQuery {
	    via?: NETWORK_VIA;
	    path: string;
	    method: NETWORK_METHOD;
	    data?: object;
	    headers?: object;
	    params?: object;
	    authFree?: boolean;
	    requestConfig?: object;
	}
	export interface IResponse<T> {
	    status: number;
	    data: T;
	    headers: object;
	}
	export interface INetworkRequests {
	    readonly host?: string;
	    readonly handlerType: IHandleType;
	}
	export interface IResponseResolveFn<T = {}> {
	    (value: IResponse<T> | PromiseLike<IResponse<T>>): void;
	}
	export interface IResponseRejectFn {
	    (value: object | PromiseLike<object>): void;
	}
	export default class NetworkClient {
	    networkRequests: INetworkRequests;
	    apiPlatform: string;
	    apiPlatformVersion: string;
	    apiMap: Map<string, {
	        resolve: IResponseResolveFn<any>;
	        reject: IResponseRejectFn;
	    }[]>;
	    defaultVia: NETWORK_VIA;
	    constructor(networkRequests: INetworkRequests, apiPlatform: string, defaultVia: NETWORK_VIA, apiPlatformVersion?: string);
	    request<T>(query: IQuery): Promise<IResponse<T>>;
	    buildCallback<T>(apiMapKey: string): (resp: BaseResponse) => void;
	    getRequestByVia<T>(query: IQuery, via?: NETWORK_VIA): IRequest;
	    http<T>(query: IQuery): Promise<IResponse<T>>;
	    /**
	     * @export
	     * @param {String} path request url
	     * @param {Object} [data={}] request params
	     * @param {Object} [data={}] request headers
	     * @returns Promise
	     */
	    get<T>(path: string, params?: {}, via?: NETWORK_VIA, requestConfig?: object, headers?: {}): Promise<IResponse<T>>;
	    /**
	     * @export
	     * @param {String} path request url
	     * @param {Object} [data={}] request params
	     * @param {Object} [data={}] request headers
	     * @returns Promise
	     */
	    post<T>(path: string, data?: {}, headers?: {}): Promise<IResponse<T>>;
	    /**
	     * @export
	     * @param {String} path request url
	     * @param {Object} [data={}] request params
	     * @param {Object} [data={}] request headers
	     * @returns Promise
	     */
	    put<T>(path: string, data?: {}, headers?: {}): Promise<IResponse<T>>;
	    /**
	     * @export
	     * @param {String} path request url
	     * @param {Object} [data={}] request params
	     * @param {Object} [data={}] request headers
	     * @returns Promise
	     */
	    delete<T>(path: string, params?: {}, headers?: {}): Promise<IResponse<T>>;
	    private _isDuplicate;
	}

}
declare module 'sdk/api/defaultConfig' {
	import { ApiConfig } from 'sdk/types'; const defaultConfig: ApiConfig;
	export { defaultConfig };

}
declare module 'sdk/api/handlers/HandleByGlip' {
	import { IRequest, ITokenHandler, NETWORK_VIA } from 'foundation'; const HandleByGlip: {
	    rcTokenProvider?: (() => string) | undefined;
	    defaultVia: NETWORK_VIA;
	    requestDecoration(tokenHandler: ITokenHandler): (request: IRequest) => IRequest;
	    survivalModeSupportable: boolean;
	    tokenExpirable: boolean;
	    tokenRefreshable: boolean;
	    doRefreshToken(token: {
	        timestamp: number;
	        access_token?: string | undefined;
	        accessTokenExpireIn: number;
	        refreshTokenExpireIn: number;
	        refreshToken?: string | undefined;
	    }): Promise<{
	        timestamp: number;
	        access_token?: string | undefined;
	        accessTokenExpireIn: number;
	        refreshTokenExpireIn: number;
	        refreshToken?: string | undefined;
	    }>;
	    basic(): string;
	};
	export default HandleByGlip;

}
declare module 'sdk/api/handlers/HandleByGlip2' {
	import { IRequest, ITokenHandler, NETWORK_VIA } from 'foundation'; const HandleByGlip2: {
	    defaultVia: NETWORK_VIA;
	    tokenRefreshable: boolean;
	    basic(): string;
	    requestDecoration(tokenHandler: ITokenHandler): (request: IRequest) => IRequest;
	    survivalModeSupportable: boolean;
	    tokenExpirable: boolean;
	    doRefreshToken(token: {
	        timestamp: number;
	        access_token?: string | undefined;
	        accessTokenExpireIn: number;
	        refreshTokenExpireIn: number;
	        refreshToken?: string | undefined;
	    }): Promise<{
	        timestamp: number;
	        access_token?: string | undefined;
	        accessTokenExpireIn: number;
	        refreshTokenExpireIn: number;
	        refreshToken?: string | undefined;
	    }>;
	};
	export default HandleByGlip2;

}
declare module 'sdk/api/handlers/HandleByRingCentral' {
	import { IRequest, ITokenHandler, IToken, NETWORK_VIA } from 'foundation'; const HandleByRingCentral: {
	    defaultVia: NETWORK_VIA;
	    survivalModeSupportable: boolean;
	    tokenExpirable: boolean;
	    tokenRefreshable: boolean;
	    basic(): string;
	    requestDecoration(tokenHandler: ITokenHandler): (request: IRequest) => IRequest;
	    doRefreshToken(token: IToken): Promise<IToken>;
	};
	export default HandleByRingCentral;

}
declare module 'sdk/api/handlers/HandleByUpload' {
	import { IRequest, ITokenHandler, NETWORK_VIA } from 'foundation'; const HandleByUpload: {
	    defaultVia: NETWORK_VIA;
	    survivalModeSupportable: boolean;
	    requestDecoration(tokenHandler: ITokenHandler): (request: IRequest) => IRequest;
	    tokenExpirable: boolean;
	    tokenRefreshable: boolean;
	    doRefreshToken(token: {
	        timestamp: number;
	        access_token?: string | undefined;
	        accessTokenExpireIn: number;
	        refreshTokenExpireIn: number;
	        refreshToken?: string | undefined;
	    }): Promise<{
	        timestamp: number;
	        access_token?: string | undefined;
	        accessTokenExpireIn: number;
	        refreshTokenExpireIn: number;
	        refreshToken?: string | undefined;
	    }>;
	    basic(): string;
	};
	export default HandleByUpload;

}
declare module 'sdk/api/handlers' {
	export { default as HandleByGlip } from 'sdk/api/handlers/HandleByGlip';
	export { default as HandleByGlip2 } from 'sdk/api/handlers/HandleByGlip2';
	export { default as HandleByRingCentral } from 'sdk/api/handlers/HandleByRingCentral';
	export { default as HandleByUpload } from 'sdk/api/handlers/HandleByUpload';

}
declare module 'sdk/api/api' {
	import NetworkClient, { IResponse } from 'sdk/api/NetworkClient';
	import { ApiConfig, HttpConfigType, PartialApiConfig } from 'sdk/types';
	import { Raw } from 'sdk/models';
	import { IHandleType } from 'foundation'; class Api {
	    static basePath: string;
	    static httpSet: Map<string, NetworkClient>;
	    static _httpConfig: ApiConfig;
	    static init(config: PartialApiConfig): void;
	    static setupHandlers(): void;
	    static readonly httpConfig: ApiConfig;
	    static getNetworkClient(name: HttpConfigType, type: IHandleType): NetworkClient;
	    static readonly glipNetworkClient: NetworkClient;
	    static readonly glip2NetworkClient: NetworkClient;
	    static readonly glipDesktopNetworkClient: NetworkClient;
	    static readonly rcNetworkClient: NetworkClient;
	    static readonly uploadNetworkClient: NetworkClient;
	    static getDataById<T>(id: number): Promise<IResponse<Raw<T>>>;
	    static postData<T>(data: Partial<T>): Promise<IResponse<Raw<T>>>;
	    static putDataById<T>(id: number, data: Partial<T>): Promise<IResponse<Raw<T>>>;
	}
	export default Api;

}
declare module 'sdk/api/ringcentral/constants' {
	 const RINGCENTRAL_API: {
	    API_OAUTH_TOKEN: string;
	    API_REFRESH_TOKEN: string;
	    API_GENERATE_CODE: string;
	    API_EXTENSION_INFO: string;
	    API_PROFILE: string;
	};
	export { RINGCENTRAL_API };

}
declare module 'sdk/api/ringcentral/login' {
	import { Token } from 'foundation';
	import { IResponse } from 'sdk/api/NetworkClient';
	export interface TokenModel extends Token {
	    access_token: string;
	    endpoint_id: string;
	    expires_in: number;
	    owner_id: string;
	    refresh_token: string;
	    refresh_token_expires_in: number;
	    scope: string;
	    token_type: string;
	}
	/**
	 * @param {string} grant_type
	 * @param {string} username
	 * @param {string} password
	 * return authData for glip login by password
	 */
	export function loginRCByPassword(data: object): Promise<IResponse<TokenModel>>;
	/**
	 * @param {string} grant_type
	 * @param {string} username
	 * @param {string} password
	 * rc login for glip 2.0 api by password
	 */
	export function loginGlip2ByPassword(data: object): Promise<IResponse<TokenModel>>;
	/**
	 * @param {string} refresh_token
	 * @param {string} grant_type
	 */
	export function refreshToken(data: object): Promise<IResponse<TokenModel>>;

}
declare module 'sdk/api/glip/constants' {
	 const GLIP_API: {
	    readonly API_OAUTH_TOKEN: string;
	};
	export { GLIP_API };

}
declare module 'sdk/api/glip/user' {
	import { IResponse } from 'sdk/api/NetworkClient';
	import { Raw, Company, Item, Profile, Presence, State, Person, Group, Post } from 'sdk/models';
	import { IFlag } from 'sdk/component/featureFlag/interface';
	export type IndexDataModel = {
	    user_id: number;
	    company_id: number;
	    profile?: Raw<Profile>;
	    companies?: Raw<Company>[];
	    items?: Raw<Item>[];
	    presences?: Raw<Presence>[];
	    state?: Raw<State>;
	    people?: Raw<Person>[];
	    groups?: Raw<Group>[];
	    teams?: Raw<Group>[];
	    posts?: Raw<Post>[];
	    max_posts_exceeded?: boolean;
	    timestamp?: number;
	    scoreboard?: string;
	    client_config: IFlag;
	}; type IndexResponse = IResponse<IndexDataModel>; function loginGlip(authData: object): Promise<IResponse<Object>>; function indexData(params: object, requestConfig?: {}, headers?: {}): Promise<IndexResponse>; function initialData(params: object, requestConfig?: {}, headers?: {}): Promise<IndexResponse>; function remainingData(params: object, requestConfig?: {}, headers?: {}): Promise<IndexResponse>;
	export { loginGlip, indexData, initialData, remainingData, };

}
declare module 'sdk/api' {
	import { loginRCByPassword, loginGlip2ByPassword, refreshToken } from 'sdk/api/ringcentral/login';
	import { loginGlip, indexData, initialData, remainingData } from 'sdk/api/glip/user';
	export { default as Api } from 'sdk/api/api';
	export { loginRCByPassword, loginGlip2ByPassword, refreshToken, loginGlip, indexData, initialData, remainingData, };
	export * from 'sdk/api/handlers';

}
declare module 'sdk/service/account' {
	import BaseService from 'sdk/service/BaseService';
	import { UserInfo } from 'sdk/models';
	export default class AccountService extends BaseService {
	    static serviceName: string;
	    private accountDao;
	    constructor();
	    getCurrentUserId(): number | null;
	    getCurrentUserProfileId(): number | null;
	    getCurrentCompanyId(): number | null;
	    getCurrentUserInfo(): Promise<UserInfo | {}>;
	    getUserEmail(): Promise<string>;
	    getClientId(): string;
	    refreshRCToken(): Promise<import("src/api/ringcentral/login").TokenModel | null>;
	}

}
declare module 'sdk/api/glip/post' {
	import { IResponse } from 'sdk/api/NetworkClient';
	import Api from 'sdk/api/api';
	import { Post, Item, Raw } from 'sdk/models';
	export interface PostsModel {
	    posts: Raw<Post>[];
	    items: Raw<Item>[];
	} class PostAPI extends Api {
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
	    static basePath: string;
	    static requestPosts(params: object): Promise<IResponse<PostsModel>>;
	    /**
	     *  /api/post
	     */
	    static sendPost(data: object): Promise<IResponse<Raw<Post>>>;
	    static requestById(id: number): Promise<IResponse<Raw<Post>>>;
	    static editPost(id: number, data: object): Promise<IResponse<Raw<Post>>>;
	}
	export default PostAPI;

}
declare module 'sdk/service/post/types' {
	/*
	 * @Author: Nello Huang (nello.huang@ringcentral.com)
	 * @Date: 2018-05-04 10:37:24
	 * Copyright © RingCentral. All rights reserved.
	 */
	export type RawPostInfo = {
	  atMentions?: boolean;
	  users?: any[];
	  text: string;
	  file?: FormData;
	  groupId?: number;
	  itemIds?: number[];
	  postId?: number;
	};

	export type RawPostInfoWithFile = RawPostInfo & {
	  file: FormData;
	};

}
declare module 'sdk/service/post/postServiceHandler' {
	import { Post } from 'sdk/models';
	import { RawPostInfo } from 'sdk/service/post/types';
	export type LinksArray = {
	    url: string;
	}[]; class PostServiceHandler {
	    static buildAtMentionsPeopleInfo(params: RawPostInfo): {
	        text: string;
	        at_mention_non_item_ids: number[];
	    };
	    static buildLinksInfo(params: RawPostInfo): LinksArray;
	    static buildPostInfo(params: RawPostInfo): Post;
	    static buildResendPostInfo(post: Post): Post;
	    static buildModifiedPostInfo(params: RawPostInfo): Promise<object | null>;
	}
	export default PostServiceHandler;

}
declare module 'sdk/api/glip/item' {
	import { IResponse } from 'sdk/api/NetworkClient';
	import Api from 'sdk/api/api';
	import { FileItem, Item, BaseModel, StoredFile, Raw, NoteItem } from 'sdk/models';
	interface RightRailItemModel extends BaseModel {
	    items: Raw<Item>[];
	} type ProgressCallback = (e: ProgressEventInit) => any; type UploadFileResponse = IResponse<StoredFile>; type FileResponse = IResponse<Raw<FileItem>>; type RightRailResponse = IResponse<RightRailItemModel>; type NoteResponse = IResponse<Raw<NoteItem>>; class ItemAPI extends Api {
	    static basePath: string;
	    static sendFileItem(data: object): Promise<IResponse<Raw<FileItem>>>;
	    static uploadFileItem(files: FormData, callback?: ProgressCallback): Promise<UploadFileResponse>;
	    static requestById(id: number): Promise<FileResponse>;
	    static requestRightRailItems(groupId: number): Promise<RightRailResponse>;
	    static getNote(id: number): Promise<NoteResponse>;
	}
	export default ItemAPI;
	export { RightRailItemModel, FileResponse, ProgressCallback, UploadFileResponse, };

}
declare module 'sdk/service/UploadManager' {
	import { EventEmitter2 } from 'eventemitter2';
	/**
	 * Class UploadManager
	 * Conversation's files management
	 */
	export class UploadManager extends EventEmitter2 {
	    constructor();
	} const uploadManager: UploadManager;
	export default uploadManager;

}
declare module 'sdk/service/item/handleData' {
	import { ISendFile } from 'sdk/service/item';
	import { StoredFile, Item, Raw, FileItem } from 'sdk/models'; const itemHandleData: (items: Raw<Item>[]) => Promise<any>; const uploadStorageFile: (params: ISendFile) => Promise<StoredFile>; const extractFileNameAndType: (storagePath: string) => {
	    name: string;
	    type: string;
	};
	export type Options = {
	    storedFile: StoredFile;
	    groupId?: string;
	}; const sendFileItem: (options: Options) => Promise<Raw<FileItem>>;
	export { uploadStorageFile, extractFileNameAndType, sendFileItem };
	export default itemHandleData;

}
declare module 'sdk/service/item' {
	import BaseService from 'sdk/service/BaseService';
	import { Item, FileItem, NoteItem } from 'sdk/models';
	export interface ISendFile {
	    file: FormData;
	    groupId?: string;
	}
	export default class ItemService extends BaseService<Item> {
	    static serviceName: string;
	    constructor();
	    sendFile(params: ISendFile): Promise<FileItem | null>;
	    getRightRailItemsOfGroup(groupId: number, limit?: number): Promise<Item[]>;
	    getNoteById(id: number): Promise<NoteItem | null>;
	}

}
declare module 'sdk/api/glip/profile' {
	import { IResponse } from 'sdk/api/NetworkClient';
	import Api from 'sdk/api/api';
	import { Profile, Raw } from 'sdk/models'; class ProfileAPI extends Api {
	    static basePath: string;
	    static requestProfileById(id: number): Promise<IResponse<Raw<Profile>>>;
	}
	export default ProfileAPI;

}
declare module 'sdk/service/profile/handleData' {
	import { Profile, Raw } from 'sdk/models'; const profileHandleData: (profile: Raw<Profile>[]) => Promise<Profile[] | null>;
	export default profileHandleData;

}
declare module 'sdk/service/profile' {
	import BaseService from 'sdk/service/BaseService';
	import { Profile } from 'sdk/models';
	export default class ProfileService extends BaseService<Profile> {
	    static serviceName: string;
	    constructor();
	    getProfile(): Promise<Profile | null>;
	    putFavoritePost(postId: number, toBook: boolean): Promise<Profile | null>;
	}

}
declare module 'sdk/service/group/groupServiceHandler' {
	 class GroupServiceHandler {
	    static buildNewGroupInfo(members: number[]): {
	        members: number[];
	        creator_id: number;
	        is_new: boolean;
	        new_version: number;
	    };
	}
	export default GroupServiceHandler;

}
declare module 'sdk/api/glip/group' {
	import { IResponse } from 'sdk/api/NetworkClient';
	import Api from 'sdk/api/api';
	import { Group, Raw } from 'sdk/models'; class GroupAPI extends Api {
	    /**
	     *
	     * @param {*} id  group id
	     * return group or null
	     */
	    static basePath: string;
	    static requestGroupById(id: number): Promise<IResponse<Raw<Group>>>;
	    static requestNewGroup(options: Partial<Group>): Promise<IResponse<Raw<Group>>>;
	    static pinPost(path: string, options: object): Promise<IResponse<Raw<Group>>>;
	    static addTeamMembers(groupId: number, memberIds: number[]): Promise<IResponse<Raw<Group>>>;
	    static createTeam(data: Partial<Group>): Promise<IResponse<Raw<Group>>>;
	}
	export default GroupAPI;

}
declare module 'sdk/api/glip/state' {
	import { IResponse } from 'sdk/api/NetworkClient';
	import Api from 'sdk/api/api';
	import { MyState, Raw, State } from 'sdk/models'; class StateAPI extends Api {
	    /**
	     *
	     * @param {*} id  group id
	     * return group or null
	     */
	    static basePath: string;
	    static saveStatePartial(id: number, state: Partial<State>): Promise<IResponse<Raw<MyState>>>;
	}
	export default StateAPI;

}
declare module 'sdk/service/state/handleData' {
	import { MyState, GroupState, Raw } from 'sdk/models';
	export type TransformedState = MyState & {
	    groupState: GroupState[];
	};
	export function transform(item: Raw<MyState>): TransformedState;
	export function getStates(state: Raw<MyState>[]): {
	    myState: import("src/models").State[];
	    groupStates: GroupState[];
	    transformedData: TransformedState[];
	};
	export default function stateHandleData(state: Raw<MyState>[]): Promise<void>;

}
declare module 'sdk/service/state' {
	import { GroupState, MyState, Post } from 'sdk/models';
	import BaseService from 'sdk/service/BaseService';
	export default class StateService extends BaseService<GroupState> {
	    static serviceName: string;
	    constructor();
	    static buildMarkAsReadParam(groupId: number, lastPostId: number): {
	        [x: string]: number | boolean;
	    };
	    static buildUpdateStateParam(groupId: number, lastPostId: number): {
	        [x: string]: number;
	        last_group_id: number;
	    };
	    getById(id: number): Promise<GroupState>;
	    markAsRead(groupId: number): Promise<void>;
	    updateLastGroup(groupId: number): Promise<void>;
	    getAllGroupStatesFromLocal(): Promise<GroupState[]>;
	    updateState(groupId: number, paramBuilder: Function): Promise<void>;
	    getLastPostOfGroup(groupId: number): Promise<Post | null>;
	    getMyState(): Promise<MyState | null>;
	}

}
declare module 'sdk/service/group/handleData' {
	import { Group, Post, Raw, Profile } from 'sdk/models'; function saveDataAndDoNotification(groups: Group[]): Promise<Group[]>;
	export default function handleData(groups: Raw<Group>[]): Promise<void>; function handleFavoriteGroupsChanged(oldProfile: Profile, newProfile: Profile): Promise<void>; function handleGroupMostRecentPostChanged(posts: Post[]): Promise<void>; function filterGroups(groups: Group[], groupType: string | undefined, defaultLength: number): Promise<Group[]>;
	export { handleFavoriteGroupsChanged, handleGroupMostRecentPostChanged, saveDataAndDoNotification, filterGroups, };

}
declare module 'sdk/service/group/permission' {
	import { Group } from 'sdk/models';
	import { PERMISSION_ENUM } from 'sdk/service/constants';
	export type PermissionKeys = keyof typeof PERMISSION_ENUM;
	export type PermissionFlags = {
	    [KEY in PermissionKeys]: boolean;
	};
	export default class Permission {
	    group: Group;
	    userId: number;
	    companyId: number;
	    constructor(params: Group, userId: number, companyId: number);
	    static createPermissionsMask(newPermissions: PermissionFlags): any;
	    isPublic(): boolean | undefined;
	    isGuest(): boolean | undefined;
	    isSelfGroup(): boolean;
	    isTeamGroup(): boolean | undefined;
	    isCommonGroup(): boolean;
	    readonly level: number;
	    getTeamGroupLevel(): number | undefined;
	    levelToArray(level: number): PERMISSION_ENUM[];
	    getPermissions(): PERMISSION_ENUM[];
	    hasPermission(permission: PERMISSION_ENUM): boolean;
	}

}
declare module 'sdk/service/group' {
	import { Group, Raw } from 'sdk/models';
	import BaseService from 'sdk/service/BaseService';
	import { PERMISSION_ENUM } from 'sdk/service/constants';
	import { IResponse } from 'sdk/api/NetworkClient';
	export type CreateTeamOptions = {
	    isPublic?: boolean;
	    canAddMember?: boolean;
	    canPost?: boolean;
	    canAddIntegrations?: boolean;
	    canPin?: boolean;
	};
	export default class GroupService extends BaseService<Group> {
	    static serviceName: string;
	    constructor();
	    getGroupsByType(groupType?: string, offset?: number, limit?: number): Promise<Group[]>;
	    getLastNGroups(n: number): Promise<Group[]>;
	    getGroupsByIds(ids: number[]): Promise<Group[]>;
	    getGroupById(id: number): Promise<Group | null>;
	    getGroupByPersonId(personId: number): Promise<Group[]>;
	    getGroupByMemberList(members: number[]): Promise<Group[]>;
	    requestRemoteGroupByMemberList(members: number[]): Promise<Group[]>;
	    getLatestGroup(): Promise<Group | null>;
	    canPinPost(postId: number, group: Group): boolean;
	    pinPost(postId: number, groupId: number, toPin: boolean): Promise<Group | null>;
	    getPermissions(group: Group): PERMISSION_ENUM[];
	    hasPermissionWithGroupId(group_id: number, type: PERMISSION_ENUM): Promise<boolean>;
	    hasPermissionWithGroup(group: Group, type: PERMISSION_ENUM): boolean;
	    addTeamMembers(groupId: number, memberIds: number[]): Promise<Group | null>;
	    createTeam(name: string, creator: number, memberIds: number[], description: string, options?: CreateTeamOptions): Promise<Group | null>;
	    handleResponse(resp: IResponse<Raw<Group>>): Promise<Group | null>;
	}

}
declare module 'sdk/service/post/incomingPostHandler' {
	import { Post } from 'sdk/models';
	export type GroupPosts = {
	    [groupId: number]: Post[];
	}; class IncomingPostHandler {
	    static handelGroupPostsDiscontinuousCasuedByOverThreshold(transformedData: Post[], maxPostsExceed: boolean): Promise<Post[]>;
	    static isGroupPostsDiscontinuous(posts: Post[]): boolean;
	    static removeDiscontinuousPosts(groupPosts: GroupPosts): Promise<number[]>;
	    static handleGroupPostsDiscontinuousCausedByModificationTimeChange(posts: Post[]): Promise<Post[]>;
	    static handleEditedPostNoInDB(transformedData: Post[]): Promise<Post[]>;
	    static getDeactivatedPosts(validPosts: Post[]): Post[];
	    static removeDeactivedPostFromValidPost(validPost: Post[], deactivedPosts: Post[]): Post[];
	}
	export default IncomingPostHandler;

}
declare module 'sdk/service/post/handleData' {
	import { Post, Group, Raw } from 'sdk/models';
	export function checkIncompletePostsOwnedGroups(posts: Post[]): Promise<Group[]>;
	export function handleDeactivedAndNormalPosts(posts: Post[]): Promise<Post[]>;
	export function handleDataFromSexio(data: Raw<Post>[]): Promise<void>;
	export function handleDataFromIndex(data: Raw<Post>[], maxPostsExceed: boolean): Promise<void>;
	export default function (data: Raw<Post>[], maxPostsExceed: boolean): Promise<void>;
	export function baseHandleData(data: Raw<Post>[] | Raw<Post> | Post[] | Post, needTransformed?: boolean): Promise<Post[]>;
	export function handlePreInstedPosts(posts?: Post[]): Promise<number[]>;

}
declare module 'sdk/service/post/postSendStatusHandler' {
	 enum ESendStatus {
	    SUCCESS = 0,
	    FAIL = 1,
	    INPROGRESS = 2
	} class PostSendStatusHandler {
	    private sendStatusIdStatus;
	    private sendStatusIdVersion;
	    private isInited;
	    constructor();
	    init(): Promise<void>;
	    getStatus(id: number): Promise<ESendStatus>;
	    clear(): void;
	    addIdAndVersion(id: number, version: number, status?: ESendStatus): void;
	    removeVersion(version: number): void;
	    isVersionInPreInsert(version: number): Promise<{
	        existed: boolean;
	        id: number;
	    }>;
	}
	export { ESendStatus, PostSendStatusHandler };

}
declare module 'sdk/service/post' {
	import BaseService from 'sdk/service/BaseService';
	import { Post, Profile, Item, Raw } from 'sdk/models';
	import { ESendStatus } from 'sdk/service/post/postSendStatusHandler';
	import { RawPostInfo, RawPostInfoWithFile } from 'sdk/service/post/types';
	export interface IPostResult {
	    posts: Post[];
	    items: Item[];
	    hasMore: boolean;
	}
	export interface IRawPostResult {
	    posts: Raw<Post>[];
	    items: Raw<Item>[];
	    hasMore: boolean;
	}
	export interface IPostQuery {
	    groupId: number;
	    offset?: number;
	    limit?: number;
	    postId?: number;
	    direction?: string;
	}
	export type PostData = {
	    id: number;
	    data: Post;
	};
	export type PostSendData = {
	    id: number;
	    status: ESendStatus;
	};
	export default class PostService extends BaseService<Post> {
	    static serviceName: string;
	    private postSendStatusHandler;
	    constructor();
	    getPostsFromLocal({ groupId, offset, limit }: IPostQuery): Promise<IPostResult>;
	    getPostsFromRemote({ groupId, postId, limit, direction }: IPostQuery): Promise<IRawPostResult>;
	    getPostsByGroupId({ groupId, offset, postId, limit }: IPostQuery): Promise<IPostResult>;
	    getPostSendStatus(id: number): Promise<PostSendData>;
	    isVersionInPreInsert(version: number): Promise<{
	        existed: boolean;
	        id: number;
	    }>;
	    sendPost(params: RawPostInfo): Promise<PostData[] | null>;
	    reSendPost(postId: number): Promise<PostData[] | null>;
	    innerSendPost(info: Post): Promise<PostData[] | null>;
	    handlePreInsertProcess(postInfo: Post): Promise<void>;
	    handleSendPostSuccess(data: Raw<Post>, oldPost: Post): Promise<PostData[]>;
	    handleSendPostFail(id: number, version: number): Promise<never[]>;
	    sendItemFile(params: RawPostInfoWithFile): Promise<Post | null>;
	    /**
	     * POST related operations
	     * PIN,LIKE,DELETE,EDIT,FAVORITE
	     */
	    modifyPost(params: RawPostInfo): Promise<Post | null>;
	    deletePost(id: number): Promise<Post | null>;
	    likePost(postId: number, personId: number, toLike: boolean): Promise<Post | null>;
	    bookmarkPost(postId: number, toBook: boolean): Promise<Profile | null>;
	    getLastPostOfGroup(groupId: number): Promise<Post | null>;
	}

}
declare module 'sdk/api/glip/company' {
	import { IResponse } from 'sdk/api/NetworkClient';
	import Api from 'sdk/api/api';
	import { Company, Raw } from 'sdk/models'; class CompanyAPI extends Api {
	    /**
	     * @param {*} id  company id
	     * return company or null
	     */
	    static basePath: string;
	    static requestCompanyById(id: number): Promise<IResponse<Raw<Company>>>;
	}
	export default CompanyAPI;

}
declare module 'sdk/service/company/handleData' {
	import { Company, Raw } from 'sdk/models'; const companyHandleData: (companies: Raw<Company>[]) => Promise<void>;
	export default companyHandleData;

}
declare module 'sdk/service/company' {
	import { Company } from 'sdk/models';
	import BaseService from 'sdk/service/BaseService';
	export default class CompanyService extends BaseService<Company> {
	    static serviceName: string;
	    constructor();
	}

}
declare module 'sdk/api/glip/person' {
	import { IResponse } from 'sdk/api/NetworkClient';
	import Api from 'sdk/api/api';
	import { Person, Raw } from 'sdk/models'; class PersonAPI extends Api {
	    /**
	     *
	     * @param {*} id  group id
	     * return group or null
	     */
	    static basePath: string;
	    static requestPersonById(id: number): Promise<IResponse<Raw<Person>>>;
	}
	export default PersonAPI;

}
declare module 'sdk/service/person/handleData' {
	import { Person, Raw } from 'sdk/models'; const personHandleData: (persons: Raw<Person>[]) => Promise<void>;
	export default personHandleData;

}
declare module 'sdk/service/person' {
	import BaseService from 'sdk/service/BaseService';
	import { IPagination } from 'sdk/types';
	import { Person } from 'sdk/models';
	export default class PersonService extends BaseService<Person> {
	    static serviceName: string;
	    constructor();
	    getPersonsByIds(ids: number[]): Promise<(Person | null)[]>;
	    getPersonsByPrefix(prefix: string, pagination?: Partial<IPagination>): Promise<Person[]>;
	    getPersonsOfEachPrefix(limit?: number): Promise<Map<string, Person[]>>;
	    getPersonsCountByPrefix(prefix: string): Promise<number>;
	    getAllCount(): Promise<number>;
	}

}
declare module 'sdk/service/serviceManager' {
	import Manager from 'sdk/Manager';
	import BaseService from 'sdk/service/BaseService';
	import { Newable } from 'sdk/types'; class ServiceManager extends Manager<BaseService> {
	    getInstance<T extends BaseService>(ServiceClass: Newable<T>): T;
	} const serviceManager: ServiceManager;
	export { ServiceManager };
	export default serviceManager;

}
declare module 'sdk/service/presence/handleData' {
	export interface ITransform {
	    person_id: number;
	    presence: string;
	} const presenceHandleData: (presences: ITransform[]) => Promise<void>;
	export default presenceHandleData;

}
declare module 'sdk/service/presence' {
	import BaseService from 'sdk/service/BaseService';
	export interface Ipresence {
	    id: number;
	}
	export default class PresenceService extends BaseService {
	    static key: string;
	    caches: object;
	    constructor();
	    saveToMemory(presences: Ipresence[]): void;
	    getById(id: number): Promise<any>;
	}

}
declare module 'sdk/service/search/types' {
	/*
	 * @Author: Andy Hu
	 * @Date: 2018-06-14 23:06:29
	 * Copyright © RingCentral. All rights reserved.
	 */

	import { Post, Item, Raw } from 'sdk/models';

	export type RequestId = Number;
	export type QueryString = String;
	export type ResponseId = Number;
	export interface CancelRequestParam {
	  previous_server_request_id: RequestId;
	}
	export interface BasicQuery extends Partial<QueryFilter> {
	  scroll_size?: Number;
	  slice_size?: Number;
	}
	interface QueryFilter {
	  type?: String;
	  group_id?: Number;
	  begin_time: Date;
	  end_time: Date;
	  creator_id: Number;
	}
	export interface RawQuery extends BasicQuery {
	  queryString: QueryString;
	  clear?: Boolean;
	}
	export interface InitialSearchParams extends BasicQuery {
	  q: QueryString;
	  previous_server_request_id?: RequestId;
	}
	export interface QueryByPageNum {
	  pageNum: Number;
	}
	export interface ScrollSearchParams {
	  scroll_request_id: Number;
	  search_request_id: Number;
	}

	export interface InitialSearchResp {
	  request_id: RequestId;
	}

	export interface SearchResult {
	  request_id: RequestId;
	  query: QueryString;
	  results?: (Raw<Post> | Raw<Item>)[];
	  response_id: ResponseId;
	  scroll_request_id?: RequestId;
	}

}
declare module 'sdk/api/glip/search' {
	/**
	 * @Author: Andy Hu
	 * @Date:   2018-05-30T15:37:24+08:00
	 * @Email:  andy.hu@ringcentral.com
	 * @Project: Fiji
	 * @Last modified by:   andy.hu
	 * @Last modified time: 2018-06-13T10:22:24+08:00
	 * @Copyright: © RingCentral. All rights reserve
	 */
	import { IResponse } from 'sdk/api/NetworkClient';
	import Api from 'sdk/api/api';
	import { InitialSearchParams, SearchResult } from 'sdk/service/search/types.d';
	import { CancelRequestParam } from 'sdk/service/search/types'; type SearchParams = InitialSearchParams | CancelRequestParam; type SearchResponse = IResponse<SearchResult>; class SearchAPI extends Api {
	    static basePath: string;
	    static search(params: SearchParams): Promise<SearchResponse>;
	    static scrollSearch(params: object): Promise<IResponse<SearchResult>>;
	}
	export default SearchAPI;
	export { SearchParams, SearchResponse, };

}
declare module 'sdk/service/search/handleData' {
	import { SearchResult } from 'sdk/service/search/types.d'; const _default: ({ results, request_id: requestId, scroll_request_id }: SearchResult) => void;
	export default _default;

}
declare module 'sdk/service/search' {
	import BaseService from 'sdk/service/BaseService';
	import { Person } from 'sdk/models';
	import { RequestId, QueryString, RawQuery, QueryByPageNum, InitialSearchResp, SearchResult } from 'sdk/service/search/types.d';
	import { IResponse } from 'sdk/api/NetworkClient';
	export default class SearchService extends BaseService {
	    static serviceName: string;
	    static MIN_QUERY_WORD_LENGTH: number;
	    static filterKeys: string[];
	    activeServerRequestId?: RequestId;
	    lastQuery?: RawQuery;
	    constructor();
	    searchContact(key: string): Promise<object>;
	    searchMembers(key: string): Promise<Person[]>;
	    cleanQuery(queryString?: QueryString): QueryString;
	    cancelSearchRequest(requestId: RequestId): Promise<IResponse<SearchResult>>;
	    search(query: RawQuery): Promise<void>;
	    remoteSearch(query: RawQuery): Promise<InitialSearchResp>;
	    fetchResultsByPage(query: QueryByPageNum): Promise<IResponse<SearchResult>>;
	    cancel(): void;
	}

}
declare module 'sdk/account/GlipAccount' {
	import { AbstractAccount } from 'sdk/framework'; class GlipAccount extends AbstractAccount {
	    updateSupportedServices(data: any): Promise<void>;
	}
	export { GlipAccount };

}
declare module 'sdk/account/RCAccount' {
	import { AbstractAccount } from 'sdk/framework'; class RCAccount extends AbstractAccount {
	    updateSupportedServices(data: any): Promise<void>;
	}
	export { RCAccount };

}
declare module 'sdk/account' {
	export * from 'sdk/account/GlipAccount';
	export * from 'sdk/account/RCAccount';

}
declare module 'sdk/authenticator/constants' {
	 const ACCOUNT_TYPE_ENUM: {
	    RC: string;
	    GLIP: string;
	}; const ACCOUNT_TYPE = "ACCOUNT_TYPE";
	export { ACCOUNT_TYPE, ACCOUNT_TYPE_ENUM };

}
declare module 'sdk/authenticator/RCPasswordAuthenticator' {
	import { IAuthenticator, IAuthParams, IAuthResponse } from 'sdk/framework';
	interface RCPasswordAuthenticateParams extends IAuthParams {
	    username: string;
	    password: string;
	    extension?: string;
	} class RCPasswordAuthenticator implements IAuthenticator {
	    authenticate(params: RCPasswordAuthenticateParams): Promise<IAuthResponse>;
	    parsePhoneNumber(phoneNumber: string): string;
	}
	export { RCPasswordAuthenticator };

}
declare module 'sdk/authenticator/AutoAuthenticator' {
	import { IAuthResponse, ISyncAuthenticator } from 'sdk/framework';
	import DaoManager from 'sdk/dao/DaoManager'; class AutoAuthenticator implements ISyncAuthenticator {
	    private _accountTypeHandleMap;
	    private _daoManager;
	    constructor(daoManager: DaoManager);
	    authenticate(): IAuthResponse;
	    private _authGlipLogin;
	    private _authRCLogin;
	}
	export { AutoAuthenticator };

}
declare module 'sdk/api/ringcentral/auth' {
	import { IResponse } from 'sdk/api/NetworkClient';
	export interface AuthModel {
	}
	export interface AuthCodeModel {
	    code: string;
	} function oauthTokenViaAuthCode(params: object, headers?: object): Promise<IResponse<AuthModel>>; function generateCode(clientId: string, redirectUri: string): Promise<IResponse<AuthCodeModel>>;
	export { oauthTokenViaAuthCode, generateCode, };

}
declare module 'sdk/authenticator/UnifiedLoginAuthenticator' {
	import { IAuthenticator, IAuthParams, IAuthResponse } from 'sdk/framework';
	interface UnifiedLoginAuthenticateParams extends IAuthParams {
	    code?: string;
	    token?: string;
	} class UnifiedLoginAuthenticator implements IAuthenticator {
	    /**
	     * should consider 2 cases
	     * 1. RC account
	     * 2. Glip account
	     * we only consider 1 now, will implement case 2 in the future
	     */
	    authenticate(params: UnifiedLoginAuthenticateParams): Promise<IAuthResponse>;
	    private _authenticateGlip;
	    private _authenticateRC;
	}
	export { UnifiedLoginAuthenticator };

}
declare module 'sdk/authenticator' {
	export * from 'sdk/authenticator/RCPasswordAuthenticator';
	export * from 'sdk/authenticator/AutoAuthenticator';
	export * from 'sdk/authenticator/UnifiedLoginAuthenticator';

}
declare module 'sdk/service/auth' {
	import { AccountManager } from 'sdk/framework';
	import BaseService from 'sdk/service/BaseService';
	export interface Login {
	    username: string;
	    extension: string;
	    password: string;
	}
	export interface UnifiedLogin {
	    code: string;
	}
	export default class AuthService extends BaseService {
	    static serviceName: string;
	    private _accountManager;
	    constructor(accountManager: AccountManager);
	    unifiedLogin({ code }: UnifiedLogin): Promise<void>;
	    login(params: Login): Promise<void>;
	    onLogin(): void;
	    loginGlip(params: Login): Promise<void>;
	    loginGlip2(params: Login): Promise<void>;
	    logout(): Promise<void>;
	    isLoggedIn(): boolean;
	}

}
declare module 'sdk/service/config/handleData' {
	 function handleLogout(): void;
	export { handleLogout };

}
declare module 'sdk/service/config' {
	import BaseService from 'sdk/service/BaseService';
	import AuthService from 'sdk/service/auth';
	export default class ConfigService extends BaseService {
	    static serviceName: string;
	    private _authService;
	    constructor(authService: AuthService);
	    getEnv(): string;
	    getLastIndexTimestamp(): any;
	    switchEnv(env: string): Promise<void>;
	}

}
declare module 'sdk/service/SocketManager/SocketFSM' {
	import StateMachine from 'ts-javascript-state-machine';
	export class SocketFSM extends StateMachine {
	    serverUrl: string;
	    private static instanceID;
	    socketClient: any;
	    protected isStopped: boolean;
	    protected latestPongTime: number;
	    private logPrefix;
	    constructor(serverUrl: string);
	    info(message: string): void;
	    warn(message: string): void;
	    error(message: string): void;
	    cleanup(): void;
	    protected registerSocketEvents(): void;
	}

}
declare module 'sdk/service/SocketManager/SocketManager' {
	export class SocketManager {
	    private static instance;
	    activeFSM: any;
	    private logPrefix;
	    private closeingFSMs;
	    private successConnectedUrls;
	    private hasLoggedIn;
	    private constructor();
	    static getInstance(): SocketManager;
	    info(message: string): void;
	    warn(message: string): void;
	    error(message: string): void;
	    hasActiveFSM(): boolean;
	    ongoingFSMCount(): number;
	    private _subscribeExternalEvent;
	    private _onLogin;
	    private _onLogout;
	    private _onServerHostUpdated;
	    private _onSocketStateChanged;
	    private _onOffline;
	    private _onOnline;
	    private _onFocus;
	    private _onReconnect;
	    private _startFSM;
	    private _stopActiveFSM;
	}

}
declare module 'sdk/service/SocketManager' {
	import { SocketManager } from 'sdk/service/SocketManager/SocketManager'; const socketManager: SocketManager;
	export default socketManager;

}
declare module 'sdk/service' {
	export { default as BaseService } from 'sdk/service/BaseService';
	export { default as AccountService } from 'sdk/service/account';
	export { default as AuthService } from 'sdk/service/auth';
	export { default as ConfigService } from 'sdk/service/config';
	export { default as CompanyService } from 'sdk/service/company';
	export { default as GroupService } from 'sdk/service/group';
	export { default as ItemService } from 'sdk/service/item';
	export { default as PersonService } from 'sdk/service/person';
	export { default as PostService } from 'sdk/service/post';
	export { default as PresenceService } from 'sdk/service/presence';
	export { default as ProfileService } from 'sdk/service/profile';
	export { default as SearchService } from 'sdk/service/search';
	export { default as StateService } from 'sdk/service/state';
	export { default as notificationCenter } from 'sdk/service/notificationCenter';
	export { default as uploadManager } from 'sdk/service/UploadManager';
	export { default as serviceManager } from 'sdk/service/serviceManager';
	export * from 'sdk/service/SocketManager';
	export * from 'sdk/service/eventKey';
	export * from 'sdk/service/constants';

}
declare module 'sdk/component/DataDispatcher/dataDispatcher' {
	import { EventEmitter2 } from 'eventemitter2';
	import { SOCKET } from 'sdk/service'; type Handler = (data: any) => any; class DataDispatcher extends EventEmitter2 {
	    register(key: SOCKET, dataHandler: Handler): void;
	    unregister(key: SOCKET, dataHandler: Handler): void;
	    onDataArrived(data: string): Promise<any[][]>;
	} const _default: DataDispatcher;
	export default _default;

}
declare module 'sdk/component/DataDispatcher' {
	import dataDispatcher from 'sdk/component/DataDispatcher/dataDispatcher';
	export default dataDispatcher;

}
declare module 'sdk/api/ringcentral/extensionInfo' {
	import { PERMISSION } from 'sdk/component/featureFlag/interface';
	import { IResponse } from 'sdk/api/NetworkClient';
	interface ISERVICE_FEATURES {
	    featureName: PERMISSION;
	    enabled: boolean;
	}
	interface IEXTENSION_INFO {
	    'uri': string;
	    'id': number;
	    'extensionNumber': string;
	    'serviceFeatures': ISERVICE_FEATURES[];
	}
	export function fetchServicePermission(): Promise<IResponse<IEXTENSION_INFO>>;
	export {};

}
declare module 'sdk/component/featureFlag/FeatureFlag' {
	import ConfigChangeNotifier from 'sdk/component/featureFlag/configChangeNotifier';
	import { IFlag, BETA_FEATURE } from 'sdk/component/featureFlag/interface';
	import IFlagCalculator from 'sdk/component/featureFlag/FlagCalculator'; type IBETA_FLAG_SOURCE = 'Client_Config' | 'RC_PERMISSION' | 'Split.io_Flag'; class FeatureFlag {
	    private _notifier;
	    private _calculator;
	    private _flags;
	    constructor(_notifier: ConfigChangeNotifier, _calculator: IFlagCalculator);
	    isFeatureEnabled(featureName: BETA_FEATURE): boolean;
	    handleData(flags: IFlag, source?: IBETA_FLAG_SOURCE): void;
	    getServicePermission(): Promise<void>;
	    getFlagValue(key: string): boolean;
	    private _dumpFlags;
	    private _notify;
	    private _saveToStorage;
	    private _getFromStorage;
	}
	export default FeatureFlag;

}
declare module 'sdk/component/featureFlag/featureConfig' {
	import { IFeatureConfig } from 'sdk/component/featureFlag/interface'; const featureConfig: IFeatureConfig;
	export default featureConfig;

}
declare module 'sdk/component/featureFlag' {
	import FeatureFlag from 'sdk/component/featureFlag/FeatureFlag'; const featureFlag: FeatureFlag;
	export default featureFlag;

}
declare module 'sdk/utils/progress' {
	interface IProgressEvent {
	    loaded: number;
	    total: number;
	    lengthComputable: boolean;
	    [prop: string]: any;
	}
	export default class ProgressBar {
	    private _counter;
	    private _step;
	    private _isDone;
	    readonly counter: number;
	    start(): void;
	    update(e: IProgressEvent): void;
	    stop(): void;
	}
	export const progressBar: ProgressBar;
	export {};

}
declare module 'sdk/service/sync/fetchIndexData' {
	import { IndexDataModel } from 'sdk/api/glip/user';
	import { IResponse } from 'sdk/api/NetworkClient'; const fetchInitialData: (currentTime: number) => Promise<IResponse<IndexDataModel>>; const fetchRemainingData: (currentTime: number) => Promise<IResponse<IndexDataModel>>; const fetchIndexData: (timeStamp: string) => Promise<IResponse<IndexDataModel>>;
	export { fetchIndexData, fetchInitialData, fetchRemainingData };

}
declare module 'sdk/service/account/handleData' {
	export interface HandleData {
	    userId?: number;
	    companyId?: number;
	    profileId?: number;
	    clientConfig?: object;
	} const accountHandleData: ({ userId, companyId, profileId, clientConfig }: HandleData) => void;
	export default accountHandleData;

}
declare module 'sdk/service/sync/handleData' {
	import { IndexDataModel } from 'sdk/api/glip/user';
	import { IResponse } from 'sdk/api/NetworkClient'; const handleData: (result: IResponse<IndexDataModel>, shouldSaveScoreboard?: boolean) => Promise<void>;
	export default handleData;

}
declare module 'sdk/service/sync' {
	import BaseService from 'sdk/service/BaseService';
	export default class SyncService extends BaseService {
	    private isLoading;
	    constructor();
	    syncData(): Promise<void>;
	    private _firstLogin;
	    private _sysnIndexData;
	}

}
declare module 'sdk/Sdk' {
	import { NetworkManager } from 'foundation';
	import DaoManager from 'sdk/dao/DaoManager';
	import { AccountManager, ServiceManager } from 'sdk/framework';
	import SyncService from 'sdk/service/sync';
	import { SdkConfig } from 'sdk/types'; class Sdk {
	    daoManager: DaoManager;
	    accountManager: AccountManager;
	    serviceManager: ServiceManager;
	    networkManager: NetworkManager;
	    syncService: SyncService;
	    constructor(daoManager: DaoManager, accountManager: AccountManager, serviceManager: ServiceManager, networkManager: NetworkManager, syncService: SyncService);
	    init(config: SdkConfig): Promise<void>;
	    onLogin(): Promise<void>;
	    onLogout(): Promise<void>;
	    updateNetworkToken(): void;
	    updateServiceStatus(services: string[], isStart: boolean): void;
	}
	export default Sdk;

}
declare module 'sdk/service/uploadLogControl/logUploadManager' {
	 class LogUploadLogManager {
	    private static _instance;
	    static instance(): LogUploadLogManager;
	    doUpload(userInfo: {
	        email: string;
	        userId: string;
	        clientId: string;
	    }, logInfo: object): import("../../../../../../../../../Users/andy.hu/project/Fiji/node_modules/axios").AxiosPromise<any>;
	}
	export default LogUploadLogManager;

}
declare module 'sdk/service/uploadLogControl/logControlManager' {
	 class LogControlManager {
	    private static _instance;
	    private _enabledLog;
	    private _isDebugMode;
	    private _isUploading;
	    private _isOnline;
	    private constructor();
	    static instance(): LogControlManager;
	    setDebugMode(isDebug: boolean): void;
	    enableLog(enable: boolean): void;
	    flush(): Promise<void>;
	    setNetworkState(isOnline: boolean): void;
	    doUpload(): Promise<void>;
	    logIsEmpty(logs: any): boolean;
	    private _getUserInfo;
	    private _updateLogSystemLevel;
	}
	export default LogControlManager;

}
declare module 'sdk/registerConfigs' {
	import { NetworkManager } from 'foundation';
	import { RCAccount } from 'sdk/account';
	import { AutoAuthenticator, RCPasswordAuthenticator, UnifiedLoginAuthenticator } from 'sdk/authenticator';
	import DaoManager from 'sdk/dao/DaoManager';
	import { AccountManager, ServiceManager } from 'sdk/framework';
	import Sdk from 'sdk/Sdk';
	import AccountService from 'sdk/service/account';
	import AuthService from 'sdk/service/auth';
	import CompanyService from 'sdk/service/company';
	import ConfigService from 'sdk/service/config';
	import GroupService from 'sdk/service/group';
	import ItemService from 'sdk/service/item';
	import PersonService from 'sdk/service/person';
	import PostService from 'sdk/service/post';
	import PresenceService from 'sdk/service/presence';
	import ProfileService from 'sdk/service/profile';
	import SearchService from 'sdk/service/search';
	import { SocketManager } from 'sdk/service/SocketManager/SocketManager';
	import StateService from 'sdk/service/state';
	import SyncService from 'sdk/service/sync'; const registerConfigs: {
	    classes: ({
	        name: string;
	        value: typeof RCPasswordAuthenticator;
	        injects?: undefined;
	    } | {
	        name: string;
	        value: typeof AutoAuthenticator;
	        injects: string[];
	    } | {
	        name: string;
	        value: typeof UnifiedLoginAuthenticator;
	        injects?: undefined;
	    } | {
	        name: string;
	        value: typeof RCAccount;
	        injects?: undefined;
	    } | {
	        name: string;
	        value: typeof PostService;
	        injects?: undefined;
	    } | {
	        name: string;
	        value: typeof GroupService;
	        injects?: undefined;
	    } | {
	        name: string;
	        value: typeof CompanyService;
	        injects?: undefined;
	    } | {
	        name: string;
	        value: typeof ItemService;
	        injects?: undefined;
	    } | {
	        name: string;
	        value: typeof PersonService;
	        injects?: undefined;
	    } | {
	        name: string;
	        value: typeof PresenceService;
	        injects?: undefined;
	    } | {
	        name: string;
	        value: typeof ProfileService;
	        injects?: undefined;
	    } | {
	        name: string;
	        value: typeof SearchService;
	        injects?: undefined;
	    } | {
	        name: string;
	        value: typeof StateService;
	        injects?: undefined;
	    } | {
	        name: string;
	        value: typeof ConfigService;
	        injects: string[];
	    } | {
	        name: string;
	        value: typeof AuthService;
	        injects: string[];
	    } | {
	        name: string;
	        value: typeof AccountService;
	        injects?: undefined;
	    } | {
	        name: string;
	        value: typeof SyncService;
	        injects?: undefined;
	    } | {
	        name: string;
	        value: typeof AccountManager;
	        injects: string[];
	    } | {
	        name: string;
	        value: typeof ServiceManager;
	        injects: string[];
	    } | {
	        name: string;
	        value: typeof Sdk;
	        injects: string[];
	    })[];
	    asyncClasses: never[];
	    constants: ({
	        name: string;
	        value: DaoManager;
	    } | {
	        name: string;
	        value: SocketManager;
	    } | {
	        name: string;
	        value: NetworkManager;
	    })[];
	};
	export { registerConfigs };

}
declare module 'sdk/index' {
	import * as service from 'sdk/service';
	import * as dao from 'sdk/dao';
	import * as utils from 'sdk/utils';
	import * as api from 'sdk/api';
	export * from 'sdk/framework';
	export { default as GlipTypeDictionary } from 'sdk/utils/glip-type-dictionary/types';
	export { default as LogControlManager } from 'sdk/service/uploadLogControl/logControlManager'; const sdk: {};
	export { sdk as Sdk };
	export { sdk, service, utils, dao, api };

}
declare module 'sdk/api/__mocks__/api' {
	 const Api: {};
	export default Api;

}
declare module 'sdk/framework/__mocks__/accounts/TestAccount' {
	import { IAuthenticator, AbstractAccount } from 'sdk/framework';
	import { IAuthResponse, IAuthParams } from 'sdk/framework/account';
	interface TestLoginInfo extends IAuthParams {
	    username: string;
	    password: string;
	} class TestAuthenticator implements IAuthenticator {
	    authenticate(loginInfo: TestLoginInfo): Promise<IAuthResponse>;
	} class TestAccount extends AbstractAccount {
	    updateSupportedServices(data: any): Promise<void>;
	    constructor();
	    getAccountType(): string;
	    protected getSupportedServicesByIndexData(indexData: any): string[];
	}
	export default TestAccount;
	export { TestAccount, TestAuthenticator };

}
declare module 'sdk/framework/__mocks__/services/TestService' {
	import { AbstractService } from 'sdk/framework'; class TestService extends AbstractService {
	    protected onStarted(): void;
	    protected onStopped(): void;
	}
	export default TestService;

}
declare module 'sdk/service/windowEventListener' {
	export {};

}
declare module 'sdk/service/SocketManager/__mocks__/socket' {
	/// <reference types="jest" />
	export default class Socket {
	    _subs: object;
	    connect: jest.Mock<{}>;
	    disconnect: jest.Mock<{}>;
	    close: jest.Mock<{}>;
	    open: jest.Mock<{}>;
	    removeAllListeners: jest.Mock<{}>;
	    emit(event: string, props: object): void;
	    on(event: string, callback: Function): void;
	}

}
declare module 'sdk/service/account/clientConfig' {
	 enum EBETA_FLAG {
	    BETA_LOG = 0
	} function isInBeta(flag: EBETA_FLAG): boolean;
	export { EBETA_FLAG, isInBeta };

}
declare module 'sdk/service/auth/models/PhoneNumberAuthPrams' {
	import { IAuthParams } from 'sdk/framework/account/IAuthenticator';
	interface PhoneNumberAuthPrams extends IAuthParams {
	    phonenumber: string;
	    extension: string;
	    password: string;
	}
	export { PhoneNumberAuthPrams };

}
declare module 'string-natural-compare' {
  interface INatureCompare {
    (a: any, b: any): number;
    caseInsensitive: INatureCompare;
  }
  const natureCompare: INatureCompare;
  export = natureCompare;
}
declare module 'sdk' {
	import main = require('sdk/index');
	export = main;
}
