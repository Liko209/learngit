import { BasePage } from './BasePage';
import { Selector } from 'testcafe';

export class EnvironmentSelectionPage extends BasePage {

  get loginButton(): Selector {
    return Selector('button');
  }

  get environmentSelector(): Selector {
    return Selector('select');
  }

  get environmentOption(): Selector {
    return this.environmentSelector.find('option');
  }

  selectEnvironment(environment: string): this {
    return this.chain( t =>
      t
        .click(this.environmentSelector)
        .click(this.environmentOption.withText(environment))
        .expect(this.environmentSelector.value)
        .eql(environment)
    );
  }

  toNextPage(): this {
    return this.chain( t =>
      t.click(this.loginButton)
    );
  }

}
