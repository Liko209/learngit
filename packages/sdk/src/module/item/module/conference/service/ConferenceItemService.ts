/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-01-14 23:10:14
 * Copyright © RingCentral. All rights reserved.
 */

import { ConferenceItemController } from '../controller/ConferenceItemController';
import { ConferenceItem, SanitizedConferenceItem } from '../entity';
import { BaseSubItemService } from '../../base/service/BaseSubItemService';
import { ConferenceItemDao } from '../dao/ConferenceItemDao';
import { daoManager } from '../../../../../dao';

class ConferenceItemService extends BaseSubItemService<
  ConferenceItem,
  SanitizedConferenceItem
> {
  private _conferenceItemController: ConferenceItemController;

  constructor() {
    super(daoManager.getDao<ConferenceItemDao>(ConferenceItemDao));
  }

  protected get conferenceItemController() {
    if (!this._conferenceItemController) {
      this._conferenceItemController = new ConferenceItemController();
    }
    return this._conferenceItemController;
  }
}

export { ConferenceItemService };
