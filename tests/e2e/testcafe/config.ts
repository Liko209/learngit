function parseArgs(argsString: string) {
  return argsString.split(',').filter(Boolean).map(s=>s.trim());
}

const SITE_ENV = process.env.SITE_ENV || 'XMN-UP';
const SITE_URL = process.env.SITE_URL || 'https://develop.fiji.gliprc.com/unified-login';
const FIXTURES = parseArgs(process.env.FIXTURES || `${__dirname}/fixtures/*`);
const BROWSERS = parseArgs(process.env.BROWSERS || 'chrome');
const INCLUDE_TAGS = parseArgs(process.env.INCLUDE_TAGS || '');
const EXCLUDE_TAGS = parseArgs(process.env.EXCLUDE_TAGS || '');

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
  SITE_ENV,
  SITE_URL,
  ENV,

  FIXTURES,
  BROWSERS,
  INCLUDE_TAGS,
  EXCLUDE_TAGS,
};
