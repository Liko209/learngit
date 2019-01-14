/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-2 15:50:00
 * Copyright © RingCentral. All rights reserved.
 */

import { SanitizedFileItem } from '../entity';
import { SubItemDao } from '../../base/dao';
import { IDatabase } from 'foundation';
import { RIGHT_RAIL_ITEM_TYPE } from '../../../constants';
import { ItemFilterUtils } from '../../../utils';

class FileItemDao extends SubItemDao<SanitizedFileItem> {
  static COLLECTION_NAME = 'fileItem';
  constructor(db: IDatabase) {
    super(FileItemDao.COLLECTION_NAME, db);
  }

  getFileItemCount(groupId: number, type: RIGHT_RAIL_ITEM_TYPE) {
    const query = this.createQuery();
    return query
      .contain('group_ids', groupId)
      .filter((item: SanitizedFileItem) =>
        type === RIGHT_RAIL_ITEM_TYPE.IMAGE_FILES
          ? ItemFilterUtils.isImageItem(item)
          : !ItemFilterUtils.isImageItem(item),
      )
      .count();
  }
}

export { FileItemDao };
