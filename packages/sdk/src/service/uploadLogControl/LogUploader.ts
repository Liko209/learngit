import { LogEntity, mainLogger, HTTP_STATUS_CODE } from 'foundation';
import { ILogUploader } from './consumer';
import AccountService from '../account';
import axios, { AxiosError } from 'axios';
import { AccountUserConfig } from '../../service/account/config';
import { Api } from '../../api';

const DEFAULT_EMAIL = 'service@glip.com';
export class LogUploader implements ILogUploader {
  async upload(logs: LogEntity[]): Promise<void> {
    const userInfo = await this._getUserInfo();
    const message = this.transform(logs);
    const sessionId = logs[0].sessionId;
    const { server, uniqueHttpCollectorCode } = Api.httpConfig.sumologic;
    const postUrl = `${server}${uniqueHttpCollectorCode}`;
    await axios.post(postUrl, message, {
      headers: {
        'X-Sumo-Name': `${userInfo.email}| ${userInfo.userId}| ${sessionId}`,
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
    const { response } = error;
    if (!response) {
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
      return 'retry';
    }
    return 'ignore';
  }

  private async _getUserInfo() {
    const accountService: AccountService = AccountService.getInstance();
    let id;
    let email = DEFAULT_EMAIL;
    try {
      const userConfig = new AccountUserConfig();
      id = userConfig.getGlipUserId();
      email = await accountService.getUserEmail();
    } catch (error) {
      mainLogger.warn(error);
    }
    const userId = id ? id.toString() : '';
    const clientId = accountService.getClientId();
    return {
      email,
      userId,
      clientId,
    };
  }

  private _getLogText(log: LogEntity) {
    const { message = '' } = log;
    return message;
  }
}
