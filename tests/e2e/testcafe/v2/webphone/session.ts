
import { WebphoneClient } from 'webphone-client'
import { ENV_OPTS, WebphoneConfig } from '../../config';
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

  async init(TTL = WebphoneConfig.TTL, reserved = WebphoneConfig.reserved) {
    console.log(`init session with ${this.env}, ${this.phoneNumber}, ${this.extension}, ${this.password}`);
    const session = await this.webphoneClient.createSession(this.env, this.phoneNumber, this.extension, this.password, TTL, reserved);
    console.log(session);
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
    await this.webphoneClient.makeCall(this.phoneId, this.sessionId, destNumber);
  }

  async close() {
    await this.webphoneClient.closeSession(this.phoneId, this.sessionId);
  }

  async operate(action: string, destNumber?: string) {
    if (destNumber) {
      await this.webphoneClient.remoteOperateSession(this.phoneId, this.sessionId, action, destNumber);
    } else {
      await this.webphoneClient.localOperateSession(this.phoneId, this.sessionId, action);
    }
  }
}