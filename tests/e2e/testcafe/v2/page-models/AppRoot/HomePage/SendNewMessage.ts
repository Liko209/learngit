import { BaseWebComponent } from '../../BaseWebComponent';
import { v4 as uuid } from 'uuid';

export class SendNewMessageModal extends BaseWebComponent {
    get self() {
        this.warnFlakySelector();
        return this.getSelector('*[role="dialog"]');
    }

    get createMessageButton() {
        this.warnFlakySelector();
        return this.self.find('button').nth(1);
    }

    get cancelButton() {
        this.warnFlakySelector();
        return this.self.find('button').nth(0);
    }

    get sendButton() {
        this.warnFlakySelector();
        return this.self.find('button').nth(-1);
    }

    get membersInput() {
        this.warnFlakySelector();
        return this.self.find('[aria-labelledby="downshift-multiple-label"]');

    }

    get newMessageTextarea() {
        return this.getSelectorByAutomationId('newMessageTextarea').find('textarea');
    }

    async clickCancelButton() {
        await this.t.click(this.cancelButton);
    }

    async clickSendButton() {
        await this.t.click(this.sendButton);
    }

    async click() {
        await this.t.click(this.self);
    }

    get isDisable(): Promise<boolean> {
        return this.createMessageButton.hasAttribute('disabled');
    }

    async sendButtonShouldBeDisabled() {
        await this.t.expect(this.isDisable).ok();
    }

    async sendButtonShouldBeEnabled() {
        await this.t.expect(this.isDisable).notOk();
    }

    async setMemeber(name: string) {
        await this.t.typeText(this.membersInput, `${name}`, { replace: true, paste: true });
        // Need time to wait for serached members to display
        await this.t.wait(1000);
        await this.t.pressKey('enter');
    }

    async setNewMessage(message: string) {
        await this.t.typeText(this.newMessageTextarea, `${message}`, { replace: true, paste: true });
    }

    async getNewMessage(num: number) {
        const name = [];
        for (let i = 0; i < num; i++) {
            name.push(1);
        }
        return name.join('');
    }
}