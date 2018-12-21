import 'testcafe';
import { BaseWebComponent } from '../BaseWebComponent';
import { HomePage } from './HomePage';
import { LoginPage } from './LoginPage';
import { SITE_URL } from '../../../config';

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

    get pagePath() {
        return this.t.eval(() => window.location.pathname);
    }

    async reload() {
        await this.t.eval(() => location.reload(true));
    }

    async openConversationByUrl(groupId: number | string) {
        const url = new URL(SITE_URL);
        const conversationUrl = `${url.protocol}//${url.hostname}/messages/${groupId}`;
        await this.t.navigateTo(conversationUrl);
    }
}
