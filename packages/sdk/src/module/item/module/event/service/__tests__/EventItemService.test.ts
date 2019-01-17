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
  const itemService = {};
  let eventItemService: EventItemService;
  let eventItemDao: EventItemDao;

  function setup() {
    eventItemDao = new EventItemDao(null);
    daoManager.getDao = jest.fn().mockReturnValue(eventItemDao);
    eventItemService = new EventItemService(itemService as IItemService);
  }

  beforeEach(() => {
    clearMocks();
    setup();
  });

  function setUpData() {
    const eventItem = {
      id: 123123,
      created_at: 11231333,
      group_ids: [123],
      start: 111,
      end: 222,
    };

    return { eventItem };
  }

  describe('toSanitizedItem', () => {
    const { eventItem } = setUpData();
    it('should return sanitized item', () => {
      expect(eventItemService.toSanitizedItem(eventItem)).toEqual({
        id: eventItem.id,
        group_ids: eventItem.group_ids,
        created_at: eventItem.created_at,
        start: eventItem.start,
        end: eventItem.end,
      });
    });
  });
});
