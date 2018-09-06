import { ClientFunction } from 'testcafe';
import { BasePage } from '..';

export class TokenGetterPage extends BasePage {
  expectUrlParamsIsCorrect(): this {
    return this.chain(async (t) => {
      const getLocation = ClientFunction(() => document.location.href);
      await t.expect(getLocation()).contains('state=');
    });
  }

}
