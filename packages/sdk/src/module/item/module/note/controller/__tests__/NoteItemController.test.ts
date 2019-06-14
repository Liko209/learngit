/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-06-13 14:07:01
 * Copyright © RingCentral. All rights reserved.
 */

import ItemAPI from 'sdk/api/glip/item';
import { NoteItemController } from '../NoteItemController';

jest.mock('sdk/api/glip/item');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('NoteItemController', () => {
  let noteItemController: NoteItemController;
  function setUp() {
    noteItemController = new NoteItemController();
  }
  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('getNoteBody', () => {
    it('should call item api to get note body', async () => {
      ItemAPI.getNoteBody = jest
        .fn()
        .mockResolvedValue({ id: 1, body: 'bbbb' });
      const result = await noteItemController.getNoteBody(1);
      expect(result).toEqual(
        `<html><head><meta name=\"viewport\" content=\"width=device-width,initial-scale=1.0\" charset=\"utf-8\"/></head> <body>${'bbbb'}</body></html>`,
      );
    });
  });
});
