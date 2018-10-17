import * as assert from 'assert';
import Ringcentral from 'ringcentral-js-concise';

import { RcPlatformSdk } from "./platform";
import { GlipSdk } from "./glip";
import { IUser } from "../models";

export class SdkManager {
  platforms: { [id: string]: RcPlatformSdk } = {};
  glips: { [id: string]: GlipSdk } = {};

  constructor(
    private platformKey: string,
    private platformSecret: string,
    private platformUrl: string,
    private glipUrl: string,
  ) {
  }

  private createPlatform(user: IUser) {
    const sdk = new Ringcentral(this.platformKey, this.platformSecret, this.platformUrl);
    return new RcPlatformSdk(sdk, { username: user.company.number, extension: user.extension, password: user.password });
  }

  async getPlatform(user: IUser) {
    assert(user);
    let platform: RcPlatformSdk = this.platforms[user.rcId];
    if (platform === undefined) {
      platform = this.createPlatform(user);
      await platform.auth();
      this.platforms[user.rcId] = platform;
    }
    return platform;
  }

  private async createGlip(user: IUser) {
    return new GlipSdk(this.glipUrl, await this.getPlatform(user));
  }

  async getGlip(user: IUser) {
    assert(user);
    let glip: GlipSdk = this.glips[user.rcId];
    if (glip === undefined) {
      glip = await this.createGlip(user);
      this.glips[user.rcId] = glip;
    }
    return glip
  }
}
