/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 15:58:59
 * Copyright © RingCentral. All rights reserved.
 */

import { ISubItemService } from '../../base/service/ISubItemService';
import { LinkItemController } from '../controller/LinkItemController';
import { EntityBaseService } from '../../../../../framework/service';
import { IItemService } from '../../../service/IItemService';
import { ItemQueryOptions, ItemFilterFunction } from '../../../types';
import { LinkItem, SanitizedLinkItem } from '../entity';
import { LinkItemDao } from '../dao';
import { daoManager } from '../../../../../dao';
import { ItemUtils } from '../../../utils';

class LinkItemService extends EntityBaseService implements ISubItemService {
  private _linkItemController: LinkItemController;

  constructor(itemService: IItemService) {
    super();
  }

  protected get linkItemController() {
    if (!this._linkItemController) {
      this._linkItemController = new LinkItemController();
    }
    return this._linkItemController;
  }

  async updateItem(link: LinkItem) {
    const sanitizedDao = daoManager.getDao<LinkItemDao>(LinkItemDao);
    await sanitizedDao.update(this._toSanitizedLink(link));
  }

  async deleteItem(itemId: number) {
    const sanitizedDao = daoManager.getDao<LinkItemDao>(LinkItemDao);
    await sanitizedDao.delete(itemId);
  }

  async createItem(link: LinkItem) {
    const sanitizedDao = daoManager.getDao<LinkItemDao>(LinkItemDao);
    await sanitizedDao.put(this._toSanitizedLink(link));
  }

  private _toSanitizedLink(link: LinkItem) {
    return {
      ...ItemUtils.toSanitizedItem(link),
    } as SanitizedLinkItem;
  }

  async getSortedIds(options: ItemQueryOptions): Promise<number[]> {
    const sanitizedDao = daoManager.getDao<LinkItemDao>(LinkItemDao);
    return await sanitizedDao.getSortedIds(options);
  }

  async getSubItemsCount(groupId: number, filterFunc?: ItemFilterFunction) {
    const sanitizedDao = daoManager.getDao<LinkItemDao>(LinkItemDao);
    return await sanitizedDao.getGroupItemCount(groupId, filterFunc);
  }
}

export { LinkItemService };
