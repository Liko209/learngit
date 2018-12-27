
import { ILogApi, LogEntity, mainLogger } from 'foundation';
import AccountService from '../account';
import axios from 'axios';

const DEFAULT_EMAIL = 'service@glip.com';
const SPLIT_LINE = '--------------------------------------------\n';
export class LogUploader implements ILogApi {
  async upload(logs: LogEntity[]): Promise<any> {
    const userInfo = await this._getUserInfo();
    const logMsgs = [SPLIT_LINE].concat(logs.map(log => this._getLogText(log)));

    await this._doUpload(userInfo, { logMsgs });
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

  private async _doUpload(
    userInfo: {
      email: string;
      userId: string;
      clientId: string;
    },
    logInfo: object,
  ) {
    await axios({
      method: 'POST',
      url: 'http://10.32.35.26:7988/log/',
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
