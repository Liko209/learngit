import { ILogApi, LogEntity, mainLogger } from 'foundation';
import AccountService from '../account';
import axios from 'axios';
import { UserConfig } from '../../service/account';
import { Api } from '../../api';

const DEFAULT_EMAIL = 'service@glip.com';
export class LogUploader implements ILogApi {
  async upload(logs: LogEntity[]): Promise<any> {
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
