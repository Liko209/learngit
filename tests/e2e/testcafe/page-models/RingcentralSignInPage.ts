import { BasePage } from './BasePage'
import { Selector } from 'testcafe';


export class RingcentralSignInPage extends BasePage {
  onEnter() { }
  onExit() { }

  get credentialField(): Selector {
    return Selector("input[name='credential']");
  }

  get extensionField(): Selector {
    return Selector("input[name='PIN']");
  }

  get passwordField(): Selector {
    return Selector("#password");
  }

  get signInButton(): Selector {
    return Selector("*[data-test-automation-id='signInBtn']");
  }

  setCredential(credential: string): this {
    this.t.typeText(this.credentialField, credential);
    return this;
  }

  setExtension(extension: string): this {
    this.t.typeText(this.extensionField, extension);
    return this;
  }

  setPassword(password: string): this {
    this.t.typeText(this.passwordField, password);
    return this;
  }

  signIn(): this {
    this.t.click(this.signInButton);
    return this;
  }
}
