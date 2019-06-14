/*
 * @Author: isaac.liu
 * @Date: 2019-05-28 10:23:06
 * Copyright © RingCentral. All rights reserved.
 */
import { BaseWebComponent } from "../../../BaseWebComponent";

export class LeftRail extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('telephony-tab').parent('div');
  }
}
