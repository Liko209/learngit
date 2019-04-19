
import 'testcafe';
import * as assert from 'assert';
import { WebphoneSession } from '../webphone/session';
import { IUser } from '../models';
import { ENV_OPTS } from '../../config';

export class WebphoneHelper {

  constructor(private t: TestController) { }
  sessions: { [numberWithExt: string]: WebphoneSession } = {};

  async webphone(user: IUser) {
    assert(user);
    let phoneNumber = user.company.number;
    const sessionKey = `${phoneNumber}#${user.extension}`
    let session: WebphoneSession = this.sessions[sessionKey];
    if (session === undefined) {
      session = new WebphoneSession(ENV_OPTS.WEBPHONE_ENV, phoneNumber, user.extension, user.password);
      await session.init();
      this.sessions[sessionKey] = session;
    }
    return session;
  }

  async withSession(sessions: WebphoneSession[] | WebphoneSession, cb: (sessions?) => Promise<any>) {
    try {
      const ret = await cb(sessions);
      return ret;
    } catch (error) {
      throw error;
    } finally {
      let allSessions: WebphoneSession[] = [].concat(sessions);
      for (const session of allSessions) {
        if (session) {
          try {
            await session.close()
          } catch (error) {
            throw error;
          }
        }
      }
    }
  }
}