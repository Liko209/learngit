import 'testcafe';
import * as fs from 'fs';
import * as assert from 'assert';
import * as shortid from 'shortid';

import { ClientFunction } from 'testcafe';

export class H {
  static getUserAgent(): Promise<string> {
    return ClientFunction(() => navigator.userAgent)();
  }

  static isElectron(): Promise<boolean> {
    return H.getUserAgent().then(ua => ua.includes('Electron'));
  }

  static isEdge(): Promise<boolean> {
    return H.getUserAgent().then(ua => ua.includes('Edge'));
  }

  static getUtcOffset(): Promise<number> {
    return ClientFunction(() => new Date().getTimezoneOffset())();
  }

  static jsonDump(path: string, object: any) {
    const content = JSON.stringify(object, null, 2);
    fs.writeFileSync(path, content);
  }

  static sleep(time: number): Promise<void> {
    return new Promise<void>((res, rej) => {
      setTimeout(res, time);
    });
  }

  static uuid() {
    return shortid.generate();
  }

  static multilineString(lineNumber: number = 10, prefixText: string = 'lineStart', suffixText: string = 'lineEnd') {
    let lines = '\n'
    for (let i = 1; i < lineNumber + 1; i++) {
      lines += `line${i}\n`;
    }
    return prefixText + lines + suffixText;
  }

  static escapePostText(origin: string) {
    // ref: https://en.wikipedia.org/wiki/Non-breaking_space
    return origin.replace(/ /g, '\u00A0').replace(/$/, '\n');
  }

  static async retryUntilPass(cb: () => Promise<any>, maxRetryTime = 10, retryInterval = 5e2) {
    let i = 0;
    while (true) {
      try {
        await cb();
        break;
      } catch (err) {
        if (i < maxRetryTime && err instanceof assert.AssertionError) {
          i += 1;
          await this.sleep(retryInterval);
        } else {
          throw err;
        }
      }
    }
  }
}
