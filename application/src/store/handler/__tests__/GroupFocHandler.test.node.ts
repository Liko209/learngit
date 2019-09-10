/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-08-22 18:12:34
 * Copyright © RingCentral. All rights reserved.
 */

import { GroupFocHandler, GROUP_TAB_TYPE } from '../GroupFocHandler';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { SortUtils } from 'sdk/framework/utils';
import { Group } from 'sdk/module/group/entity';
import { AccountUserConfig } from 'sdk/module/account/config/AccountUserConfig';
import { AccountService } from 'sdk/module/account/service';

jest.mock('sdk/module/config/GlobalConfig');
describe('GroupFocHandler', () => {
  const groupService = {
    getEntities: jest.fn(),
    getGroupName: jest.fn(),
    isValid: jest.fn(),
    getEntitySource: jest.fn(),
  };

  const accountService = new AccountService();

  const entitySourceController = {
    getEntityName: jest.fn().mockReturnValue('Test'),
    getEntities: jest.fn(),
    getEntityNotificationKey: jest.fn(),
  };

  function clearMocks() {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  }

  beforeEach(() => {
    clearMocks();
    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((serviceName: string) => {
        if (serviceName === ServiceConfig.GROUP_SERVICE) {
          return groupService;
        }
        if (serviceName === ServiceConfig.ACCOUNT_SERVICE) {
          return accountService;
        }
      });

    AccountUserConfig.prototype.getGlipUserId = jest
      .fn()
      .mockImplementation(() => 1);
  });

  it('should call create/dispose foc', async () => {
    const handler = new GroupFocHandler(GROUP_TAB_TYPE.ALL);
    groupService.getEntitySource.mockReturnValue(entitySourceController);
    const foc = await handler.getFoc();
    const spyOnDispose = jest.spyOn(foc, 'dispose');
    handler.dispose();
    expect(spyOnDispose).toHaveBeenCalled();
  });

  it('should call sort', () => {
    const handler = new GroupFocHandler(GROUP_TAB_TYPE.ALL);
    groupService.getGroupName = jest.fn().mockImplementation((group: Group) => {
      if (group.id === 1) {
        return 'cbc';
      }
      if (group.id === 2) {
        return 'bca';
      }
      return '';
    });

    SortUtils.compareLowerCaseString = jest.fn();
    handler.sortFunc(
      { id: 1, sortValue: 0, data: { id: 1, displayName: 'cbc' } },
      { id: 2, sortValue: 0, data: { id: 2, displayName: 'bca' } },
    );
    expect(SortUtils.compareLowerCaseString).toHaveBeenCalledWith('cbc', 'bca');
  });

  it('should call filter foc when type is all', () => {
    const handler = new GroupFocHandler(GROUP_TAB_TYPE.ALL);
    entitySourceController.getEntities;
    groupService.getEntitySource.mockReturnValue(entitySourceController);
    groupService.isValid = jest.fn().mockImplementation(() => {
      return true;
    });
    expect(handler.filterFunc({ id: 1, members: [1, 2] } as Group)).toBe(true);
    expect(handler.filterFunc({ id: 1, members: [2, 2, 3] } as Group)).toBe(
      false,
    );
  });

  it('should call filter foc when type is teams', () => {
    const handler = new GroupFocHandler(GROUP_TAB_TYPE.TEAMS);
    entitySourceController.getEntities;
    groupService.getEntitySource.mockReturnValue(entitySourceController);
    groupService.isValid = jest.fn().mockImplementation(() => {
      return true;
    });
    expect(
      handler.filterFunc({ id: 1, is_team: false, members: [1, 2] } as Group),
    ).toBe(false);
    expect(
      handler.filterFunc({ id: 1, is_team: true, members: [2, 3] } as Group),
    ).toBe(false);
    expect(
      handler.filterFunc({ id: 1, is_team: true, members: [1, 2] } as Group),
    ).toBe(true);
  });

  it('should call filter foc when type is groups', () => {
    const handler = new GroupFocHandler(GROUP_TAB_TYPE.GROUPS);
    entitySourceController.getEntities;
    groupService.getEntitySource.mockReturnValue(entitySourceController);
    groupService.isValid = jest.fn().mockImplementation(() => {
      return true;
    });
    expect(
      handler.filterFunc({ id: 1, is_team: true, members: [1, 2, 3] } as Group),
    ).toBe(false);
    expect(
      handler.filterFunc({
        id: 1,
        is_team: false,
        members: [1, 2, 3],
      } as Group),
    ).toBe(true);
    expect(
      handler.filterFunc({ id: 1, is_team: false, members: [3, 2] } as Group),
    ).toBe(false);
  });

  it('should call filter foc when type is individual', () => {
    const handler = new GroupFocHandler(GROUP_TAB_TYPE.INDIVIDUAL);
    entitySourceController.getEntities;
    groupService.getEntitySource.mockReturnValue(entitySourceController);
    groupService.isValid = jest.fn().mockImplementation(() => {
      return true;
    });
    expect(
      handler.filterFunc({ id: 1, is_team: true, members: [1, 2] } as Group),
    ).toBe(false);
    expect(
      handler.filterFunc({ id: 1, is_team: false, members: [1, 2] } as Group),
    ).toBe(true);
    expect(
      handler.filterFunc({
        id: 1,
        is_team: false,
        members: [1, 2, 3],
      } as Group),
    ).toBe(false);
  });
});
