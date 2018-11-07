
import { BaseWebComponent } from '../../BaseWebComponent';

export class CreateTeamModal extends BaseWebComponent {
    get self() {
        this.warnFlakySelector();
        return this.getSelector('*[role="dialog"]');
    }

    get cancelButton() {
        this.warnFlakySelector();
        return this.self.find('button[tabindex="0"]');
    }

    get createButton() {
        this.warnFlakySelector();
        return this.self.find('button[tabindex="-1"]');
    }

    async clickCancelButton() {
        await this.t.click(this.cancelButton);
    }
}