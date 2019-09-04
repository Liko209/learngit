import { BaseWebComponent } from "../BaseWebComponent";

export class LoginPage extends BaseWebComponent {

  get self() {
    return this.getSelector('html');
  }

  get toUnifiedLoginPageButton() {
    return this.getSelector('button[type="submit"]');
  }

  get credentialField(): Selector {
    return this.getSelector('input[name="credential"]');
  }

  get nextButton(): Selector {
    return this.getSelector('[data-test-automation-id="loginCredentialNext"]');
  }

  get usernameField(): Selector {
    return this.getSelector('input[name="LoginName"]');
  }

  get extensionField(): Selector {
    return this.getSelector('input[name="PIN"]');
  }

  get passwordField(): Selector {
    return this.getSelector('input[name="Password"]');
  }

  get signInButton(): Selector {
    return this.getSelector('[data-test-automation-id="signInBtn"]');
  }

  async enterSignInMethodRedirectPage() {
    await this.t.click(this.toUnifiedLoginPageButton);
  }

  async enterRingcentralSignInPage() {
    await this.t.click(this.nextButton);
  }

  async setCredential(credential: string) {
    await this.t.typeText(this.credentialField, credential, { replace: true, paste: true });
  }

  async setUsername(username: string) {
    await this.t.typeText(this.usernameField, username, { replace: true, paste: true });
  }

  async setPassword(password: string) {
    await this.t.typeText(this.passwordField, password, { replace: true, paste: true });
  }

  async setExtension(extension: string) {
    // Testcafe typeText throws error when text is empty: The "text" argument is expected to be a non-empty string, but it was "".
    if (!!extension)
      await this.t.typeText(this.extensionField, extension, { replace: true, paste: true });
  }

  async confirmSignIn() {
    await this.t.click(this.signInButton);
  }

  async interactiveSignIn(username: string, extension: string, password: string) {
    await this.enterSignInMethodRedirectPage();
    await this.setCredential(username);
    await this.enterRingcentralSignInPage();
    await this.setUsername(username);
    await this.setExtension(extension);
    await this.setPassword(password);
    await this.t.click(this.signInButton);
  }

  async interactiveEmailSignIn(email: string, password: string) {
    await this.enterSignInMethodRedirectPage();
    await this.setCredential(email);
    await this.enterRingcentralSignInPage();
    await this.setPassword(password);
    await this.t.click(this.signInButton);
  }
}
