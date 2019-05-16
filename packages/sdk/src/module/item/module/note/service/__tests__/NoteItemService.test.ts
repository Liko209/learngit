/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-05-13 15:40:43
 * Copyright © RingCentral. All rights reserved.
 */

import { NoteItemService } from '../NoteItemService';
import { NoteItemController } from '../../controller/NoteItemController';
describe('NoteItemService', () => {
  let noteItemService: NoteItemService;
  beforeEach(() => {
    noteItemService = new NoteItemService();
  });
  describe('linkItemController()', () => {
    it('should return controller when has _noteItemController', async () => {
      noteItemService['_noteItemController'] = {};
      const result = await noteItemService.noteItemController;
      expect(result).toEqual({});
    });

    it('should return new controller when has no _noteItemController', async () => {
      noteItemService['_noteItemController'] = undefined;
      const result = await noteItemService.noteItemController;
      expect(result instanceof NoteItemController).toBeTruthy();
    });
  });
});
