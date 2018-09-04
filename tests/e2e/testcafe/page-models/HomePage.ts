import { ClientFunction } from 'testcafe';
import { BasePage } from './BasePage';

export class GetTokenPage extends BasePage {
  expectUrlParamsIsCorrect(): this {
    return this.chain(async (t) => {
      const getLocation = ClientFunction(() => document.location.href);
      await t.expect(getLocation()).contains('code='); // todo regular
    });
  }

}
