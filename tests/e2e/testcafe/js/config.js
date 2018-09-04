"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-16 11:29:42
 * Copyright © RingCentral. All rights reserved.
 */
var dotenv = require("dotenv");
var utils_1 = require("./libs/utils");
dotenv.config();
var APP_ROOT = __dirname;
exports.APP_ROOT = APP_ROOT;
console.log(APP_ROOT);
var RC_PLATFORM_APP_KEY = process.env.RC_PLATFORM_APP_KEY || '';
exports.RC_PLATFORM_APP_KEY = RC_PLATFORM_APP_KEY;
var RC_PLATFORM_APP_SECRET = process.env.RC_PLATFORM_APP_SECRET || '';
exports.RC_PLATFORM_APP_SECRET = RC_PLATFORM_APP_SECRET;
var SITE_ENV = process.env.SITE_ENV || 'XMN-UP';
exports.SITE_ENV = SITE_ENV;
var SITE_URL = process.env.SITE_URL || 'http://localhost:3000/unified-login';
exports.SITE_URL = SITE_URL;
var ENV = {
    'WEB-AQA-XIA': {
        ACCOUNT_POOL_BASE_URL: 'http://xia01-i01-xta02.lab.rcch.ringcentral.com:3303',
        ACCOUNT_POOL_ENV: 'webaqaxia',
        RC_PLATFORM_BASE_URL: 'http://api-webaqa.lab.rcch.ringcentral.com',
        GLIP_SERVER_BASE_URL: 'https://webaqa.asialab.glip.net',
    },
    'GLP-CI2-XMN': {
        ACCOUNT_POOL_BASE_URL: 'http://xia01-i01-xta02.lab.rcch.ringcentral.com:3303',
        ACCOUNT_POOL_ENV: 'glpci2xmn',
        RC_PLATFORM_BASE_URL: 'http://api-glpci2xmn.lab.nordigy.ru',
        GLIP_SERVER_BASE_URL: 'https://aws13-g04-uds03.asialab.glip.net:14204',
    },
    'XMN-Stable': {
        ACCOUNT_POOL_BASE_URL: 'http://xia01-i01-xta02.lab.rcch.ringcentral.com:3303',
        ACCOUNT_POOL_ENV: 'xmn-lab-xiauppod1',
        RC_PLATFORM_BASE_URL: 'https://api-up.lab.rcch.ringcentral.com',
        GLIP_SERVER_BASE_URL: 'https://aws13-g04-uds01.asialab.glip.net:23304',
    },
    'XMN-UP': {
        ACCOUNT_POOL_BASE_URL: 'http://xia01-i01-xta03.lab.rcch.ringcentral.com:3303',
        ACCOUNT_POOL_ENV: 'xmn-up',
        RC_PLATFORM_BASE_URL: 'https://api-xmnup.lab.nordigy.ru',
        GLIP_SERVER_BASE_URL: 'https://xmnup.asialab.glip.net',
    },
}[SITE_ENV];
exports.ENV = ENV;
var SDK_ENV = {
    default: {
        rc: {
            server: 'https://platform.ringcentral.com',
            apiPlatform: '/restapi',
            clientId: 'FVKGRbLRTxGxPempqg5f9g',
            clientSecret: 'bkUvnRtBQeCLi2n3EEwczQqv-HRcJmRbG4ec4pHI9wiQ',
            redirectUri: 'glip://rclogin',
        },
        glip2: {
            server: 'https://platform.ringcentral.com',
            apiPlatform: '/restapi',
            clientId: 'dQPxFL6KTWWnolcs74LM4Q',
            clientSecret: 'TT0X369AQ_q8-rUaT8NGzAg5KP_VrFSaGctmkvb4bNEQ',
            redirectUri: '${deployHost}/unified-login/',
            brandId: 1210,
        },
        glip: {
            server: 'https://app.glip.com',
            apiPlatform: '/api',
        },
        glip_desktop: {
            server: 'https://app.glip.com',
            apiPlatformVersion: 'v1.0',
            apiPlatform: '/desktop',
        },
        upload: {
            server: 'https://api.glip.com',
            apiPlatform: '',
        },
    },
    Chris_sandbox: {
        rc: {
            server: 'https://api-glpdevxmn.lab.nordigy.ru',
            apiPlatform: '/restapi',
            clientId: 'FVKGRbLRTxGxPempqg5f9g',
            clientSecret: 'bkUvnRtBQeCLi2n3EEwczQqv-HRcJmRbG4ec4pHI9wiQ',
            redirectUri: 'glip://rclogin',
        },
        glip2: {
            server: 'https://api-glpdevxmn.lab.nordigy.ru',
            apiPlatform: '/restapi',
            clientId: 'FVKGRbLRTxGxPempqg5f9g',
            clientSecret: 'bkUvnRtBQeCLi2n3EEwczQqv-HRcJmRbG4ec4pHI9wiQ',
            redirectUri: '${deployHost}/unified-login/',
            brandId: 1210,
        },
        glip: {
            server: 'https://aws13-g04-uds02.asialab.glip.net:11904',
            apiPlatform: '/api',
        },
        glip_desktop: {
            server: 'https://aws13-g04-uds02.asialab.glip.net:11904',
            apiPlatformVersion: 'v1.0',
            apiPlatform: '/desktop',
        },
        upload: {
            server: 'https://aws13-g04-uds02.asialab.glip.net:11906',
            apiPlatform: '',
        },
    },
    production: {
        rc: {
            server: 'https://platform.ringcentral.com',
            apiPlatform: '/restapi',
            clientId: 'FVKGRbLRTxGxPempqg5f9g',
            clientSecret: 'bkUvnRtBQeCLi2n3EEwczQqv-HRcJmRbG4ec4pHI9wiQ',
            redirectUri: 'glip://rclogin',
        },
        glip2: {
            server: 'https://platform.ringcentral.com',
            apiPlatform: '/restapi',
            clientId: 'dQPxFL6KTWWnolcs74LM4Q',
            clientSecret: 'TT0X369AQ_q8-rUaT8NGzAg5KP_VrFSaGctmkvb4bNEQ',
            redirectUri: '${deployHost}/unified-login/',
            brandId: 1210,
        },
        glip: {
            server: 'https://app.glip.com',
            apiPlatform: '/api',
        },
        glip_desktop: {
            server: 'https://app.glip.com',
            apiPlatformVersion: 'v1.0',
            apiPlatform: '/desktop',
        },
        upload: {
            server: 'https://api.glip.com',
            apiPlatform: '',
        },
    },
    'GLP-CI2-XMN': {
        api: {
            server: 'https://api-glpci2xmn.lab.nordigy.ru',
            apiPlatform: '/restapi',
            clientId: 'FVKGRbLRTxGxPempqg5f9g',
            clientSecret: 'bkUvnRtBQeCLi2n3EEwczQqv-HRcJmRbG4ec4pHI9wiQ',
            redirectUri: 'glip://rclogin',
        },
        glip2: {
            server: 'https://api-glpci2xmn.lab.nordigy.ru',
            apiPlatform: '/restapi',
            clientId: 'FVKGRbLRTxGxPempqg5f9g',
            clientSecret: 'bkUvnRtBQeCLi2n3EEwczQqv-HRcJmRbG4ec4pHI9wiQ',
            redirectUri: '${deployHost}/unified-login/',
            brandId: 1210,
        },
        glip: {
            server: 'https://aws13-g04-uds03.asialab.glip.net:14204',
            apiPlatform: '/api',
        },
        glip_desktop: {
            server: 'https://aws13-g04-uds03.asialab.glip.net:14204',
            apiPlatformVersion: 'v1.0',
            apiPlatform: '/desktop',
        },
        upload: {
            server: 'https://api.glip.com',
            apiPlatform: '',
        },
    },
    'WEB-AQA-XIA': {
        rc: {
            server: 'https://api-webaqa.lab.rcch.ringcentral.com',
            apiPlatform: '/restapi',
            clientId: 'FVKGRbLRTxGxPempqg5f9g',
            clientSecret: 'bkUvnRtBQeCLi2n3EEwczQqv-HRcJmRbG4ec4pHI9wiQ',
            redirectUri: 'glip://rclogin',
        },
        glip2: {
            server: 'https://api-webaqa.lab.rcch.ringcentral.com',
            apiPlatform: '/restapi',
            clientId: 'FVKGRbLRTxGxPempqg5f9g',
            clientSecret: 'bkUvnRtBQeCLi2n3EEwczQqv-HRcJmRbG4ec4pHI9wiQ',
            redirectUri: '${deployHost}/unified-login/',
            brandId: 1210,
        },
        glip: {
            server: 'https://webaqa.asialab.glip.net',
            apiPlatform: '/api',
        },
        glip_desktop: {
            server: 'https://webaqa.asialab.glip.net',
            apiPlatformVersion: 'v1.0',
            apiPlatform: '/desktop',
        },
        upload: {
            server: 'https://api.glip.com',
            apiPlatform: '',
        },
    },
    'XMN-Stable': {
        rc: {
            server: 'https://api-up.lab.rcch.ringcentral.com',
            apiPlatform: '/restapi',
            clientId: 'FVKGRbLRTxGxPempqg5f9g',
            clientSecret: 'bkUvnRtBQeCLi2n3EEwczQqv-HRcJmRbG4ec4pHI9wiQ',
            redirectUri: 'glip://rclogin',
        },
        glip2: {
            server: 'https://api-up.lab.rcch.ringcentral.com',
            apiPlatform: '/restapi',
            clientId: 'FVKGRbLRTxGxPempqg5f9g',
            clientSecret: 'bkUvnRtBQeCLi2n3EEwczQqv-HRcJmRbG4ec4pHI9wiQ',
            redirectUri: '${deployHost}/unified-login/',
            brandId: 1210,
        },
        glip_desktop: {
            server: 'https://xia01.asialab.glip.net',
            apiPlatformVersion: 'v1.0',
            apiPlatform: '/desktop',
        },
        glip: {
            server: 'https://xia01.asialab.glip.net',
            apiPlatform: '/api',
        },
        upload: {
            server: 'https://xia01.asialab.glip.net:8443',
            apiPlatform: '',
        },
    },
    'XMN-UP': {
        rc: {
            server: 'https://api-xmnup.lab.nordigy.ru',
            apiPlatform: '/restapi',
            clientId: 'FVKGRbLRTxGxPempqg5f9g',
            clientSecret: 'bkUvnRtBQeCLi2n3EEwczQqv-HRcJmRbG4ec4pHI9wiQ',
            redirectUri: 'glip://rclogin',
        },
        glip2: {
            server: 'https://api-xmnup.lab.nordigy.ru',
            apiPlatform: '/restapi',
            clientId: 'FVKGRbLRTxGxPempqg5f9g',
            clientSecret: 'bkUvnRtBQeCLi2n3EEwczQqv-HRcJmRbG4ec4pHI9wiQ',
            redirectUri: '${deployHost}/unified-login/',
            brandId: 1210,
        },
        glip: {
            server: 'https://xmnup.asialab.glip.net',
            apiPlatform: '/api',
        },
        glip_desktop: {
            server: 'https://xmnup.asialab.glip.net',
            apiPlatformVersion: 'v1.0',
            apiPlatform: '/desktop',
        },
        upload: {
            server: 'https://xmnup.asialab.glip.net:8443',
            apiPlatform: '',
        },
    },
}[SITE_ENV];
exports.SDK_ENV = SDK_ENV;
var EXECUTION_STRATEGIES_HELPER = new utils_1.ExecutionStrategiesHelper(process.env.BRANCH || '', process.env.ACTION || '');
exports.EXECUTION_STRATEGIES_HELPER = EXECUTION_STRATEGIES_HELPER;
