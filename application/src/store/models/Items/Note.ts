/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-08 16:21:37
 * Copyright © RingCentral. All rights reserved.
 */

import { NoteItem } from './';

function setNoteData(this: NoteItem, data: any) {
  const { summary, title } = data;
  this.title = title || '';
  this.summary = summary || '';
}

export { setNoteData };
