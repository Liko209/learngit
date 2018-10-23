import 'testcafe';
import { HomePage } from './HomePage';
import { BaseWebComponent } from '../BaseWebComponent';

export class AppRoot extends BaseWebComponent {
    async ensureLoaded() { }

    get homePage() {
        return new HomePage(this.t);
    }
}
