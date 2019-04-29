/*
 * @Author: Paynter Chen
 * @Date: 2019-03-24 11:06:33
 * Copyright © RingCentral. All rights reserved.
 */
import axios, { AxiosError } from 'axios';
import { RESPONSE_STATUS_CODE, LogEntity, mainLogger } from 'foundation';
import { Api } from 'sdk/api';
import { Pal } from 'sdk/pal';
import { ILogUploader } from './consumer';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { AccountService } from 'sdk/module/account';

const DEFAULT_EMAIL = 'service@glip.com';
export class LogUploader implements ILogUploader {
  async upload(logs: LogEntity[]): Promise<void> {
    const userInfo = await this._getUserInfo();
    const message = this.transform(logs);
    const sessionId = logs[0].sessionId;
    const { server, uniqueHttpCollectorCode } = Api.httpConfig.sumologic;
    const postUrl = `${server}${uniqueHttpCollectorCode}`;
    const { email = DEFAULT_EMAIL, userId = '' } = userInfo;
    const {
      appVersion = '',
      platform = '',
      os = '',
      env = '',
      browser = '',
    } = Pal.instance.getApplicationInfo();
    await axios.post(postUrl, message, {
      headers: {
        'X-Sumo-Name': `${platform}/${appVersion}/${browser}/${os}/${env}/${email}/${userId}/${sessionId}`,
        'Content-Type': 'application/json',
      },
    });
  }

  transform(logs: LogEntity[]) {
    return logs.map(log => this._getLogText(log)).join('\n');
  }

  errorHandler(error: AxiosError) {
    // detail error types description see sumologic doc
    // https://help.sumologic.com/03Send-Data/Sources/02Sources-for-Hosted-Collectors/HTTP-Source/Troubleshooting-HTTP-Sources
    mainLogger.debug('Log upload fail', error);
    const { response } = error;
    if (!response) {
      mainLogger.debug('Log errorHandler: abortAll');
      return 'abortAll';
    }
    if (
      [
        RESPONSE_STATUS_CODE.UNAUTHORIZED,
        RESPONSE_STATUS_CODE.TOO_MANY_REQUESTS,
        RESPONSE_STATUS_CODE.SERVICE_UNAVAILABLE,
        RESPONSE_STATUS_CODE.GATEWAY_TIME_OUT,
      ].includes(response.status)
    ) {
      mainLogger.debug('Log errorHandler: retry');
      return 'retry';
    }
    mainLogger.debug('Log errorHandler: ignore=>retry');
    Pal.instance.getErrorReporter() &&
      Pal.instance.getErrorReporter().report(error);
    return 'retry';
  }

  private async _getUserInfo() {
    const accountService = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    );
    let userInfo;
    try {
      userInfo = await accountService.getCurrentUserInfo();
    } catch (error) {
      mainLogger.debug('getUserInfo fail', error);
    }
    const { email = DEFAULT_EMAIL, id = '' } = userInfo || {};
    return {
      email,
      userId: id,
    };
  }

  private _getLogText(log: LogEntity) {
    const { message = '' } = log;
    return message;
  }
}
