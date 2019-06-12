/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-05-23 14:01:32
 * Copyright © RingCentral. All rights reserved.
 */
import { MeetingItemController } from '../controller/MeetingItemController';
import { MeetingItem } from '../entity';
import { GlipTypeUtil, TypeDictionary } from '../../../../../utils';
import { EntityBaseService } from '../../../../../framework/service';
class MeetingItemService extends EntityBaseService<MeetingItem> {
  private _meetingItemController: MeetingItemController;
  constructor() {
    super(false);
    this.setCheckTypeFunc((id: number) => {
      return GlipTypeUtil.isExpectedType(id, TypeDictionary.TYPE_ID_MEETING);
    });
  }

  protected get meetingItemController() {
    if (!this._meetingItemController) {
      this._meetingItemController = new MeetingItemController();
    }
    return this._meetingItemController;
  }
}

export { MeetingItemService };
