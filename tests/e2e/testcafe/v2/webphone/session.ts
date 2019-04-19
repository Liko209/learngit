
import { WebphoneClient } from 'webphone-client'
import { ENV_OPTS, WebphoneConfig } from '../../config';
import { H } from '../helpers';
import * as assert from 'assert';

export class WebphoneSession {
  phoneId: string;
  sessionId: string;
  env: string;
  phoneNumber: string;
  password: string;
  extension: string;
  status: string;
  message: string;
  TTL: number;
  occupied: boolean;

  webphoneClient: WebphoneClient;

  constructor(env, phoneNumber, extension, password) {
    this.webphoneClient = new WebphoneClient(ENV_OPTS.WEBPHONE_BASE_URL);
    this.env = env;
    this.phoneNumber = phoneNumber;
    this.extension = extension;
    this.password = password;
  }

  async init(TTL = WebphoneConfig.TTL, reserve = WebphoneConfig.reserve) {
    const session = await this.webphoneClient.createSession(this.env, this.phoneNumber, this.extension, this.password, "webphone", TTL, reserve);
    if (session._id) {
      this.phoneId = session._id;
      this.sessionId = session.sessionId;
      this.TTL = session.TTL;
      this.occupied = session.occupied;
    }
  }

  async update() {
    const session = await this.webphoneClient.getSession(this.phoneId);
    this.status = session.status;
    this.message = session.message;
    this.occupied = session.occupied;
  }

  async preOperate(action: string, always: boolean) {
    await this.webphoneClient.preOperateSession(this.phoneId, this.sessionId, action, always);
  }

  async makeCall(destNumber: string) {
    await H.retryUntilPass(async () => {
      await this.update();
      assert.ok('accepted' != this.status, `webphone status: expect not "accepted", but actual "${this.status}"`);
      assert.ok('invited' != this.status, `webphone status: expect not "invited", but actual "${this.status}"`);
    }, 10, 1e3);
    await this.webphoneClient.makeCall(this.phoneId, this.sessionId, destNumber);
  }

  async close() {
    await this.webphoneClient.closeSession(this.phoneId, this.sessionId);
  }

  async operate(action: string, destNumber?: string) {
    if (destNumber) {
      await this.webphoneClient.operateSession(this.phoneId, this.sessionId, action, destNumber);
    } else {
      await this.webphoneClient.operateSession(this.phoneId, this.sessionId, action);
    }
  }

  async answer() {
    await this.waitForStatus('invited');
    await this.operate('answerCall');
  }

  async decline() {
    await this.waitForStatus('invited');
    await this.operate('decline');
  }

  async hangup() {
    await this.waitForStatus('accepted');
    await this.operate('hangup');
  }

  async waitForStatus(status: string) {
    await H.retryUntilPass(async () => {
      await this.update();
      assert.ok(status == this.status, `webphone status: expect "${status}", but actual "${this.status}"`);
    }, 10, 1e3);
  }

}