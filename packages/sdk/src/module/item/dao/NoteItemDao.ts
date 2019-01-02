/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-2 15:50:00
 * Copyright © RingCentral. All rights reserved.
 */

import { SanitizedNoteItem } from '../entity';
import { SubItemDao } from './SubItemDao';
import { IDatabase } from 'foundation/src/db';

class NoteItemDao extends SubItemDao<SanitizedNoteItem> {
  static COLLECTION_NAME = 'noteItem';
  constructor(db: IDatabase) {
    super(NoteItemDao.COLLECTION_NAME, db);
  }
}

export { NoteItemDao };
