import 'testcafe';
import { BaseWebComponent } from '../BaseWebComponent';
import { HomePage } from './HomePage';
import { LoginPage } from './LoginPage';

export class AppRoot extends BaseWebComponent {
    async ensureLoaded() { }

    get root() {
        return null;
    }

    get loginPage() {
        return this.getComponent(LoginPage);
    }

    get homePage() {
        return this.getComponent(HomePage);
    }
}
