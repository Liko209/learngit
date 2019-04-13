/*
 * @Author: Paynter Chen
 * @Date: 2019-03-24 11:06:33
 * Copyright © RingCentral. All rights reserved.
 */
import axios, { AxiosError } from 'axios';
import { HTTP_STATUS_CODE, LogEntity, mainLogger } from 'foundation';
import { AccountUserConfig } from '../../module/account/config';

import { Api } from '../../api';
import { Pal } from '../../pal';
import { ILogUploader } from './collectors/consumer';
import { ServiceConfig, ServiceLoader } from '../../module/serviceLoader';
import { AccountService } from 'src/module/account';

function getLogRange(logs: LogEntity[]) {
  return [logs[0].sessionIndex, logs[logs.length - 1].sessionIndex];
}
const DEFAULT_EMAIL = 'service@glip.com';
export class LogUploader implements ILogUploader {
  async upload(logs: LogEntity[]): Promise<void> {
    const userInfo = await this._getUserInfo();
    const message = this.transform(logs);
    const sessionId = logs[0].sessionId;
    const { server, uniqueHttpCollectorCode } = Api.httpConfig.sumologic;
    const postUrl = `${server}${uniqueHttpCollectorCode}`;
    const appVersion =
      (Pal.instance.getApplicationInfo() &&
        Pal.instance.getApplicationInfo().getAppVersion()) ||
      '';
    await axios.post(postUrl, message, {
      headers: {
        'X-Sumo-Name': `${appVersion}| ${userInfo.email}| ${
          userInfo.userId
        }| ${sessionId}`,
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
        HTTP_STATUS_CODE.UNAUTHORIZED,
        HTTP_STATUS_CODE.TOO_MANY_REQUESTS,
        HTTP_STATUS_CODE.SERVICE_UNAVAILABLE,
        HTTP_STATUS_CODE.GATEWAY_TIME_OUT,
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
      ServiceConfig.PERSON_SERVICE,
    );

    let id;
    let email = DEFAULT_EMAIL;
    try {
      const userConfig = new AccountUserConfig();
      id = userConfig.getGlipUserId();
      email = (await accountService.getUserEmail()) || '';
    } catch (error) {
      mainLogger.warn(error);
    }
    const userId = id ? id.toString() : '';
    return {
      email,
      userId,
    };
  }

  private _getLogText(log: LogEntity) {
    const { message = '' } = log;
    return message;
  }
}
