import { BaseWebComponent } from "../../BaseWebComponent";

class AddActionMenuEntry extends BaseWebComponent {

    async enter() {
        await this.t.click(this.root);
    }

}

export class AddActionMenu extends BaseWebComponent {

    get root() {
        this.warnFlakySelector();
        return this.getSelector('ul[role="menu"]');
    }

    private nthEntry(nth: number) {
        this.warnFlakySelector();
        return this.getComponent(AddActionMenuEntry, this.root.find('li').nth(nth));
    }

    get createTeamEntry() {
        return this.nthEntry(0);
    }

}