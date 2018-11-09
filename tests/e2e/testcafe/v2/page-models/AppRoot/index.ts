import 'testcafe';
import { BaseWebComponent } from '../BaseWebComponent';
import { HomePage } from './HomePage';
import { LoginPage } from './LoginPage';
import { h } from '../../helpers';

export class AppRoot extends BaseWebComponent {
    async ensureLoaded() { }

    get self() {
        return null;
    }

    get loginPage() {
        return this.getComponent(LoginPage);
    }

    get homePage() {
        return this.getComponent(HomePage);
    }

    async getCurrentGroupIdFromURL(): Promise<number> {
        return Number(/messages\/(\d+)/.exec(await h(this.t).href)[1]);
    } 
}
