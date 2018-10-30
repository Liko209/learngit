import { BaseWebComponent } from "../../BaseWebComponent";

class AddActionMenuEntry extends BaseWebComponent {

    async enter() {
        await this.t.click(this.self);
    }

}

export class AddActionMenu extends BaseWebComponent {

    get self() {
        this.warnFlakySelector();
        return this.getSelector('ul[role="menu"]');
    }

    private nthEntry(nth: number) {
        this.warnFlakySelector();
        return this.getComponent(AddActionMenuEntry, this.self.find('li').nth(nth));
    }

    get createTeamEntry() {
        return this.nthEntry(0);
    }

}