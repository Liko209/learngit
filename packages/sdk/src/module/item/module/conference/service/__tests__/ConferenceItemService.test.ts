/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-05-13 15:40:43
 * Copyright © RingCentral. All rights reserved.
 */

import { ConferenceItemService } from '../ConferenceItemService';
import { ConferenceItemController } from '../../controller/ConferenceItemController';
describe('ConferenceItemService', () => {
  let conferenceItemService: ConferenceItemService;
  beforeEach(() => {
    conferenceItemService = new ConferenceItemService();
  });
  describe('conferenceItemController()', () => {
    it('should return controller when has _conferenceItemController', async () => {
      conferenceItemService['_conferenceItemController'] = {};
      const result = await conferenceItemService.conferenceItemController;
      expect(result).toEqual({});
    });

    it('should return new controller when has no _conferenceItemController', async () => {
      conferenceItemService['_conferenceItemController'] = undefined;
      const result = await conferenceItemService.conferenceItemController;
      expect(result instanceof ConferenceItemController).toBeTruthy();
    });
  });
});
