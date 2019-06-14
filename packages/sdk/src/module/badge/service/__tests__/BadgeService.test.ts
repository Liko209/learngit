/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-26 22:49:54
 * Copyright © RingCentral. All rights reserved.
 */

import { BadgeService } from '../BadgeService';
import { notificationCenter, ENTITY } from 'sdk/service';

describe('BadgeService', () => {
  let service: BadgeService;

  beforeEach(() => {
    service = new BadgeService();
  });

  describe('getById', () => {
    it('should return 0 when map does not contain the badge ', async () => {
      const mockId = 'testId';
      expect(await service.getById(mockId)).toEqual({
        id: mockId,
        unreadCount: 0,
      });
    });

    it('should call getValueFunc when map contain the badge ', async () => {
      const mockId = 'testId';
      const mockBadge = { id: mockId, unreadCount: 9, mentionCount: 11 };
      const mockGetValueFunc = jest.fn().mockReturnValue(mockBadge);
      service['_badgeMap'].set(mockId, mockGetValueFunc);
      expect(await service.getById(mockId)).toEqual(mockBadge);
    });
  });

  describe('registerBadge', () => {
    it('should set value to map', () => {
      const mockId = 'testId';
      const mockGetValueFunc = jest.fn();
      service.registerBadge(mockId, mockGetValueFunc);
      expect(service['_badgeMap'].size).toEqual(1);
    });
  });

  describe('updateBadge', () => {
    it('should call notificationCenter', () => {
      const mockId = 'testId';
      const mockBadge = { id: mockId, unreadCount: 9, mentionCount: 11 };
      notificationCenter.emitEntityUpdate = jest.fn();
      service.updateBadge(mockBadge);
      expect(notificationCenter.emitEntityUpdate).toBeCalledWith(ENTITY.BADGE, [
        mockBadge,
      ]);
    });
  });
});
