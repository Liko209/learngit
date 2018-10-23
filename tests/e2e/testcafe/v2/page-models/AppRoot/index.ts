import 'testcafe';
import { HomePage } from './HomePage';
import { BaseWebComponent } from '../BaseWebComponent';

export class AppRoot extends BaseWebComponent {
    async ensureLoaded() { }

    get root() {
        return null;
    }

    get homePage() {
        return this.getComponent(HomePage);
    }
}
