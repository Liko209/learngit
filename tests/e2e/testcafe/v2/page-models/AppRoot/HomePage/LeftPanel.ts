import * as _ from 'lodash';
import { BaseWebComponent } from "../../BaseWebComponent";

class LeftNavigatorEntry extends BaseWebComponent {

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

export class LeftPanel extends BaseWebComponent {

    get root() {
        return this.getSelectorByAutomationId('leftPanel');
    }

    get toggleButton() {
        return this.getSelectorByAutomationId('toggleBtn');
    }

    private getEntry(automationId: string) {
        return this.getComponent(LeftNavigatorEntry, this.getSelectorByAutomationId(automationId));
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