/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-12-17 15:53:17
 * Copyright © RingCentral. All rights reserved.
 */
import NoteItemModel from '../NoteItem';

describe('NoteItemModal', () => {
  it('new NoteItemModel', () => {
    const noteItemModel = NoteItemModel.fromJS({
      title: 'title',
      summary: 'summary',
    } as any);
    expect(noteItemModel.title).toBe('title');
    expect(noteItemModel.summary).toBe('summary');
  });
});
