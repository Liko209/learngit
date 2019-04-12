/*
 * @Author: Andy Hu
 * @Date: 2018-12-07 14:47:58
 * Copyright © RingCentral. All rights reserved.
 */
jest.mock('sdk/module/state');
jest.mock('sdk/module/profile');
jest.mock('sdk/module/group');
jest.mock('@/history');
jest.mock('@/store/handler/SectionGroupHandler');

import history from '@/history';
import storeManager from '@/store';
import SectionGroupHandler from '@/store/handler/SectionGroupHandler';
import { MessageRouterChangeHelper } from '../helper';
import { GLOBAL_KEYS } from '@/store/constants';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
let mockedStateService: any;
let mockedProfileService: any;
let mockedGroupService: any;
let mockedGlobalStore: any;
let mockedSectionHandler: any;
function resetMockedServices() {
  mockedStateService = {
    lastGroupId: 110,
    async getMyState() {
      return { last_group_id: this.lastGroupId };
    },
  };
  mockedProfileService = {
    hidden: false,
    async isConversationHidden() {
      return this.hidden;
    },
    reopenConversation: jest.fn(),
  };
  mockedGroupService = {
    valid: true,
    group: {},
    async getById() {
      return {};
    },
    updateGroupLastAccessedTime: jest.fn().mockResolvedValue(''),
    async isGroupCanBeShown(id: number) {
      return {
        canBeShown:
          this.valid && !(await mockedProfileService.isConversationHidden()),
      };
    },
  };
  mockedGlobalStore = {
    set: jest.fn(),
  };
  mockedSectionHandler = {
    list: [110],
    onReady: (callback: Function) => callback(mockedSectionHandler.list),
  };
}

function mockDependencies() {
  SectionGroupHandler.getInstance = jest
    .fn()
    .mockImplementation(() => mockedSectionHandler);

  ServiceLoader.getInstance = jest
    .fn()
    .mockImplementation((serviceName: string) => {
      if (ServiceConfig.STATE_SERVICE === serviceName) {
        return mockedStateService;
      }

      if (ServiceConfig.GROUP_SERVICE === serviceName) {
        return mockedGroupService;
      }

      if (ServiceConfig.PROFILE_SERVICE === serviceName) {
        return mockedProfileService;
      }

      return null;
    });

  storeManager.getGlobalStore = jest
    .fn()
    .mockImplementation(() => mockedGlobalStore);
  history.push = jest.fn().mockImplementation(jest.fn());
  history.replace = jest.fn().mockImplementation(jest.fn());
}

describe('MessageRouterChangeHelper', () => {
  beforeEach(() => {
    mockDependencies();
    resetMockedServices();
    MessageRouterChangeHelper.isIndexDone = true;
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('go to last group()', () => {
    const state = undefined;
    it('should go to the last group when group is valid', async () => {
      await MessageRouterChangeHelper.goToLastOpenedGroup();
      expect(history.replace).toBeCalledWith('/messages/110', state);
      expect(mockedGlobalStore.set).toBeCalledWith(
        GLOBAL_KEYS.CURRENT_CONVERSATION_ID,
        110,
      );
    });
    it('should go to the default page when last group is invalid', async () => {
      mockedGroupService.valid = false;
      await MessageRouterChangeHelper.goToLastOpenedGroup();
      expect(history.replace).toBeCalledWith('/messages/', state);
      expect(mockedGlobalStore.set).toBeCalledWith(
        GLOBAL_KEYS.CURRENT_CONVERSATION_ID,
        0,
      );
    });
    it('should go to the default page when last group is hidden', async () => {
      mockedProfileService.hidden = true;
      await MessageRouterChangeHelper.goToLastOpenedGroup();
      expect(history.replace).toBeCalledWith('/messages/', state);
      expect(mockedGlobalStore.set).toBeCalledWith(
        GLOBAL_KEYS.CURRENT_CONVERSATION_ID,
        0,
      );
    });
  });
  describe('handleSourceOfRouter', () => {
    it('should access Group when conversation is not in the left panel', () => {
      MessageRouterChangeHelper.ensureGroupIsOpened(110);
      expect(mockedGroupService.updateGroupLastAccessedTime).toBeCalledTimes(0);
    });
    it('should not access Group when conversation is in the left panel', () => {
      MessageRouterChangeHelper.ensureGroupIsOpened(120);
      expect(mockedGroupService.updateGroupLastAccessedTime).toBeCalledTimes(1);
    });
  });
});

describe('ensureGroupOpened', () => {
  beforeEach(() => {
    mockedProfileService = {
      isConversationHidden: jest.fn(),
      reopenConversation: jest.fn(),
    };
    mockDependencies();
    resetMockedServices();
  });
  it('should call service to reopen', (done: any) => {
    mockedProfileService.isConversationHidden = jest
      .fn()
      .mockResolvedValueOnce(true);
    mockedProfileService.reopenConversation = jest
      .fn()
      .mockResolvedValueOnce({ isErr: () => false });
    MessageRouterChangeHelper.ensureGroupIsOpened(110);
    setTimeout(() => {
      expect(mockedProfileService.reopenConversation).toHaveBeenCalled();
      done();
    });
  });
  it('should not call service to reopen when it is not hidden', () => {
    mockedProfileService.isConversationHidden = jest
      .fn()
      .mockResolvedValue(false);
    MessageRouterChangeHelper.ensureGroupIsOpened(110);
    expect(mockedProfileService.reopenConversation).not.toHaveBeenCalled();
  });
  it('should show loading page with error when reopen failed', (done: any) => {
    mockedProfileService.isConversationHidden = jest
      .fn()
      .mockResolvedValueOnce(true);
    mockedProfileService.reopenConversation = jest
      .fn()
      .mockRejectedValueOnce(new Error('test'));
    MessageRouterChangeHelper.ensureGroupIsOpened(110);
    setTimeout(() => {
      expect(mockedProfileService.reopenConversation).toHaveBeenCalled();
      expect(history.replace).toBeCalledWith('/messages/loading', {
        error: true,
        id: 110,
      });
      done();
    });
  });
});
