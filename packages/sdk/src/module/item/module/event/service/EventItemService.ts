/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 15:58:02
 * Copyright © RingCentral. All rights reserved.
 */
import { ISubItemService } from '../../base/service/ISubItemService';
import { EntityBaseService } from '../../../../../framework/service';

class EventItemService extends EntityBaseService implements ISubItemService {
  constructor() {
    super();
  }

  getSortedIds(
    groupId: number,
    limit: number,
    offset: number,
    sortKey: string,
    desc: boolean,
  ): number[] {
    return [];
  }

  updateItem(): void {}
}

export { EventItemService };
