import { BaseWebComponent } from "../../../BaseWebComponent";
import { LeftRail } from './LeftRail';
import { PhoneTab} from './PhoneTab';

class Entry extends BaseWebComponent {
  async enter() {
    await this.t.click(this.self);
  }

  async shouldBeOpened() {
    await this.t.expect(this.self.hasClass('selected')).ok();
  }

  get name() {
    return this.self.find('p');
  }

  async shouldBeNamed(name: string) {
    await this.t.expect(this.name.withExactText(name).exists).ok();
  }
}

export class SettingTab extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('entry-general').parent('div');
  }

  get leftRail() {
    return this.getComponent(LeftRail);
  }

  // phone setting
  get phoneTab(){
    return this.getComponent(PhoneTab);
  }

  getSubEntry(automationId: string) {
    return this.getComponent(Entry, this.getSelectorByAutomationId(automationId));
  }

  get generalEntry() {
    return this.getSubEntry('entry-general');
  }

  get notificationAndSoundsEntry() {
    return this.getSubEntry('entry-notificationAndSounds');
  }

  get messagesEntry() {
    return this.getSubEntry('entry-messages');
  }

  get phoneEntry() {
    return this.getSubEntry('entry-phone');
  }

  get meetingsEntry() {
    return this.getSubEntry('entry-meetings');
  }

  get calendarEntry() {
    return this.getSubEntry('entry-calendar');
  }

}
