
import { ILogApi, LogEntity, mainLogger } from 'foundation';
import AccountService from '../account';
import axios from 'axios';
const DEFAULT_EMAIL = 'service@glip.com';

export class LogUploader implements ILogApi {
  async upload(logs: LogEntity[]): Promise<any> {
    const userInfo = await this._getUserInfo();
    const logMsgs = logs.map(log => this._getLogText(log));
    const sessionId = logs[0].sessionId;
    await this.doUpload(userInfo, { [sessionId]: logMsgs });
  }

  private async _getUserInfo() {
    const accountService: AccountService = AccountService.getInstance();
    const email = (await accountService.getUserEmail()) || DEFAULT_EMAIL;
    let id;
    try {
      id = accountService.getCurrentUserId();
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

  async doUpload(
    userInfo: {
      email: string;
      userId: string;
      clientId: string;
    },
    logInfo: object,
  ) {
    await axios({
      method: 'post',
      url: 'https://fijilog.lab.nordigy.ru/log/',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
        'Access-Control-Allow-Headers': 'Origin,X-Requested-With,Content-Type,Accept,Authorization,User-Agent,Access-Control-Allow-Origin,Access-Control-Allow-Methods,Access-Control-Allow-Headers',
      },
      data: { userInfo, logInfo },
    });
  }

  private _getLogText(log: LogEntity) {
    if (log.tags) {
      return `${log.tags.join(' ')} ${log.message}`;
    }
    return log.message;
  }
}
