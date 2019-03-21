import * as _ from 'lodash';
import { h } from '../../../helpers';
import { BaseWebComponent } from "../../BaseWebComponent";


export class TelephonyDialog extends BaseWebComponent {
  get self() {
    return this.getSelector('[role="dialog"]');
  }
  
  get callTime() {
    return // TODO: automationId
  }

  get avatar() {
    return this.self.find('div').withAttribute('uid'); // TODO: automationId
  }

  get name() {
    return // TODO: automationId 
  }

  get extension() {
    return // TODO: automationId 
  }

  get handUpIcon() {
    return this.getSelectorByIcon('hand_up', this.self);
  }

  get handUpButton() {
    return this.handUpIcon.parent('button');
  }

  async clickHandUpButton() {
    await this.t.click(this.handUpButton);
  }
}