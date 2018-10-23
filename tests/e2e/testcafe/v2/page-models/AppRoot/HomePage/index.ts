import * as _ from 'lodash';
import { BaseWebComponent } from "../../BaseWebComponent";

class LeftNavigatorEntry extends BaseWebComponent {

    public automationId: string;

    get root() {
        return this.getSelectorByAutomationId(this.automationId);
    }

    async ensureLoaded() {
        await this.waitUntilExist(this.root, 10e3);
    }

    async enter() {
        await this.click(page => page.root);
    }

    async getUmi() {
        const umi = this.root.find('.umi');
        const text = await umi.innerText;
        if (_.isEmpty(text)) {
            return 0;
        }
        if (text == '99+') {
            return 100;
        }
        return Number(text);
    }


}

class LeftPanel extends BaseWebComponent {

    get root() {
        return this.getSelectorByAutomationId('leftPanel');
    }

    get toggleButton() {
        return this.getSelectorByAutomationId('toggleBtn');
    }

    private getEntry(automationId: string) {
        const entry = this.getComponent(LeftNavigatorEntry);
        entry.automationId = automationId;
        return entry;
    }

    get dashboardEntry() {
        return this.getEntry('dashboard');
    }

    get messagesEntry() {
        return this.getEntry('messages');
    }

    get phoneEntry() {
        return this.getEntry('phone');
    }

    get meetingsEntry() {
        return this.getEntry('meetings');
    }

    get contactsEntry() {
        return this.getEntry('contacts');
    }

    get calendarEntry() {
        return this.getEntry('calendar');
    }

    get tasksEntry() {
        return this.getEntry('tasks');
    }

    get notesEntry() {
        return this.getEntry('notes');
    }

    get filesEntry() {
        return this.getEntry('files');
    }

    get settingsEntry() {
        return this.getEntry('settings');
    }

    // actions
    async ensureLoaded() {
        await this.messagesEntry.ensureLoaded();
    }

    async isExpand() {
        const width = await this.root.offsetWidth;
        return width > 200 * 0.9;
    }

    private async toggle(expand: boolean) {
        const isExpand = await this.isExpand();
        console.log(isExpand);
        if ((!isExpand && expand) || (isExpand && !expand)) {
            await this.click(page => page.toggleButton);
        }
    }

    async expand() {
        await this.toggle(true);
    }

    async fold() {
        await this.toggle(false);
    }
}

class ConversationEntry extends BaseWebComponent {

    public root: Selector

    async getUmi() {
        const umi = this.root.find('.umi');
        const text = await umi.innerText;
        if (_.isEmpty(text)) {
            return 0;
        }
        if (text == '99+') {
            return 100;
        }
        return Number(text);
    }

    async enter() {
        await this.t.hover('html').click(this.root);
    }
}

class ConversationListSection extends BaseWebComponent {
    public dataName: string;

    ensureLoaded() {
        return this.waitUntilExist(this.root);
    }

    get root() {
        return this.getSelector(`*[data-name="${this.dataName}"]`);
    }

    get toggleButton() {
        return this.root.find('*[role="button"]');
    }

    get conversations() {
        return this.root.find('*[role="menuitem"]');
    }

    nthConversation(n: number) {
        const entry = this.getComponent(ConversationEntry);
        entry.root = this.conversations.nth(n);
        return entry;
    }

    async isExpand() {
        return await this.root.withText('keyboard_arrow_up').exists;
    }

    private async toggle(expand: boolean) {
        const isExpand = await this.isExpand();
        if ((!isExpand && expand) || (isExpand && !expand)) {
            await this.click(page => page.toggleButton);
        }
    }

    async expand() {
        await this.toggle(true);
    }

    async fold() {
        await this.toggle(false);
    }
}

class ConversationSection extends BaseWebComponent {
    get root() {
        return this.getSelector('.conversation-page');
    }

    get posts() {
        return this.root.find('*[data-name="conversation-card"]');
    }
}

class MessagePanel extends BaseWebComponent {
    get root() {
        return this.getSelector('#root');
    }

    private getSection(name: string) {
        const section = this.getComponent(ConversationListSection);
        section.dataName = name;
        return section;
    }

    get favoritesSection() {
        return this.getSection('Favorites');
    }

    get directMessagesSection() {
        return this.getSection('Direct Messages');
    }

    get teamsSection() {
        return this.getSection('Teams');
    }

    get conversationSection() {
        return this.getComponent(ConversationSection);
    }
}

export class HomePage extends BaseWebComponent {
    get root() {
        return this.getSelector('#root');
    }

    get leftPanel() {
        return this.getComponent(LeftPanel);
    }

    get messagePanel() {
        return this.getComponent(MessagePanel);
    }
}