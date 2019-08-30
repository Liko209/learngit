import { BaseWebComponent } from '../../BaseWebComponent';

class AddActionMenuEntry extends BaseWebComponent {
  async enter() {
    await this.t.hover('html').click(this.self);
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

  private getEntryById(id: string) {
    return this.getComponent(AddActionMenuEntry, this.getSelectorByAutomationId(id));
  }

  get sendNewMessageEntry() {
    return this.getEntryById('sendNewMessage');
  }

  get createTeamEntry() {
    return this.getEntryById('createTeam');
  }
}
