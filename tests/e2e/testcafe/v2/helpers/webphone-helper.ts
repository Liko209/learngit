
import 'testcafe';
import * as assert from 'assert';
import { WebphoneSession } from '../webphone/session';
import { IUser } from '../models';
import { ENV_OPTS } from '../../config';

export class WebphoneHelper {

  constructor(private t: TestController) {
    this.sessions = [];
  }

  set sessions(sessions: WebphoneSession[]) {
    this.t.ctx.__webphoneSessions = sessions;
  }

  get sessions(): WebphoneSession[] {
    return this.t.ctx.__webphoneSessions;
  }

  async withSession(user: IUser, cb: (session: WebphoneSession) => Promise<any>) {
    const session = new WebphoneSession(ENV_OPTS.WEBPHONE_ENV, user.company.number, user.extension, user.password);
    try {
      await session.init();
      await cb(session);
    } finally {
      await session.close();
    }
  }

  async newWebphoneSession(user: IUser) {
    const session = new WebphoneSession(ENV_OPTS.WEBPHONE_ENV, user.company.number, user.extension, user.password);
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