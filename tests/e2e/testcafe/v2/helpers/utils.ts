import 'testcafe';
import { ClientFunction } from 'testcafe';

export class H {
  static getUserAgent(): Promise<string> {
    return ClientFunction(() => navigator.userAgent)();
  }
}