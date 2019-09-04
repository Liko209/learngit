/*
 * @Author: allen.lian
 * @Date: 2019-08-29 11:10:53
 * Copyright © RingCentral. All rights reserved.
 */


import { BaseWebComponent } from "../../../BaseWebComponent";

export class LeftRail extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('contacts-tab').parent('div');
  }
}
