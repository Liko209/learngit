import { BaseWebComponent } from "../../../BaseWebComponent";
import { LeftRail } from './LeftRail';

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

export class PhoneTab extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('phone-tab').parent('div');
  }

  get leftRail() {
    return this.getComponent(LeftRail);
  }

  getSubEntry(automationId: string) {
    return this.getComponent(Entry, this.getSelectorByAutomationId(automationId));
  }
}
