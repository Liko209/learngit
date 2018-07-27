const TYPE = {
  9: 'task',
  10: 'file',
  14: 'event',
  17: 'link',
  18: 'note',
  20: 'meeting',
  41: 'conference',
  7058: 'weather'
};

const REPEAT = {
  daily: ', repeating every day',
  weekdaily: ', repeating every weekday',
  weekly: ', repeating every week',
  monthly: ', repeating every month',
  yearly: ', repeating ervery year'
};

const TIMES = {
  daily: 'days',
  weekdaily: 'weekdays',
  weekly: 'weeks',
  monthly: 'months',
  yearly: 'years'
};

const GLOBAL_STORE_DATA = {
  MODIFY_POST_ID: 'actions.modify.post.id',
  CONTACT_LIST: 'contact.list',
  IS_SWITCH: 'conversation.switch'
};

const ACTIONS_TYPE = {
  EDIT: 'edit',
  QUOTE: 'quote'
};

export { TYPE, REPEAT, TIMES, GLOBAL_STORE_DATA, ACTIONS_TYPE };

// https://app.glip.com/api/posts?group_id=6508265478

// var INTEGRATION_LOWER_ID = 7000;

// var typeDictionary = {
//     TYPE_ID_COMPANY: 1,
//     TYPE_ID_GROUP: 2,
//     TYPE_ID_PERSON: 3,
//     TYPE_ID_POST: 4,
//     TYPE_ID_PROJECT: 5,
//     TYPE_ID_TEAM: 6,
//     TYPE_ID_STATE: 7,
//     TYPE_ID_PLUGIN: 8,
//     TYPE_ID_TASK: 9,
//     TYPE_ID_FILE: 10,
//     TYPE_ID_PRESENCE: 11,
//     TYPE_ID_STORED_FILE: 12,
//     TYPE_ID_BUG: 13,
//     TYPE_ID_EVENT: 14,
//     TYPE_ID_PROFILE: 15,
//     TYPE_ID_EMAIL_STATE: 16,
//     TYPE_ID_LINK: 17,
//     TYPE_ID_PAGE: 18,
//     TYPE_ID_ACCOUNT: 19,
//     TYPE_ID_MEETING: 20,
//     TYPE_ID_MEGA_MEETING: 21,
//     TYPE_ID_ADDLIVE_MEETING: 23,
//     TYPE_ID_PAYMENT: 24,
//     TYPE_ID_DO_IMPORT: 25,
//     TYPE_ID_GMAIL_IMPORT: 26,
//     TYPE_ID_INTEGRATION: 27,
//     TYPE_ID_INTEGRATION_ITEM: 28,
//     TYPE_ID_REFERRAL: 29,
//     TYPE_ID_POLL: 30,
//     TYPE_ID_CODE: 31,
//     TYPE_ID_GOOGLE_SIGNON: 32,
//     TYPE_ID_LINKEDIN_SIGNON: 33,
//     TYPE_ID_QUESTION: 34,
//     TYPE_ID_IMPORT_ITEM: 35,
//     TYPE_ID_SLACK_IMPORT: 36,
//     TYPE_ID_HIPCHAT_IMPORT: 37,
//     TYPE_ID_ASANA_IMPORT: 38,
//     TYPE_ID_TRELLO_IMPORT: 39,
//     TYPE_ID_RC_SIGNON: 40,
//     TYPE_ID_CONFERENCE: 41,
//     TYPE_ID_CALL: 42,
//     TYPE_ID_SIP: 43,
//     TYPE_ID_EXPORT: 44,
//     TYPE_ID_INTERACTIVE_MESSAGE_ITEM: 45,
//     TYPE_ID_FLIP2GLIP_EMAIL: 46,
//     TYPE_ID_OUTLOOK_IMPORT: 60,
//     TYPE_ID_RC_PHONE_TAB: 100,
//     TYPE_ID_RC_CALL: 101,
//     TYPE_ID_RC_VOICEMAIL: 102,
//     TYPE_ID_RC_FAX: 103,
//     TYPE_ID_RC_PRESENCE: 104,
//     TYPE_ID_RC_BLOCK: 105,
//     TYPE_ID_RC_SMSES: 106,
//     TYPE_ID_RC_VIDEOS: 107,

//     // NOTE: this is our minimum value for integration types, see Is_Integration_Type() function
//     TYPE_ID_CUSTOM_ITEM: 7000,
//     TYPE_ID_JIRA_ITEM: 7001,
//     TYPE_ID_GITHUB_ITEM: 7002,
//     TYPE_ID_HARVEST_ITEM: 7003,
//     TYPE_ID_STRIPE_ITEM: 7004,
//     TYPE_ID_ZENDESK_ITEM: 7005,
//     TYPE_ID_ASANA_ITEM: 7006,
//     TYPE_ID_BITBUCKET_ITEM: 7007,
//     TYPE_ID_BOX_ITEM: 7008,
//     TYPE_ID_BUGSNAG_ITEM: 7009,
//     TYPE_ID_BUILDBOX_ITEM: 7010,
//     TYPE_ID_CIRCLECI_ITEM: 7011,
//     TYPE_ID_CLOUD66_ITEM: 7012,
//     TYPE_ID_CODESHIP_ITEM: 7013,
//     TYPE_ID_CONCUR_ITEM: 7014,
//     TYPE_ID_CRASHLYTICS_ITEM: 7015,
//     TYPE_ID_DATADOG_ITEM: 7016,
//     TYPE_ID_EXPENSIFY_ITEM: 7017,
//     TYPE_ID_FRESHBOOKS_ITEM: 7018,
//     TYPE_ID_GETSATISFACTION_ITEM: 7019,
//     TYPE_ID_GOSQUARED_ITEM: 7020,
//     TYPE_ID_HANGOUTS_ITEM: 7021,
//     TYPE_ID_HONEYBADGER_ITEM: 7022,
//     TYPE_ID_HUBOT_ITEM: 7023,
//     TYPE_ID_HUBSPOT_ITEM: 7024,
//     TYPE_ID_INSIGHTLY_ITEM: 7025,
//     TYPE_ID_JENKINS_ITEM: 7026,
//     TYPE_ID_LIBRATO_ITEM: 7027,
//     // TYPE_ID_MAGNUM_ITEM: 7028,
//     TYPE_ID_MAILCHIMP_ITEM: 7029,
//     TYPE_ID_MARKETO_ITEM: 7030,
//     TYPE_ID_NAGIOS_ITEM: 7031,
//     // TYPE_ID_NEWRELIC_ITEM: 7032, possible duplicate with 7062
//     TYPE_ID_NINEFOLD_ITEM: 7033,
//     TYPE_ID_ONEDRIVE_ITEM: 7034,
//     TYPE_ID_OPSGENIE_ITEM: 7035,
//     TYPE_ID_PAGERDUTY_ITEM: 7036,
//     TYPE_ID_PAPERTRAIL_ITEM: 7037,
//     TYPE_ID_PHABRICATOR_ITEM: 7038,
//     TYPE_ID_PINGDOM_ITEM: 7039,
//     TYPE_ID_PIVOTALTRACKER_ITEM: 7040,
//     TYPE_ID_QUICKBOOKS_ITEM: 7041,
//     TYPE_ID_REAMAZE_ITEM: 7043,
//     TYPE_ID_ROLLCALL_ITEM: 7044,
//     TYPE_ID_RSS_ITEM: 7045,
//     TYPE_ID_SALESFORCE_ITEM: 7046,
//     TYPE_ID_SCREENHERO_ITEM: 7047,
//     TYPE_ID_SEMAPHORE_ITEM: 7048,
//     TYPE_ID_SENTRY_ITEM: 7049,
//     TYPE_ID_STATUSPAGEIO_ITEM: 7050,
//     TYPE_ID_SUBVERSION_ITEM: 7051,
//     TYPE_ID_SUPPORTFU_ITEM: 7052,
//     TYPE_ID_TRAVIS_ITEM: 7053,
//     TYPE_ID_TRELLO_ITEM: 7054,
//     TYPE_ID_TWITTER_ITEM: 7055,
//     TYPE_ID_USERVOICE_ITEM: 7056,
//     TYPE_ID_VOCUS_ITEM: 7057,
//     TYPE_ID_ZAPIER_ITEM: 7058,
//     TYPE_ID_ZOHO_ITEM: 7059,
//     TYPE_ID_DONEDONE_ITEM: 7060,
//     TYPE_ID_AIRBRAKE_ITEM: 7061,
//     TYPE_ID_NEW_RELIC_ITEM: 7062,
//     TYPE_ID_TRAVIS_CI_ITEM: 7063,
//     TYPE_ID_HEROKU_ITEM: 7064,
//     TYPE_ID_CONFLUENCE_ITEM: 7065,
//     TYPE_ID_SERVICE_NOW_ITEM: 7066,
//     TYPE_ID_RAYGUN_ITEM: 7067,
//     TYPE_ID_MAGNUMCI_ITEM: 7068,
//     TYPE_ID_RUNSCOPE_ITEM: 7070,
//     TYPE_ID_CIRCLE_CI_ITEM: 7073,
//     TYPE_ID_GO_SQUARED_ITEM: 7075,
//     TYPE_ID_OPS_GENIE_ITEM: 7076,
//     TYPE_ID_SUMO_LOGIC_ITEM: 7082,
//     TYPE_ID_APP_SIGNAL_ITEM: 7083,
//     TYPE_ID_USERLIKE_ITEM: 7086,
//     TYPE_ID_DESK_ITEM: 7089,
//     TYPE_ID_VICTOR_OPS_ITEM: 7090,
//     TYPE_ID_GLIPFORCE_ITEM: 7091,
//     TYPE_ID_STATUS_PAGE_ITEM: 7092
// };

// function isIntegrationType(typeId) {
//     return typeId >= INTEGRATION_LOWER_ID;
// }

// function extractTypeId(objectId) {
//     return objectId & 0x1fff;
// }

// (function checkDuplicates() {
//     var keys = Object.keys(typeDictionary);
//     var values = {};

//     keys.forEach(function(key) {
//         var value = typeDictionary[key];
//         if (values[value]) {
//             throw new Error('There are same values on typeDictionary with keys: ' +
//                 values[value] + ', ' + key);
//         }
//         values[value] = key;
//     });
// }());

// if (typeof exports === 'object') {
//     exports.typeDictionary = typeDictionary;
//     exports.isIntegrationType = isIntegrationType;
//     exports.extractTypeId = extractTypeId;
// }
