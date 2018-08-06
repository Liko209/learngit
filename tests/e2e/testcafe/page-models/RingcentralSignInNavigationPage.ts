import { BasePage } from './BasePage'
import { Selector } from 'testcafe';


export class RingcentralSignInNavigationPage extends BasePage {

  get credentialField(): Selector {
    return Selector("input[name='credential']");
  }

  get nextButton(): Selector {
    return Selector("[data-test-automation-id='loginCredentialNext']");
  }

  setCredential(credential: string): this {
    return this.chain(t =>
      t.typeText(this.credentialField, credential)
    );
  }

  toNextPage(): this {
    return this.chain(t =>
      t.click(this.nextButton)
    )
  }
}
