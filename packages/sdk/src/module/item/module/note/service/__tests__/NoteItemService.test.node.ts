/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-05-13 15:40:43
 * Copyright © RingCentral. All rights reserved.
 */

import { NoteItemService } from '../NoteItemService';
import { NoteItemController } from '../../controller/NoteItemController';

jest.mock('../../controller/NoteItemController');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('NoteItemService', () => {
  let noteItemService: NoteItemService;
  let noteItemController: NoteItemController;
  beforeEach(() => {
    noteItemService = new NoteItemService();
    noteItemController = new NoteItemController();
    clearMocks();
  });
  describe('noteItemController()', () => {
    it('should return controller when has _noteItemController', async () => {
      noteItemService['_noteItemController'] = {} as any;
      const result = noteItemService['noteItemController'];
      expect(result).toEqual({});
    });

    it('should return new controller when has no _noteItemController', async () => {
      noteItemService['_noteItemController'] = undefined as any;
      const result = await noteItemService['noteItemController'];
      expect(result instanceof NoteItemController).toBeTruthy();
    });

    it('should call getNoteBody in NoteItemController', async () => {
      noteItemController.getNoteBody = jest.fn().mockResolvedValue('html');
      noteItemService['_noteItemController'] = noteItemController;
      const result = await noteItemService.getNoteBody(1);
      expect(noteItemController.getNoteBody).toBeCalledWith(1);
      expect(result).toEqual('html');
    });
  });
});
