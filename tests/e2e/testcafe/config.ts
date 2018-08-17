/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-16 11:29:42
 * Copyright © RingCentral. All rights reserved.
 */

const RC_PLATFORM_APP_KEY = process.env.RC_PLATFORM_APP_KEY;
const RC_PLATFORM_APP_SECRET = process.env.RC_PLATFORM_APP_SECRET;

const SITE_ENV = process.env.SITE_ENV || 'XMN-UP';
const SITE_URL = process.env.SITE_URL || 'https://develop.fiji.gliprc.com/unified-login';

const ENV = {
  'WEB-AQA-XIA': {
    ACCOUNT_POOL_BASE_URL: 'http://xia01-i01-xta02.lab.rcch.ringcentral.com:3303',
    ACCOUNT_POOL_ENV: 'webaqaxia',
    RC_PLATFORM_BASE_URL: 'http://api-webaqa.lab.rcch.ringcentral.com',
    GLIP_SERVER_BASE_URL: 'https://webaqa.asialab.glip.net'
  },
  'GLP-CI2-XMN': {
    ACCOUNT_POOL_BASE_URL: 'http://xia01-i01-xta02.lab.rcch.ringcentral.com:3303',
    ACCOUNT_POOL_ENV: 'glpci2xmn',
    RC_PLATFORM_BASE_URL: 'http://api-glpci2xmn.lab.nordigy.ru',
    GLIP_SERVER_BASE_URL: 'https://aws13-g04-uds03.asialab.glip.net:14204'
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
  }
}[SITE_ENV];


export {
  RC_PLATFORM_APP_KEY,
  RC_PLATFORM_APP_SECRET,
  SITE_ENV,
  SITE_URL,
  ENV,
};
