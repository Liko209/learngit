import { BaseWebComponent } from "../BaseWebComponent";

export class LoginPage extends BaseWebComponent {

    get root() {
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
        await this.typeText(this.credentialField, credential);
    }

    async setUsername(username: string) {
        await this.typeText(this.usernameField, username);
    }

    async setPassword(password: string) {
        await this.typeText(this.passwordField, password);
    }

    async setExtension(extension: string) {
        await this.typeText(this.extensionField, extension);
    }

    async confirmSignIn() {
        await this.t.click(this.signInButton);
    }

    async interactiveSignIn(username: string, extension: string, password: string) {
        console.log(username, password, extension);
        await this.enterSignInMethodRedirectPage();
        await this.setCredential(username);
        await this.enterRingcentralSignInPage();
        await this.setUsername(username);
        await this.setExtension(extension);
        await this.setPassword(password);
        await this.t.click(this.signInButton);
    }
}