/*
 * @Author: doyle.wu
 * @Date: 2019-05-22 15:25:15
 */
import * as os from 'os';
import * as fs from 'fs';
import * as plist from 'plist';
import { ClientFunction } from 'testcafe';
import { VersionInfo } from '../models';
import { Config } from '../config';

const _clearLocalStorage = ClientFunction((database) => {
  return localStorage.clear();
});

const _clearSessionStorage = ClientFunction((database) => {
  return sessionStorage.clear();
});

const _deleteAllIndexedDb = ClientFunction((database) => {
  return new Promise((resolve) => {
    let request = indexedDB.deleteDatabase(database);
    request.onerror = resolve;
    request.onsuccess = resolve;
  });
});

const _getNavigator = ClientFunction(() => {
  const { appName,
    appVersion,
    appCodeName,
    userAgent } = navigator;
  return {
    appName,
    appVersion,
    appCodeName,
    userAgent
  };
});

class Browser {
  private t: TestController;
  private boundClearLocalStorage;
  private boundClearSessionStorage;
  private boundDeleteAllIndexedDb;
  private boundGetNavigator;

  constructor(t: TestController) {
    this.t = t;
    this.boundClearLocalStorage = _clearLocalStorage.with({ boundTestRun: this.t });
    this.boundClearSessionStorage = _clearSessionStorage.with({ boundTestRun: this.t });
    this.boundDeleteAllIndexedDb = _deleteAllIndexedDb.with({ boundTestRun: this.t });
    this.boundGetNavigator = _getNavigator.with({ boundTestRun: this.t });
  }

  get name(): string {
    return "other";
  }

  async deleteAllCache(): Promise<void> {
    await this.t.navigateTo(Config.jupiterHost);

    await this.boundClearLocalStorage();
    await this.boundClearSessionStorage();

    await this.t.navigateTo(Config.jupiterHost);

    const databases = ["Glip", "Log"];
    for (let database of databases) {
      await this.boundDeleteAllIndexedDb(database);
    }
  }

  async getVersionInfo(version: string): Promise<VersionInfo> {
    const info: VersionInfo = new VersionInfo();

    const osType = os.type();
    try {
      if (osType.toLocaleLowerCase() === 'darwin') {
        let versionInfo = plist.parse(fs.readFileSync("/System/Library/CoreServices/SystemVersion.plist", "utf-8"));
        info.osInfo = `${versionInfo.ProductName}-${versionInfo.ProductVersion}`.replace(/\s/g, '-').replace(/\./g, '_');
      }
    } finally {
      if (!info.osInfo) {
        info.osInfo = `${osType}-${os.release()}`.replace(/\s/g, '-').replace(/\./g, '_');
      }
    }

    let jupiterVersion = version;
    if (jupiterVersion.startsWith("Version: ")) {
      jupiterVersion = jupiterVersion.substring("Version: ".length);
    }

    info.platform = "Web";
    info.jupiterVersion = jupiterVersion;
    info.browser = this.name;

    const _name = this.name.toLowerCase();
    const userAgent = (await this.boundGetNavigator()).userAgent;
    info.appVersion = userAgent;

    const arr = userAgent.split(' ');
    for (let item of arr) {
      if (item.toLowerCase().startsWith(_name)) {
        info.appVersion = [this.name, item.substring(_name.length + 1)].join('-');
        break;
      }
    }

    return info;
  }

  async maximizeWindow(): Promise<void> {
    await this.t.maximizeWindow();
  }
}

export {
  Browser
}
