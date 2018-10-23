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
}

class LeftPanel extends BaseWebComponent {

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
    // TODO: other entries

    // actions
    async ensureLoaded() {
        await this.messagesEntry.ensureLoaded();
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

    get items() {
        return this.root.find('*[role="menuitem"]');
    }

    private async toggle(expand: boolean) {
        const isExpand = await this.root.child().withText('keyboard_arrow_up').exists;
        console.log(isExpand);
        if ((!isExpand && expand) || (isExpand && !expand)) {
            await this.click(page => page.toggleButton);
        }
    }

    async expand() {
        return await this.toggle(true);
    }

    async fold() {
        return await this.toggle(false);
    }

}

class MessagePanel extends BaseWebComponent {

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

}

export class HomePage extends BaseWebComponent {

    get leftPanel() {
        return this.getComponent(LeftPanel);
    }

    get messagePanel() {
        return this.getComponent(MessagePanel);
    }

}