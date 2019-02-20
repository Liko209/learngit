import { ILogUploader, LogEntity, mainLogger } from 'foundation';
import AccountService from '../account';
import axios from 'axios';
import { UserConfig } from '../../service/account';
import { Api } from '../../api';
import {
  ErrorParserHolder,
  JError,
  ERROR_TYPES,
  ERROR_CODES_NETWORK,
} from '../../error';

const DEFAULT_EMAIL = 'service@glip.com';
export class LogUploader implements ILogUploader {
  async upload(logs: LogEntity[]): Promise<void> {
    const userInfo = await this._getUserInfo();
    const message = this.transform(logs);
    const sessionId = logs[0].sessionId;
    const { server, uniqueHttpCollectorCode } = Api.httpConfig.sumologic;
    const postUrl = `${server}/${uniqueHttpCollectorCode}`;
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

  errorHandler(error: Error) {
    const jError: JError = ErrorParserHolder.getErrorParser().parse(error);
    // detail error types description see sumologic doc
    // https://help.sumologic.com/03Send-Data/Sources/02Sources-for-Hosted-Collectors/HTTP-Source/Troubleshooting-HTTP-Sources
    if (
      jError.isMatch({
        type: ERROR_TYPES.NETWORK,
        codes: [
          ERROR_CODES_NETWORK.NOT_NETWORK,
          ERROR_CODES_NETWORK.UNAUTHORIZED,
          ERROR_CODES_NETWORK.TOO_MANY_REQUESTS,
          ERROR_CODES_NETWORK.SERVICE_UNAVAILABLE,
          ERROR_CODES_NETWORK.GATEWAY_TIMEOUT,
        ],
      })
    ) {
      return 'retry';
    }
    return 'ignore';
  }

  private async _getUserInfo() {
    const accountService: AccountService = AccountService.getInstance();
    const email = (await accountService.getUserEmail()) || DEFAULT_EMAIL;
    let id;
    try {
      id = UserConfig.getCurrentUserId();
    } catch (error) {
      mainLogger.error(error);
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
