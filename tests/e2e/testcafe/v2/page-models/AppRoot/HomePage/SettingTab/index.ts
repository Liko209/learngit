import { BaseWebComponent } from "../../../BaseWebComponent";
import { LeftRail } from './LeftRail';

class Entry extends BaseWebComponent {
  async enter() {
    await this.t.click(this.self);
  }

  async shouldBeOpened() {
    await this.t.expect(this.self.hasClass('selected')).ok();
  }
}

export class SettingTab extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('entry-general').parent('div');
  }

  get leftRail() {
    return this.getComponent(LeftRail);
  }

  entryByAutomationId(automationId: string) {
    return this.getComponent(Entry, this.getSelectorByAutomationId(automationId));
  }

  get generalEntry() {
    return this.entryByAutomationId('entry-general');
  }

  get notificationAndSoundsEntry() {
    return this.entryByAutomationId('entry-notificationAndSounds');
  }

  get messagingEntry() {
    return this.entryByAutomationId('entry-messaging');
  }

  get phoneEntry() {
    return this.entryByAutomationId('entry-phone');
  }

  get calendarEntry() {
    return this.entryByAutomationId('entry-calendar');
  }
  
}
