/*
 * @Author: Paynter Chen
 * @Date: 2019-01-14 17:52:02
 * Copyright © RingCentral. All rights reserved.
 */

import { ISubItemService } from '../../base/service/ISubItemService';
import { EntityBaseService } from '../../../../../framework/service';
import { IItemService } from '../../../service/IItemService';
import { daoManager } from '../../../../../dao';
import { CodeItemDao } from '../dao/CodeItemDao';
import { CodeItem, SanitizedCodeItem } from '../entity';

class CodeItemService extends EntityBaseService<CodeItem>
  implements ISubItemService {
  constructor(itemService: IItemService) {
    super();
  }

  async updateItem(file: CodeItem) {
    const sanitizedDao = daoManager.getDao<CodeItemDao>(CodeItemDao);
    await sanitizedDao.update(this._toSanitizedCode(file));
  }

  async deleteItem(itemId: number) {
    const sanitizedDao = daoManager.getDao<CodeItemDao>(CodeItemDao);
    await sanitizedDao.delete(itemId);
  }

  async createItem(file: CodeItem) {
    const sanitizedDao = daoManager.getDao<CodeItemDao>(CodeItemDao);
    await sanitizedDao.put(this._toSanitizedCode(file));
  }

  async getSortedIds(
    groupId: number,
    limit: number,
    offsetItemId: number | undefined,
    sortKey: string,
    desc: boolean,
  ): Promise<number[]> {
    const sanitizedDao = daoManager.getDao<CodeItemDao>(CodeItemDao);
    return await sanitizedDao.getSortedIds(
      groupId,
      limit,
      offsetItemId,
      sortKey,
      desc,
    );
  }

  async getSubItemsCount(groupId: number) {
    const sanitizedDao = daoManager.getDao<CodeItemDao>(CodeItemDao);
    return await sanitizedDao.getGroupItemCount(groupId);
  }

  private _toSanitizedCode(codeItem: CodeItem) {
    return {
      id: codeItem.id,
      group_ids: codeItem.group_ids,
      created_at: codeItem.created_at,
      name: codeItem.name,
      title: codeItem.title,
      mode: codeItem.mode,
      mime_type: codeItem.mime_type,
      wrap_lines: codeItem.wrap_lines,
    } as SanitizedCodeItem;
  }
}

export { CodeItemService };
