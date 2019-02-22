/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-16 12:31:11
 * Copyright © RingCentral. All rights reserved.
 */

import { daoManager } from '../../../../../../dao';
import { IItemService } from '../../../../service/IItemService';
import { EventItemDao } from '../../dao/EventItemDao';
import { EventItemService } from '../EventItemService';

jest.mock('../../../../../../dao');
jest.mock('../../dao/EventItemDao');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('EventItemService', () => {
  let eventItemService: EventItemService;
  let eventItemDao: EventItemDao;

  function setup() {
    eventItemDao = new EventItemDao(null);
    daoManager.getDao = jest.fn().mockReturnValue(eventItemDao);
    eventItemService = new EventItemService();
  }

  beforeEach(() => {
    clearMocks();
    setup();
  });

  describe('EventItemService', () => {
    it('should be instance of EventItemService', () => {
      expect(eventItemService).toBeInstanceOf(EventItemService);
    });
  });
});
