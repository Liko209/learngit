import * as _ from 'lodash';
import { BaseWebComponent } from "../../BaseWebComponent";

class LeftNavigatorEntry extends BaseWebComponent {

  public name: string;

  async enter() {
    await this.t.click(this.self);
  }

  async getUmi() {
    const umi = this.self.find('.umi');
    if (!await umi.exists) {
      return 0;
    }
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

  get self() {
    return this.getSelectorByAutomationId('leftPanel');
  }

  get toggleButton() {
    return this.getSelectorByAutomationId('toggleBtn');
  }

  get width() {
    return this.self.offsetWidth;
  }

  private getEntry(automationId: string) {
    const entry = this.getComponent(LeftNavigatorEntry, this.getSelectorByAutomationId(automationId));
    entry.name = automationId;
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
  async isExpand() {
    const width = await this.width;
    return width > 200 * 0.9;
  }

  async widthShouldBe(n: number) {
    await this.t.expect(this.width).eql(n);
  }

  private async toggle(expand: boolean) {
    const isExpand = await this.isExpand();
    if (isExpand != expand) {
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
