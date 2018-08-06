import { BasePage } from './BasePage'
import { Selector } from 'testcafe';


export class RingcentralSignInNavigationPage extends BasePage {
  onEnter() { }
  onExit() { }

  get credentialField(): Selector {
    return Selector("input[name='credential']");
  }

  get nextButton(): Selector {
    return Selector("[data-test-automation-id='loginCredentialNext']");
  }

  setCredential(credential: string): this {
    this.t.typeText(this.credentialField, credential);
    return this;
  }

  toNextPage(): this {
    this.t.click(this.nextButton);
    return this;
  }
}
