import { BaseWebComponent, Umi } from "../../../BaseWebComponent";
import { LeftRail } from './LeftRail';
import { VoicemailPage } from "./Voicemail";

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

  // voicemail only
  get umi() {
    return this.getComponent(Umi, this.self.find(".umi"));
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

  get callHistoryEntry() {
    return this.getSubEntry('phone-tab-callhistory')
  }

  get voicemailEntry() {
    return this.getSubEntry('phone-tab-voicemail')
  }

  get faxesEntry() {
    return this.getSubEntry('phone-tab-faxes')
  }

  get recordingEntry() {
    return this.getSubEntry('phone-tab-recording')
  }

  get voicemailPage() {
    return this.getComponent(VoicemailPage);
  }
}
