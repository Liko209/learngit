import * as assert from 'assert';

import { RcPlatformSdk } from "./platform";
import { GlipSdk, GlipDb } from "./glip";
import { IUser } from "../models";

export class SdkManager {
  platforms: { [id: string]: RcPlatformSdk } = {};
  glips: { [id: string]: GlipSdk } = {};
  glipDb: GlipDb;

  constructor(
    private platformKey: string,
    private platformSecret: string,
    private platformUrl: string,
    private glipUrl: string,
  ) {
    this.glipDb = new GlipDb();
  }

  private createPlatform(user: IUser) {
    return new RcPlatformSdk(
      this.platformKey, this.platformSecret, this.platformUrl,
      { username: user.company.number, extension: user.extension, password: user.password }
    );
  }

  async getPlatform(user: IUser) {
    assert(user);
    let platform: RcPlatformSdk = this.platforms[user.rcId];
    if (platform === undefined) {
      platform = this.createPlatform(user);
      await platform.init();
      this.platforms[user.rcId] = platform;
    }
    return platform;
  }

  private createGlip(user: IUser) {
    return new GlipSdk(this.glipUrl, this.platform(user), this.glipDb);
  }

  async getGlip(user: IUser) {
    assert(user);
    let glip: GlipSdk = this.glips[user.rcId];
    if (glip === undefined) {
      glip = this.createGlip(user);
      await glip.init();
      this.glips[user.rcId] = glip;
    }
    return glip;
  }

  platform(user: IUser) {
    assert(user);
    let platform: RcPlatformSdk = this.platforms[user.rcId];
    if (platform === undefined) {
      platform = this.createPlatform(user);
      this.platforms[user.rcId] = platform;
    }
    return platform;
  }


  glip(user: IUser) {
    assert(user);
    let glip: GlipSdk = this.glips[user.rcId];
    if (glip === undefined) {
      glip = this.createGlip(user);
      this.glips[user.rcId] = glip;
    }
    return glip;
  }

}
