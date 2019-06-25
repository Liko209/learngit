/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-03 14:11:24
 * Copyright © RingCentral. All rights reserved.
 */

import ItemAPI from 'sdk/api/glip/item';
import { CSSStringForNotePage } from './constants';
class NoteItemController {
  constructor() {}

  async getNoteBody(id: number) {
    const result = await ItemAPI.getNoteBody(id);
    return this._buildNoteBody(result.body);
  }

  private _buildNoteBody(body: string) {
    return `<html><head><meta name=\"viewport\" content=\"width=device-width,initial-scale=1.0\" charset=\"utf-8\"/>${CSSStringForNotePage}</head> <body>${body}</body></html>`;
  }
}

export { NoteItemController };
