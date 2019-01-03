/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 13:25:06
 * Copyright © RingCentral. All rights reserved.
 */

abstract class SubItemService {
  getSortedIds(
    groupId: number,
    pageCount: number,
    offset: number,
    sortKey: string,
    desc: boolean,
  ) {}

  updateItem() {}
}

export { SubItemService };
