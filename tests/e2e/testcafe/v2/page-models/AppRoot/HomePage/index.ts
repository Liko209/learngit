import * as _ from 'lodash';
import { BaseWebComponent } from "../../BaseWebComponent";

class LeftNavigatorEntry extends BaseWebComponent {

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
        entry.root = this.getSelectorByAutomationId(automationId);
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
            await this.t.click(this.toggleButton);
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

    ensureLoaded() {
        return this.waitUntilExist(this.root);
    }

    get toggleButton() {
        return this.root.find('*[role="button"]');
    }

    get conversations() {
        return this.root.find('*[role="menuitem"]');
    }

    nthConversation(n: number) {
        return this.getComponent(ConversationEntry, this.conversations.nth(n));
    }

    async isExpand() {
        return await this.root.withText('keyboard_arrow_up').exists;
    }

    private async toggle(expand: boolean) {
        const isExpand = await this.isExpand();
        if ((!isExpand && expand) || (isExpand && !expand)) {
            await this.t.click(this.toggleButton);
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
        return this.getComponent(ConversationListSection, this.getSelector(`*[data-name="${name}"]`));
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

class AddActionMenuEntry extends BaseWebComponent {

    async enter() {
        await this.t.click(this.root);
    }

}

class AddActionMenu extends BaseWebComponent {

    get root() {
        this.warnFlakySelector();
        return this.getSelector('ul[role="menu"]');
    }

    private nthEntry(nth: number) {
        return this.getComponent(AddActionMenuEntry, this.root.find('li').nth(nth));
    }

    get createTeamEntry() {
        return this.nthEntry(0);
    }

}

class CreateTeamModal extends BaseWebComponent {
    get root() {
        this.warnFlakySelector();
        return this.getSelector('*[role="dialog"]');
    }

    get cancelButton() {
        this.warnFlakySelector();
        return this.root.find('button[tabindex="0"]');
    }

    get createButton() {
        this.warnFlakySelector();
        return this.root.find('button[tabindex="-1"]');
    }

    async clickCancelButton() {
        await this.t.click(this.cancelButton);
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

    get addActionButton() {
        this.warnFlakySelector();
        return this.root.find('button').child().withText('add_circle').parent().parent();
    }

    get addActionMenu() {
        return this.getComponent(AddActionMenu);
    }

    get createTeamModal() {
        return this.getComponent(CreateTeamModal);
    }

    async clickAddActionButton() {
        await this.t.click(this.addActionButton);
        await this.t.hover('html');
    }
}