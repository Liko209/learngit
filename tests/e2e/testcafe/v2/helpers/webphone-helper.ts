
import 'testcafe';
import { WebphoneSession } from 'webphone-client';
import { IUser } from '../models';
import { ENV_OPTS } from '../../config';

export class WebphoneHelper {

  constructor(private t: TestController) {
    this.sessions = this.sessions || [];
  }

  set sessions(sessions: WebphoneSession[]) {
    this.t.ctx.__webphoneSessions = sessions;
  }

  get sessions(): WebphoneSession[] {
    return this.t.ctx.__webphoneSessions;
  }

  async withSession(user: IUser, cb: (session: WebphoneSession) => Promise<any>) {
    const webphoneRequest = {phoneNumber: user.company.number, extension: user.extension, password: user.password};
    const session = new WebphoneSession(ENV_OPTS.WEBPHONE_BASE_URL, ENV_OPTS.WEBPHONE_ENV, webphoneRequest);
    try {
      await session.init();
      await cb(session);
    } finally {
      await session.close();
    }
  }

  async newWebphoneSession(user: IUser) {
    const webphoneRequest = {phoneNumber: user.company.number, extension: user.extension, password: user.password};
    const session = new WebphoneSession(ENV_OPTS.WEBPHONE_BASE_URL, ENV_OPTS.WEBPHONE_ENV, webphoneRequest);
    this.sessions.push(session);
    await session.init();
    return session;
  }

  async tearDown() {
    for (const session of this.sessions) {
      try {
        await session.close();
      } catch (e) { }
    }
  }
}