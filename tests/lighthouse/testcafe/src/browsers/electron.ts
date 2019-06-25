/*
 * @Author: doyle.wu
 * @Date: 2019-05-23 08:51:30
 */
import { Browser } from './browser';
import { VersionInfo } from '../models';

class Electron extends Browser {

  constructor(t: TestController) {
    super(t);
  }

  get name(): string {
    return "Electron";
  }

  async getVersionInfo(version: string): Promise<VersionInfo> {
    const info = await super.getVersionInfo(version);
    info.platform = "DT";
    let arr = info.jupiterVersion.split(' ');

    if (arr.length > 1) {
      info.jupiterVersion = [arr[0], '-E', arr[4]].join('');
      info.appVersion = ['Electron-', arr[2]].join('');
    }

    return info;
  }

  async maximizeWindow(): Promise<void> {
  }
}

export {
  Electron
}
