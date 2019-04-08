/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-06-08 15:43:47
 */

import { BETA_CONFIG_KEYS } from '../constant';
import { AccountUserConfig } from '../config';

enum EBETA_FLAG {
  BETA_LOG,
  BETA_S3_DIRECT_UPLOADS,
  //   BETA_TELEPHONY_EMAIL,
  //   BETA_TELEPHONY_DOMAIN,
  //   BETA_SMS_EMAIL,
  //   BETA_SMS_DOMAIN,
  //   BETA_RC_ICON_EAMIL,
  //   BETA_RC_ICON_DOMAIN,
  //   BETA_RCV_EMAIL,
  //   BETA_RCV_DOMAIN,
  //   BETA_RCV_EMBEDED_EMAIL,
  //   BETA_RCV_EMBEDED_DOMAIN,
  //   BETA_RCM_EMBEDED_EMAIL,
  //   BETA_RCM_EMBEDED_DOMAIN,
  //   BETA_LAB_EVENT_REMINDER
}

function isInBeta(flag: EBETA_FLAG): boolean {
  switch (flag) {
    case EBETA_FLAG.BETA_LOG:
      return isInBetaList(BETA_CONFIG_KEYS.BETA_ENABLE_LOG);
    case EBETA_FLAG.BETA_S3_DIRECT_UPLOADS:
      return (
        isInBetaList(BETA_CONFIG_KEYS.BETA_S3_DIRECT_UPLOADS) ||
        isBetaOn(BETA_CONFIG_KEYS.BETA_S3_DIRECT_UPLOADS)
      );
    // case EBETA_FLAG.BETA_TELEPHONY_EMAIL:
    //   return isInBetaEmailList('');
    // case EBETA_FLAG.BETA_TELEPHONY_DOMAIN:
    //   return isInBetaDomainList('');
    // case EBETA_FLAG.BETA_SMS_EMAIL:
    //   return isInBetaEmailList('');
    // case EBETA_FLAG.BETA_SMS_DOMAIN:
    //   return isInBetaDomainList('');
    // case EBETA_FLAG.BETA_RC_ICON_EAMIL:
    //   return isInBetaEmailList('');
    // case EBETA_FLAG.BETA_RC_ICON_DOMAIN:
    //   return isInBetaDomainList('');
    // case EBETA_FLAG.BETA_RCV_EMAIL:
    //   return isInBetaEmailList('');
    // case EBETA_FLAG.BETA_RCV_DOMAIN:
    //   return isInBetaDomainList('');
    // case EBETA_FLAG.BETA_RCV_EMBEDED_EMAIL:
    //   return isInBetaEmailList('');
    // case EBETA_FLAG.BETA_RCV_EMBEDED_DOMAIN:
    //   return isInBetaDomainList('');
    // case EBETA_FLAG.BETA_RCM_EMBEDED_EMAIL:
    //   return isInBetaEmailList('');
    // case EBETA_FLAG.BETA_RCM_EMBEDED_DOMAIN:
    //   return isInBetaDomainList('');
    // case EBETA_FLAG.BETA_LAB_EVENT_REMINDER:
    //   return isInBetaEmailList('') || isInBetaDomainList('');
  }

  return false;
}

function isInBetaList(flagName: string): boolean {
  return (
    isInBetaEmailList(`${flagName}_emails`) ||
    isInBetaDomainList(`${flagName}_domains`)
  );
}

function isBetaOn(flagName: string, defaultVal = false): boolean {
  const value: string = getFlagValue(flagName);
  return value ? value === 'true' : defaultVal;
}

function isInBetaEmailList(flagName: string): boolean {
  const list: string = getFlagValue(flagName);
  if (list !== '') {
    const emailsList: string[] = list.split(',');
    const userConfig = new AccountUserConfig();
    const userId: number = userConfig.getGlipUserId();
    if (userId) {
      return emailsList.indexOf(userId.toString()) !== -1;
    }
  }
  return false;
}

function isInBetaDomainList(flagName: string): boolean {
  const list: string = getFlagValue(flagName);
  if (list !== '') {
    const emailsList: string[] = list.split(',');
    const userConfig = new AccountUserConfig();
    const companyId: number = userConfig.getCurrentCompanyId();
    if (companyId) {
      return emailsList.indexOf(companyId.toString()) !== -1;
    }
  }
  return false;
}

function getFlagValue(flagName: string): string {
  const userConfig = new AccountUserConfig();
  const clientConfig = userConfig.getClientConfig();
  if (clientConfig && clientConfig[flagName]) {
    return clientConfig[flagName];
  }
  return '';
}

export { EBETA_FLAG, isInBeta };
