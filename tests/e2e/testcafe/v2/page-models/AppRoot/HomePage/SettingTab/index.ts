import { BaseWebComponent } from "../../../BaseWebComponent";
import { LeftRail } from './LeftRail';
import { PhoneSettingPage } from './PhoneSettingPage';
import { NotificationAndSoundSettingPage } from './NotificationAndSoundPage';
import { MessageSettingPage } from "./MessageSettingPage";

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
    return this.getSelectorByAutomationId('settingLeftRail').parent(2); //todo: new automation id
  }

  get subSettings() {
    return this.self.find('[data-name="sub-setting"]');
  }

  nthSubSetting(n: number) {
    return this.getComponent(Entry, this.subSettings.nth(n));
  }

  get leftRail() {
    return this.getComponent(LeftRail);
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

  // phone setting
  get phoneSettingPage() {
    return this.getComponent(PhoneSettingPage);
  }
  get messageSettingPage(){
    return this.getComponent(MessageSettingPage);
  }

  get notificationAndSoundPage() {
    return this.getComponent(NotificationAndSoundSettingPage);
  }
}
