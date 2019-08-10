/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-08-01 11:14:16
 * Copyright © RingCentral. All rights reserved.
 */
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';
import { EntityBaseService } from 'sdk/framework/service';
import { RCVideoMeetingItem } from '../entity';
import { RCVideoMeetingItemController } from '../controller/RCVideoMeetingItemController';

class RCVideoMeetingItemService extends EntityBaseService<RCVideoMeetingItem> {
  private _rcVideoMeetingItemController: RCVideoMeetingItemController;

  constructor() {
    super({ isSupportedCache: false });
    this.setCheckTypeFunc((id: number) =>
      GlipTypeUtil.isExpectedType(id, TypeDictionary.TYPE_ID_RC_VIDEO),
    );
  }

  protected get rcVideoMeetingItemController() {
    if (!this._rcVideoMeetingItemController) {
      this._rcVideoMeetingItemController = new RCVideoMeetingItemController();
    }
    return this._rcVideoMeetingItemController;
  }
}

export { RCVideoMeetingItemService };
