import 'testcafe';
import { ClientFunction } from 'testcafe';

export class H {
  static getUserAgent(): Promise<string> {
    return ClientFunction(() => navigator.userAgent)();
  }

  static isElectron(): Promise<boolean> {
    return H.getUserAgent().then(ua => ua.includes('Electron'));
  }
}
