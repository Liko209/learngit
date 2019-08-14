/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-05-23 14:01:32
 * Copyright © RingCentral. All rights reserved.
 */
import { MeetingItemController } from '../controller/MeetingItemController';
import { ZoomMeetingItem } from '../entity';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';
import { EntityBaseService } from 'sdk/framework/service';

class MeetingItemService extends EntityBaseService<ZoomMeetingItem> {
  private _meetingItemController: MeetingItemController;
  constructor() {
    super({ isSupportedCache: false });
    this.setCheckTypeFunc((id: number) =>
      GlipTypeUtil.isExpectedType(id, TypeDictionary.TYPE_ID_MEETING),
    );
  }

  protected get meetingItemController() {
    if (!this._meetingItemController) {
      this._meetingItemController = new MeetingItemController();
    }
    return this._meetingItemController;
  }
}

export { MeetingItemService };
