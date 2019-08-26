/*
 * @Author: Paynter Chen
 * @Date: 2019-03-24 11:06:33
 * Copyright © RingCentral. All rights reserved.
 */
import axios, { AxiosError, AxiosResponse } from 'axios';
import { LogEntity, mainLogger } from 'foundation/log';
import { RESPONSE_STATUS_CODE } from 'foundation/network';
import { Api } from 'sdk/api';
import { Pal } from 'sdk/pal';
import { ILogUploader } from './consumer';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { AccountService } from 'sdk/module/account';
import { extractLogMessageLine, getClientId } from './utils';
import { ILogChunkSplitStrategy } from './types';
import { ErrorChunkStrategy } from './ErrorChunkStrategy';
import pako from 'pako';
import 'sendbeacon-polyfill';

const DEFAULT_EMAIL = 'service@glip.com';
const EMERGENCY_MODE_MAX_SIZE = 2 ** 16;
export class LogUploader implements ILogUploader {
  constructor(private _chunkSplitStrategy?: ILogChunkSplitStrategy) {
    if (!this._chunkSplitStrategy) {
      this._chunkSplitStrategy = new ErrorChunkStrategy();
    }
  }
  async upload(logs: LogEntity[], emergencyMode?: boolean): Promise<void> {
    const userInfo = await this._getUserInfo();
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
    const host = window.location.host;
    const headers = {
      'Content-Encoding': 'deflate',
      'X-Sumo-Name': `${platform}/${appVersion}/${browser}/${os}/${env}/${email}/${userId}/${sessionId}/${host}`,
      'Content-Type': 'application/json',
    };
    if (emergencyMode) {
      const emergencyEntity = {
        headers,
        url: postUrl,
        content: '',
      };

      const messages = this._chunkSplitStrategy!.split(
        logs,
        EMERGENCY_MODE_MAX_SIZE - JSON.stringify(emergencyEntity).length,
      );
      const combineMessage = this._combineAndCompressMessageWithLimit(
        messages,
        EMERGENCY_MODE_MAX_SIZE,
      );
      window.navigator.sendBeacon(
        '/log/sumologic',
        JSON.stringify({ ...emergencyEntity, content: combineMessage }),
      );
    } else {
      await axios.post(postUrl, this._zipMessage(this.transform(logs)), {
        headers,
      });
    }
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
    if (this._canRetry(response)) {
      mainLogger.debug('Log errorHandler: retry');
      return 'retry';
    }
    mainLogger.debug('Log errorHandler: ignore=>retry');
    Pal.instance.getErrorReporter() &&
      Pal.instance.getErrorReporter().report(error);
    return 'retry';
  }

  transform(logs: LogEntity[]) {
    return logs.map(extractLogMessageLine).join('');
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
    const { email = DEFAULT_EMAIL, id = getClientId() } = userInfo || {};
    return {
      email,
      userId: id,
    };
  }

  private _canRetry(response: AxiosResponse) {
    return [
      RESPONSE_STATUS_CODE.TOO_MANY_REQUESTS,
      RESPONSE_STATUS_CODE.SERVICE_UNAVAILABLE,
      RESPONSE_STATUS_CODE.GATEWAY_TIME_OUT,
    ].includes(response.status);
  }

  private _zipMessage(message: string) {
    return pako.deflate(message, {
      level: 9,
    });
  }

  private _zipAndBase64(message: string) {
    const zipMessage = this._zipMessage(message);
    return btoa(String.fromCharCode.apply(null, zipMessage));
  }

  private _combineAndCompressMessageWithLimit(
    messages: string[],
    limit: number,
  ) {
    let combineMessage = '';
    let lastBase64String = '';
    for (let index = 0; index < messages.length; index++) {
      const message = messages[index];
      const tempMessage = `${combineMessage}${message}`;
      const base64String = this._zipAndBase64(tempMessage);
      if (base64String.length <= limit) {
        if (index + 1 < messages.length) {
          lastBase64String = base64String;
          combineMessage += message;
        } else {
          return base64String;
        }
      } else {
        return lastBase64String;
      }
    }
    return lastBase64String;
  }
}
