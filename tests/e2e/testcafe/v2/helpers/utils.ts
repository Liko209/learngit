import 'testcafe';
import * as fs from 'fs';
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
}
