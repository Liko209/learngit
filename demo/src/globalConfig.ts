import configs from './configs.json';
import { service } from 'sdk';

const { ConfigService } = service;
// Replace ${deployHost} with real deployHost
const deployHost = `${window.location.protocol}//${window.location.hostname}${
  window.location.port ? `:${window.location.port}` : ''
  }`;

const globalConfig = buildConfig(configs, { deployHost });

function buildConfig(conf: any, variables: any) {
  let str = JSON.stringify(conf);

  // Replace variables
  Object.keys(variables).forEach((key: string) => {
    const re = new RegExp('\\$\\{' + key + '\\}', 'g');
    str = str.replace(re, variables[key]);
  });

  return JSON.parse(str);
}

// Patrice,Fred,Lip,Steve
const betaUserList = [
  '6503752279',
  '6504584431',
  '6502273799',
  '6502125244',
  '6506185567',
];
const betaUserIdList = [
  '731217923',
  '731234307',
  '2266292227',
  '1394810883',
  '1357897731',
  '22103719939',
];
const configService: ConfigService = ConfigService.getInstance();
const env = configService.getEnv() || 'XMN-Stable';
const envConfig = globalConfig[env];
export { env, envConfig, globalConfig, betaUserList, betaUserIdList };
