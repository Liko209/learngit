import {Selector} from 'testcafe';

class RingcentralSignInNavigationPage extends BasePage {
    onEnter() {}
    onExit() {}

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


class RingcentralSignInPage extends BasePage {
    onEnter() {}
    onExit() {}

    get credentialField(): Selector {
        return  Selector("input[name='credential']");
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
        this.t.typeText(credential, credential);
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
