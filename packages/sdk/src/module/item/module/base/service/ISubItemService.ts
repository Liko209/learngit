/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 13:25:06
 * Copyright © RingCentral. All rights reserved.
 */

interface ISubItemService {
  getSortedIds(
    groupId: number,
    limit: number,
    offset: number,
    sortKey: string,
    desc: boolean,
  ): number[];
  updateItem(): void;
}

export { ISubItemService };
