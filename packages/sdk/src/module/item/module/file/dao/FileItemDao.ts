/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-2 15:50:00
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { SanitizedFileItem, FileItem } from '../entity';
import { SubItemDao } from '../../base/dao';
import { FileItemUtils } from '../utils';
import { IDatabase } from 'foundation';

class FileItemDao extends SubItemDao<SanitizedFileItem> {
  static COLLECTION_NAME = 'fileItem';
  constructor(db: IDatabase) {
    super(FileItemDao.COLLECTION_NAME, db);
  }

  toSanitizedItem(file: FileItem) {
    return {
      ...super.toSanitizedItem(file),
      name: file.name,
      type: file.type,
      __latest_version_date:
        FileItemUtils.getVersionDate(file) || file.created_at,
    } as SanitizedFileItem;
  }

  toPartialSanitizedItem(partialItem: Partial<FileItem>) {
    return {
      ...super.toPartialSanitizedItem(partialItem),
      ..._.pick(partialItem, ['name', 'type']),
    };
  }
}

export { FileItemDao };
