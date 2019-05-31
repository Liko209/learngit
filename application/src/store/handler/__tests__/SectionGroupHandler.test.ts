/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-10-29 10:47:27
 * Copyright © RingCentral. All rights reserved.
 */
import { getGlobalValue, getEntity } from '../../utils/entities';
import SectionGroupHandler from '../SectionGroupHandler';
import { SECTION_TYPE } from '@/modules/message/container/LeftRail/Section/types';
import { Notification } from '@/containers/Notification';
import { ProfileService } from 'sdk/module/profile';
import { StateService } from 'sdk/module/state';
import { GroupService, Group } from 'sdk/module/group';
import { notificationCenter, ENTITY, GROUP_QUERY_TYPE } from 'sdk/service';
import { QUERY_DIRECTION } from 'sdk/dao';
import preFetchConversationDataHandler from '../PreFetchConversationDataHandler';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

jest.mock('@/containers/Notification');
jest.mock('../PreFetchConversationDataHandler');
jest.mock('sdk/api');
jest.mock('sdk/module/profile');
jest.mock('sdk/module/state');
jest.mock('sdk/module/group');
jest.mock('../../utils/entities');
jest.mock('sdk/module/account/config');

const profileService = new ProfileService();
const stateService = new StateService();
const groupService = new GroupService();

function setup() {
  ServiceLoader.getInstance = jest
    .fn()
    .mockImplementation((serviceName: string) => {
      if (ServiceConfig.PROFILE_SERVICE === serviceName) {
        return profileService;
      }

      if (ServiceConfig.STATE_SERVICE === serviceName) {
        return stateService;
      }

      if (ServiceConfig.GROUP_SERVICE === serviceName) {
        return groupService;
      }

      if (ServiceConfig.ACCOUNT_SERVICE === serviceName) {
        return { userConfig: { getCurrentUserProfileId: jest.fn() } };
      }

      return null;
    });

  Object.assign(SectionGroupHandler, { _instance: undefined });
  (profileService.getProfile as jest.Mock).mockResolvedValue({});
  (getGlobalValue as jest.Mock).mockReturnValue(1);
  getEntity.mockReturnValue({ unreadCount: 0 });
}

function clearMocks() {
  jest.clearAllMocks();
  jest.restoreAllMocks();
  jest.resetAllMocks();
}

const expectIds = [
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
];

beforeEach(() => {
  jest.resetAllMocks();
  jest.clearAllMocks();
  jest.restoreAllMocks();
  setup();
});

afterEach(() => {
  SectionGroupHandler.getInstance().dispose();
});

describe('SectionGroupHandler', () => {
  describe('Basic functions/configs', () => {
    it('getInstance', () => {
      expect(SectionGroupHandler.getInstance() !== undefined).toBeTruthy();
    });
    it('groupIds', () => {
      expect(SectionGroupHandler.getInstance().groupIds.length).toEqual(0);
    });
    it('getGroupIdsByType', () => {
      expect(
        SectionGroupHandler.getInstance().getGroupIdsByType(
          SECTION_TYPE.FAVORITE,
        ),
      ).toEqual([]);
      expect(
        SectionGroupHandler.getInstance().getGroupIdsByType(
          SECTION_TYPE.DIRECT_MESSAGE,
        ),
      ).toEqual([]);
      expect(
        SectionGroupHandler.getInstance().getGroupIdsByType(SECTION_TYPE.TEAM),
      ).toEqual([]);
    });
  });

  describe('Group change notification', () => {
    let sectionGroupHandler: SectionGroupHandler;
    beforeEach((done: jest.DoneCallback) => {
      clearMocks();
      setup();
      sectionGroupHandler = SectionGroupHandler.getInstance();
      sectionGroupHandler.onReady(() => done());
      groupService.isValid = jest.fn().mockImplementation((group: any) => {
        return (
          group && !group.is_archived && !group.deactivated && !!group.members
        );
      });
    });

    it('should save groups to foc for groups change', done => {
      const fakeData = [
        {
          id: 1,
          is_team: false,
          created_at: 0,
          most_recent_post_created_at: 1,
          members: [1],
        },
        {
          id: 2,
          is_team: true,
          created_at: 0,
          most_recent_post_created_at: 1,
          members: [1],
        },
      ];
      groupService.getGroupsByType = jest
        .fn()
        .mockImplementation((groupType: GROUP_QUERY_TYPE) => {
          if (groupType === GROUP_QUERY_TYPE.FAVORITE) {
            return [];
          }
          if (groupType === GROUP_QUERY_TYPE.GROUP) {
            return [fakeData[0]];
          }
          return [fakeData[1]];
        });

      notificationCenter.emitEntityUpdate(ENTITY.GROUP, fakeData);
      setTimeout(() => {
        expect(sectionGroupHandler.groupIds.sort()).toEqual([1, 2]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual([2]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
        ).toEqual([1]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.FAVORITE),
        ).toEqual([]);
        done();
      });
    });

    it('should not save over limit groups to foc for group state change', done => {
      const fakeData = [];
      for (let i = 0; i < 21; i++) {
        fakeData.push({
          id: i,
          is_team: i > 10,
          created_at: i,
          most_recent_post_created_at: i,
          members: [1],
        });
      }
      groupService.getGroupsByType = jest
        .fn()
        .mockImplementation((groupType: GROUP_QUERY_TYPE) => {
          if (groupType === GROUP_QUERY_TYPE.FAVORITE) {
            return [];
          }
          if (groupType === GROUP_QUERY_TYPE.GROUP) {
            return fakeData.slice(0, 11);
          }
          return fakeData.slice(11, 20);
        });
      notificationCenter.emitEntityUpdate(ENTITY.GROUP_STATE, fakeData);
      setTimeout(() => {
        expect(
          sectionGroupHandler.groupIds.sort((a: number, b: number) => {
            if (a > b) {
              return 1;
            }
            if (a < b) {
              return -1;
            }
            return 0;
          }),
        ).toEqual(expectIds);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual([19, 18, 17, 16, 15, 14, 13, 12, 11]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
        ).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.FAVORITE),
        ).toEqual([]);
        done();
      });
    });

    it('should delete foc data if group is delete', done => {
      SectionGroupHandler.getInstance();
      const putData = [
        {
          id: 2,
          is_team: true,
          created_at: 0,
          members: [1],
        },
      ];
      let isDelete = false;
      groupService.getGroupsByType = jest
        .fn()
        .mockImplementation((groupType: GROUP_QUERY_TYPE) => {
          if (groupType === GROUP_QUERY_TYPE.FAVORITE) {
            return [];
          }
          if (groupType === GROUP_QUERY_TYPE.GROUP) {
            return [];
          }
          return isDelete ? [] : putData;
        });
      expect(SectionGroupHandler.getInstance().groupIds).toEqual([]);
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, putData);
      isDelete = true;
      notificationCenter.emitEntityDelete(ENTITY.GROUP, [3]);
      setTimeout(() => {
        expect(SectionGroupHandler.getInstance().groupIds).toEqual([]);
        expect(
          SectionGroupHandler.getInstance()
            .getGroupIdsByType(SECTION_TYPE.TEAM)
            .sort(),
        ).toEqual([]);
        done();
      });
    });

    it('should not add this group in because it has not post and did not created by current user', done => {
      SectionGroupHandler.getInstance();
      const fakeData = [
        {
          id: 1,
          is_team: false,
          created_at: 0,
          creator_id: 2,
          members: [1],
        },
      ];
      groupService.getGroupsByType = jest
        .fn()
        .mockImplementation((groupType: GROUP_QUERY_TYPE) => {
          if (groupType === GROUP_QUERY_TYPE.FAVORITE) {
            return [];
          }
          if (groupType === GROUP_QUERY_TYPE.GROUP) {
            return fakeData;
          }
          return [];
        });
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, fakeData);
      setTimeout(() => {
        expect(SectionGroupHandler.getInstance().groupIds.sort()).toEqual([]);
        expect(
          SectionGroupHandler.getInstance().getGroupIdsByType(
            SECTION_TYPE.TEAM,
          ),
        ).toEqual([]);
        expect(
          SectionGroupHandler.getInstance().getGroupIdsByType(
            SECTION_TYPE.DIRECT_MESSAGE,
          ),
        ).toEqual([]);
        expect(
          SectionGroupHandler.getInstance().getGroupIdsByType(
            SECTION_TYPE.FAVORITE,
          ),
        ).toEqual([]);
        done();
      });
    });

    it('should add this group in even it has not post but created by current user', done => {
      (getGlobalValue as jest.Mock).mockReturnValue(3);
      SectionGroupHandler.getInstance();
      const fakeData = [
        {
          id: 11111,
          is_team: false,
          created_at: 0,
          creator_id: 1,
          members: [3],
        },
      ];
      groupService.getGroupsByType = jest
        .fn()
        .mockImplementation((groupType: GROUP_QUERY_TYPE) => {
          if (groupType === GROUP_QUERY_TYPE.FAVORITE) {
            return [];
          }
          if (groupType === GROUP_QUERY_TYPE.GROUP) {
            return fakeData;
          }
          return [];
        });
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, fakeData);
      setTimeout(() => {
        expect(SectionGroupHandler.getInstance().groupIds).toEqual([11111]);
        expect(
          SectionGroupHandler.getInstance().getGroupIdsByType(
            SECTION_TYPE.DIRECT_MESSAGE,
          ),
        ).toEqual([11111]);
        done();
      });
    });

    it('should not add to foc which group is archived', done => {
      SectionGroupHandler.getInstance();
      const putData = [
        {
          id: 2,
          is_team: true,
          created_at: 0,
          members: [1],
        },
        {
          id: 3,
          is_team: true,
          created_at: 0,
          is_archived: true,
        },
      ];
      groupService.getGroupsByType = jest
        .fn()
        .mockImplementation((groupType: GROUP_QUERY_TYPE) => {
          if (groupType === GROUP_QUERY_TYPE.FAVORITE) {
            return [];
          }
          if (groupType === GROUP_QUERY_TYPE.GROUP) {
            return [];
          }
          return putData;
        });
      expect(SectionGroupHandler.getInstance().groupIds).toEqual([]);
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, putData);
      setTimeout(() => {
        expect(SectionGroupHandler.getInstance().groupIds).toEqual([2]);
        expect(
          SectionGroupHandler.getInstance()
            .getGroupIdsByType(SECTION_TYPE.TEAM)
            .sort(),
        ).toEqual([2]);
        done();
      });
    });

    it('should not save deactivated to foc', done => {
      SectionGroupHandler.getInstance();
      const fakeData = [
        {
          id: 1,
          is_team: false,
          created_at: 0,
          most_recent_post_created_at: 1,
          deactivated: true,
          members: [1],
        },
        {
          id: 2,
          is_team: true,
          created_at: 0,
          most_recent_post_created_at: 1,
          members: [1],
        },
      ];
      groupService.getGroupsByType = jest
        .fn()
        .mockImplementation((groupType: GROUP_QUERY_TYPE) => {
          if (groupType === GROUP_QUERY_TYPE.FAVORITE) {
            return [];
          }
          if (groupType === GROUP_QUERY_TYPE.GROUP) {
            return [fakeData[0]];
          }
          return [fakeData[1]];
        });
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, fakeData);
      setTimeout(() => {
        expect(SectionGroupHandler.getInstance().groupIds.sort()).toEqual([2]);
        expect(
          SectionGroupHandler.getInstance().getGroupIdsByType(
            SECTION_TYPE.TEAM,
          ),
        ).toEqual([2]);
        expect(
          SectionGroupHandler.getInstance().getGroupIdsByType(
            SECTION_TYPE.DIRECT_MESSAGE,
          ),
        ).toEqual([]);
        expect(
          SectionGroupHandler.getInstance().getGroupIdsByType(
            SECTION_TYPE.FAVORITE,
          ),
        ).toEqual([]);
        done();
      });
    });

    it('should not save the group which has not member list to foc when update data', done => {
      SectionGroupHandler.getInstance();
      const fakeData = [
        {
          id: 1,
          is_team: false,
          created_at: 0,
          most_recent_post_created_at: 1,
          members: [1],
        },
        {
          id: 2,
          is_team: true,
          created_at: 0,
          most_recent_post_created_at: 1,
          members: [],
        },
      ];
      groupService.getGroupsByType = jest
        .fn()
        .mockImplementation((groupType: GROUP_QUERY_TYPE) => {
          if (groupType === GROUP_QUERY_TYPE.FAVORITE) {
            return [];
          }
          if (groupType === GROUP_QUERY_TYPE.GROUP) {
            return [fakeData[0]];
          }
          return [fakeData[1]];
        });
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, fakeData);
      setTimeout(() => {
        expect(SectionGroupHandler.getInstance().groupIds.sort()).toEqual([1]);
        expect(
          SectionGroupHandler.getInstance().getGroupIdsByType(
            SECTION_TYPE.TEAM,
          ),
        ).toEqual([]);
        expect(
          SectionGroupHandler.getInstance().getGroupIdsByType(
            SECTION_TYPE.DIRECT_MESSAGE,
          ),
        ).toEqual([1]);
        expect(
          SectionGroupHandler.getInstance().getGroupIdsByType(
            SECTION_TYPE.FAVORITE,
          ),
        ).toEqual([]);
        done();
      });
    });
  });

  describe('Group state change notification', () => {
    let sectionGroupHandler: SectionGroupHandler;
    beforeEach((done: jest.DoneCallback) => {
      clearMocks();
      setup();
      sectionGroupHandler = SectionGroupHandler.getInstance();
      sectionGroupHandler.onReady(() => done());
      Notification.flashToast = jest.fn().mockImplementationOnce(() => {});
      groupService.isValid = jest.fn().mockImplementation((group: any) => {
        return (
          group && !group.is_archived && !group.deactivated && !!group.members
        );
      });
    });

    it('should update groups to foc for group state change', done => {
      const fakeData = [
        {
          id: 1,
          is_team: false,
          created_at: 0,
          most_recent_post_created_at: 1,
          members: [1],
        },
        {
          id: 2,
          is_team: true,
          created_at: 0,
          most_recent_post_created_at: 1,
          members: [1],
        },
      ];
      groupService.getGroupsByType = jest
        .fn()
        .mockImplementation((groupType: GROUP_QUERY_TYPE) => {
          if (groupType === GROUP_QUERY_TYPE.FAVORITE) {
            return [];
          }
          if (groupType === GROUP_QUERY_TYPE.GROUP) {
            return [fakeData[0]];
          }
          return [fakeData[1]];
        });
      notificationCenter.emitEntityUpdate(ENTITY.GROUP_STATE, [
        {
          id: 4,
          company_id: 1,
          set_abbreviation: '',
          email_friendly_abbreviation: '',
          most_recent_content_modified_at: 1,
        },
      ]);
      setTimeout(() => {
        expect(sectionGroupHandler.groupIds.sort()).toEqual([1, 2]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual([2]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
        ).toEqual([1]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.FAVORITE),
        ).toEqual([]);
        done();
      });
    });

    it('should not save over limit groups to foc for groups change', done => {
      const fakeData = [];
      for (let i = 0; i < 22; i++) {
        fakeData.push({
          id: i,
          is_team: i > 10,
          created_at: i,
          most_recent_post_created_at: i,
          members: [1],
        });
      }
      groupService.getGroupsByType = jest
        .fn()
        .mockImplementation((groupType: GROUP_QUERY_TYPE) => {
          if (groupType === GROUP_QUERY_TYPE.FAVORITE) {
            return [];
          }
          if (groupType === GROUP_QUERY_TYPE.GROUP) {
            return fakeData.slice(0, 11);
          }
          return fakeData.slice(11, 20);
        });
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, fakeData);
      setTimeout(() => {
        expect(
          sectionGroupHandler.groupIds.sort((a: number, b: number) => {
            if (a > b) {
              return 1;
            }
            if (a < b) {
              return -1;
            }
            return 0;
          }),
        ).toEqual(expectIds);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual([19, 18, 17, 16, 15, 14, 13, 12, 11]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
        ).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.FAVORITE),
        ).toEqual([]);
        done();
      });
    });

    it('should delete foc data if group is delete when receive group state notification', done => {
      SectionGroupHandler.getInstance();
      const putData = [
        {
          id: 2,
          is_team: true,
          created_at: 0,
          members: [1],
        },
      ];
      let isDelete = false;
      groupService.getGroupsByType = jest
        .fn()
        .mockImplementation((groupType: GROUP_QUERY_TYPE) => {
          if (groupType === GROUP_QUERY_TYPE.FAVORITE) {
            return [];
          }
          if (groupType === GROUP_QUERY_TYPE.GROUP) {
            return [];
          }
          return isDelete ? [] : putData;
        });
      expect(SectionGroupHandler.getInstance().groupIds).toEqual([]);
      notificationCenter.emitEntityUpdate(ENTITY.GROUP_STATE, [
        {
          id: 4,
          company_id: 1,
          set_abbreviation: '',
          email_friendly_abbreviation: '',
          most_recent_content_modified_at: 1,
        },
      ]);
      isDelete = true;
      notificationCenter.emitEntityDelete(ENTITY.GROUP, [3]);
      setTimeout(() => {
        expect(SectionGroupHandler.getInstance().groupIds).toEqual([]);
        expect(
          SectionGroupHandler.getInstance()
            .getGroupIdsByType(SECTION_TYPE.TEAM)
            .sort(),
        ).toEqual([]);
        done();
      });
    });

    it('user was removed from current conversation', done => {
      SectionGroupHandler.getInstance();
      const putData = [
        {
          id: 2,
          is_team: true,
          created_at: 0,
          members: [1],
        },
      ];
      let isDelete = false;
      groupService.getGroupsByType = jest
        .fn()
        .mockImplementation((groupType: GROUP_QUERY_TYPE) => {
          if (groupType === GROUP_QUERY_TYPE.FAVORITE) {
            return [];
          }
          if (groupType === GROUP_QUERY_TYPE.GROUP) {
            return [];
          }
          return isDelete ? [] : putData;
        });
      expect(SectionGroupHandler.getInstance().groupIds).toEqual([]);
      notificationCenter.emitEntityUpdate(ENTITY.GROUP_STATE, [
        {
          id: 4,
          company_id: 1,
          set_abbreviation: '',
          email_friendly_abbreviation: '',
          most_recent_content_modified_at: 1,
        },
      ]);
      isDelete = true;
      notificationCenter.emitEntityDelete(ENTITY.GROUP, [1]);
      setTimeout(() => {
        expect(Notification.flashToast).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'people.prompt.conversationPrivate',
          }),
        );
        done();
      });
    });

    it('should not add group in which has not post and did not created by current user when receive group state notification', done => {
      SectionGroupHandler.getInstance();
      const fakeData = [
        {
          id: 1,
          is_team: false,
          created_at: 0,
          creator_id: 2,
          members: [1],
        },
      ];
      groupService.getGroupsByType = jest
        .fn()
        .mockImplementation((groupType: GROUP_QUERY_TYPE) => {
          if (groupType === GROUP_QUERY_TYPE.FAVORITE) {
            return [];
          }
          if (groupType === GROUP_QUERY_TYPE.GROUP) {
            return fakeData;
          }
          return [];
        });
      notificationCenter.emitEntityUpdate(ENTITY.GROUP_STATE, [
        {
          id: 4,
          company_id: 1,
          set_abbreviation: '',
          email_friendly_abbreviation: '',
          most_recent_content_modified_at: 1,
        },
      ]);
      setTimeout(() => {
        expect(SectionGroupHandler.getInstance().groupIds.sort()).toEqual([]);
        expect(
          SectionGroupHandler.getInstance().getGroupIdsByType(
            SECTION_TYPE.TEAM,
          ),
        ).toEqual([]);
        expect(
          SectionGroupHandler.getInstance().getGroupIdsByType(
            SECTION_TYPE.DIRECT_MESSAGE,
          ),
        ).toEqual([]);
        expect(
          SectionGroupHandler.getInstance().getGroupIdsByType(
            SECTION_TYPE.FAVORITE,
          ),
        ).toEqual([]);
        done();
      });
    });

    it('should add this group in even it has not post but created by current user when receive group state notification', done => {
      (getGlobalValue as jest.Mock).mockReturnValue(3);
      SectionGroupHandler.getInstance();
      const fakeData = [
        {
          id: 11111,
          is_team: false,
          created_at: 0,
          creator_id: 1,
          members: [3],
        },
      ];
      groupService.getGroupsByType = jest
        .fn()
        .mockImplementation((groupType: GROUP_QUERY_TYPE) => {
          if (groupType === GROUP_QUERY_TYPE.FAVORITE) {
            return [];
          }
          if (groupType === GROUP_QUERY_TYPE.GROUP) {
            return fakeData;
          }
          return [];
        });
      notificationCenter.emitEntityUpdate(ENTITY.GROUP_STATE, [
        {
          id: 4,
          company_id: 1,
          set_abbreviation: '',
          email_friendly_abbreviation: '',
          most_recent_content_modified_at: 1,
        },
      ]);
      setTimeout(() => {
        expect(SectionGroupHandler.getInstance().groupIds).toEqual([11111]);
        expect(
          SectionGroupHandler.getInstance().getGroupIdsByType(
            SECTION_TYPE.DIRECT_MESSAGE,
          ),
        ).toEqual([11111]);
        done();
      });
    });

    it('should not add to foc which group is archived when receive group state notification', done => {
      SectionGroupHandler.getInstance();
      const putData = [
        {
          id: 2,
          is_team: true,
          created_at: 0,
          members: [1],
        },
        {
          id: 3,
          is_team: true,
          created_at: 0,
          is_archived: true,
        },
      ];
      groupService.getGroupsByType = jest
        .fn()
        .mockImplementation((groupType: GROUP_QUERY_TYPE) => {
          if (groupType === GROUP_QUERY_TYPE.FAVORITE) {
            return [];
          }
          if (groupType === GROUP_QUERY_TYPE.GROUP) {
            return [];
          }
          return putData;
        });
      expect(SectionGroupHandler.getInstance().groupIds).toEqual([]);
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, [
        {
          id: 4,
          company_id: 1,
          set_abbreviation: '',
          email_friendly_abbreviation: '',
          most_recent_content_modified_at: 1,
        },
      ]);
      setTimeout(() => {
        expect(SectionGroupHandler.getInstance().groupIds).toEqual([2]);
        expect(
          SectionGroupHandler.getInstance()
            .getGroupIdsByType(SECTION_TYPE.TEAM)
            .sort(),
        ).toEqual([2]);
        done();
      });
    });

    it('should not save deactivated to foc when receive group state notification', done => {
      SectionGroupHandler.getInstance();
      const fakeData = [
        {
          id: 1,
          is_team: false,
          created_at: 0,
          most_recent_post_created_at: 1,
          deactivated: true,
          members: [1],
        },
        {
          id: 2,
          is_team: true,
          created_at: 0,
          most_recent_post_created_at: 1,
          members: [1],
        },
      ];
      groupService.getGroupsByType = jest
        .fn()
        .mockImplementation((groupType: GROUP_QUERY_TYPE) => {
          if (groupType === GROUP_QUERY_TYPE.FAVORITE) {
            return [];
          }
          if (groupType === GROUP_QUERY_TYPE.GROUP) {
            return [fakeData[0]];
          }
          return [fakeData[1]];
        });
      notificationCenter.emitEntityUpdate(ENTITY.GROUP_STATE, [
        {
          id: 4,
          company_id: 1,
          set_abbreviation: '',
          email_friendly_abbreviation: '',
          most_recent_content_modified_at: 1,
        },
      ]);
      setTimeout(() => {
        expect(SectionGroupHandler.getInstance().groupIds.sort()).toEqual([2]);
        expect(
          SectionGroupHandler.getInstance().getGroupIdsByType(
            SECTION_TYPE.TEAM,
          ),
        ).toEqual([2]);
        expect(
          SectionGroupHandler.getInstance().getGroupIdsByType(
            SECTION_TYPE.DIRECT_MESSAGE,
          ),
        ).toEqual([]);
        expect(
          SectionGroupHandler.getInstance().getGroupIdsByType(
            SECTION_TYPE.FAVORITE,
          ),
        ).toEqual([]);
        done();
      });
    });

    it('should not save the group which has not member list to foc when receive group state notification', done => {
      SectionGroupHandler.getInstance();
      const fakeData = [
        {
          id: 1,
          is_team: false,
          created_at: 0,
          most_recent_post_created_at: 1,
          members: [1],
        },
        {
          id: 2,
          is_team: true,
          created_at: 0,
          most_recent_post_created_at: 1,
          members: [],
        },
      ];
      groupService.getGroupsByType = jest
        .fn()
        .mockImplementation((groupType: GROUP_QUERY_TYPE) => {
          if (groupType === GROUP_QUERY_TYPE.FAVORITE) {
            return [];
          }
          if (groupType === GROUP_QUERY_TYPE.GROUP) {
            return [fakeData[0]];
          }
          return [fakeData[1]];
        });
      notificationCenter.emitEntityUpdate(ENTITY.GROUP_STATE, [
        {
          id: 4,
          company_id: 1,
          set_abbreviation: '',
          email_friendly_abbreviation: '',
          most_recent_content_modified_at: 1,
        },
      ]);
      setTimeout(() => {
        expect(SectionGroupHandler.getInstance().groupIds.sort()).toEqual([1]);
        expect(
          SectionGroupHandler.getInstance().getGroupIdsByType(
            SECTION_TYPE.TEAM,
          ),
        ).toEqual([]);
        expect(
          SectionGroupHandler.getInstance().getGroupIdsByType(
            SECTION_TYPE.DIRECT_MESSAGE,
          ),
        ).toEqual([1]);
        expect(
          SectionGroupHandler.getInstance().getGroupIdsByType(
            SECTION_TYPE.FAVORITE,
          ),
        ).toEqual([]);
        done();
      });
    });
  });

  describe('_removeGroupsIfExistedInHiddenGroups', () => {
    it('should not remove unread conversation', () => {
      SectionGroupHandler.getInstance()['_hiddenGroupIds'] = [123, 456];
      SectionGroupHandler.getInstance()['_handlersMap'] = {};
      SectionGroupHandler.getInstance()['_handlersMap'][
        SECTION_TYPE.DIRECT_MESSAGE
] = {};
      getEntity.mockReturnValueOnce({ unreadCount: 1 });
      jest
        .spyOn(SectionGroupHandler.getInstance(), 'getGroupIdsByType')
        .mockReturnValueOnce([123, 456, 789]);
      SectionGroupHandler.getInstance()['_removeByIds'] = jest.fn();
      SectionGroupHandler.getInstance()['_updateUrl'] = jest.fn();
      SectionGroupHandler.getInstance()[ '_removeGroupsIfExistedInHiddenGroups'
]();
      expect(SectionGroupHandler.getInstance()['_removeByIds']).toBeCalledWith(
        SECTION_TYPE.DIRECT_MESSAGE,
        [456],
      );
    });
  });

  describe('getRemovedIds', () => {
    it('should return [] because its length less or equal than limit', () => {
      const result = SectionGroupHandler.getInstance().getRemovedIds(
        [],
        [1, 2],
        2,
        1,
      );
      expect(result.length).toBe(0);
    });
    it('should return [] because over group limit has unread', () => {
      const result = SectionGroupHandler.getInstance().getRemovedIds(
        [{ id: 3 }],
        [1, 2, 3],
        2,
        0,
      );
      expect(result.length).toBe(0);
    });
    it('should return [] because over group is current group', () => {
      const result = SectionGroupHandler.getInstance().getRemovedIds(
        [],
        [1, 2, 3],
        2,
        3,
      );
      expect(result.length).toBe(0);
    });
    it('should return [3,4] because over group has not unread and is not current group', () => {
      const result = SectionGroupHandler.getInstance().getRemovedIds(
        [],
        [1, 2, 3, 4, 5],
        2,
        5,
      );
      expect(result.length).toBe(2);
    });
  });

  describe('removeOverLimitGroupByChangingIds()', () => {
    function setup({
      ids,
      removedIds,
    }: {
      ids: number[];
      removedIds: number[];
    }) {
      const sectionGroupHandler = SectionGroupHandler.getInstance();
      const directMessageHandler = { removeByIds: jest.fn() };
      const teamHandler = { removeByIds: jest.fn() };
      Object.assign(sectionGroupHandler, {
        _lastGroupId: 1,
        _handlersMap: {
          [SECTION_TYPE.DIRECT_MESSAGE]: directMessageHandler,
          [SECTION_TYPE.TEAM]: teamHandler,
        },
      });
      jest.spyOn(sectionGroupHandler, 'getGroupIdsByType').mockReturnValue(ids);
      jest
        .spyOn(sectionGroupHandler, 'getRemovedIds')
        .mockReturnValue(removedIds);

      return { sectionGroupHandler, directMessageHandler, teamHandler };
    }

    it('should remove overflow ids', async () => {
      const { sectionGroupHandler, directMessageHandler, teamHandler } = setup({
        ids: [1, 2, 3],
        removedIds: [2, 3],
      });
      await sectionGroupHandler.removeOverLimitGroupByChangingIds();
      expect(directMessageHandler.removeByIds).toHaveBeenCalledWith([2, 3]);
      expect(teamHandler.removeByIds).toHaveBeenCalledWith([2, 3]);
    });
  });

  describe('removeOverLimitGroupByChangingCurrentGroupId()', () => {
    function setup({
      lastGroupId,
      groupIds,
      limit,
      lastGroupHasUnread,
    }: {
      lastGroupId: number;
      groupIds: number[];
      limit: number;
      lastGroupHasUnread: boolean;
    }) {
      const sectionGroupHandler = SectionGroupHandler.getInstance();
      const directMessageHandler = { removeByIds: jest.fn() };
      const teamHandler = { removeByIds: jest.fn() };
      Object.assign(sectionGroupHandler, {
        _lastGroupId: lastGroupId,
        _handlersMap: {
          [SECTION_TYPE.DIRECT_MESSAGE]: directMessageHandler,
          [SECTION_TYPE.TEAM]: teamHandler,
        },
      });
      jest
        .spyOn(sectionGroupHandler, 'getGroupIdsByType')
        .mockReturnValue(groupIds);
      jest
        .spyOn(sectionGroupHandler, 'removeOverLimitGroupByChangingIds')
        .mockImplementation(() => {});
      jest
        .spyOn<SectionGroupHandler, any>(
          sectionGroupHandler,
          '_hasUnreadInGroups',
        )
        .mockReturnValue(lastGroupHasUnread);
      jest
        .spyOn<SectionGroupHandler, any>(
          sectionGroupHandler,
          '_profileUpdateGroupSections',
        )
        .mockImplementation(() => {});
      jest
        .spyOn<SectionGroupHandler, any>(
          sectionGroupHandler,
          '_updateHiddenGroupIds',
        )
        .mockImplementation(() => {});
      (profileService.getSynchronously as jest.Mock).mockReturnValue({
        max_leftrail_group_tabs2: limit,
      });
      return { sectionGroupHandler, directMessageHandler, teamHandler };
    }

    it('should remove last group if it over limit and no unread', async () => {
      const { sectionGroupHandler, directMessageHandler } = setup({
        lastGroupId: 7,
        groupIds: [1, 2, 3, 4, 5, 6, 7],
        limit: 5,
        lastGroupHasUnread: false,
      });
      await sectionGroupHandler.removeOverLimitGroupByChangingCurrentGroupId();
      expect(directMessageHandler.removeByIds).toHaveBeenCalledWith([7]);
    });

    it('should not remove last group if it over limit but has unread', async () => {
      const { sectionGroupHandler, directMessageHandler } = setup({
        groupIds: [1, 2, 3, 4, 5, 6, 7],
        limit: 5,
        lastGroupId: 7,
        lastGroupHasUnread: true,
      });
      await sectionGroupHandler.removeOverLimitGroupByChangingCurrentGroupId();
      expect(directMessageHandler.removeByIds).not.toHaveBeenCalled();
    });

    it('should not remove last group if it did not over limit', async () => {
      const { sectionGroupHandler, directMessageHandler } = setup({
        groupIds: [1, 2, 3, 4, 5, 6, 7],
        limit: 5,
        lastGroupId: 5,
        lastGroupHasUnread: false,
      });
      await sectionGroupHandler.removeOverLimitGroupByChangingCurrentGroupId();
      expect(directMessageHandler.removeByIds).not.toHaveBeenCalled();
    });
  });

  describe('checkIfGroupOpenedFromHidden', () => {
    it('should not change because of more hidden group ids', async () => {
      const handler = SectionGroupHandler.getInstance();
      await handler.checkIfGroupOpenedFromHidden([], [1]);
      expect(handler.groupIds.length).toBe(0);
    });

    it('should add groups because of less hidden group ids', async () => {
      const handler = SectionGroupHandler.getInstance();
      (groupService.getGroupsByIds as jest.Mock).mockResolvedValue([
        {
          id: 3,
          company_id: 1,
          is_team: false,
          members: [],
        },
      ]);
      await handler.checkIfGroupOpenedFromHidden([1, 2], [1]);
      expect(handler.groupIds.length).toBe(0);
    });
  });

  describe('preFetch group data()', () => {
    it('should call addProcessor twice when sectionType is favorites', async () => {
      const sectionGroupHandler = SectionGroupHandler.getInstance();
      const direction = QUERY_DIRECTION.OLDER;
      const sectionType = SECTION_TYPE.FAVORITE;
      jest
        .spyOn(sectionGroupHandler._handlersMap[sectionType], 'fetchData')
        .mockResolvedValueOnce([{ id: 1 }, { id: 2 }]);
      await sectionGroupHandler.fetchGroups(sectionType, direction);
      expect(
        preFetchConversationDataHandler.addProcessor,
      ).toHaveBeenCalledTimes(2);
    });

    it('should call addProcessor twice when sectionType is direct_messages and state.unread_count is 2', async (done: any) => {
      const sectionGroupHandler = SectionGroupHandler.getInstance();
      const direction = QUERY_DIRECTION.OLDER;
      const sectionType = SECTION_TYPE.DIRECT_MESSAGE;
      jest
        .spyOn(sectionGroupHandler._handlersMap[sectionType], 'fetchData')
        .mockResolvedValue([{ id: 1 }, { id: 2 }]);
      jest
        .spyOn(stateService, 'getById')
        .mockResolvedValue({ unread_count: 2 });
      await sectionGroupHandler.fetchGroups(sectionType, direction);
      setTimeout(() => {
        expect(
          preFetchConversationDataHandler.addProcessor,
        ).toHaveBeenCalledTimes(2);
        done();
      });
    });

    it('should call addProcessor twice when sectionType is teams and state.unread_mentions_count is 2', async (done: any) => {
      const sectionGroupHandler = SectionGroupHandler.getInstance();
      const direction = QUERY_DIRECTION.OLDER;
      const sectionType = SECTION_TYPE.TEAM;
      jest
        .spyOn(sectionGroupHandler._handlersMap[sectionType], 'fetchData')
        .mockResolvedValue([{ id: 1 }, { id: 2 }]);
      jest
        .spyOn(stateService, 'getById')
        .mockResolvedValue({ unread_mentions_count: 2 });
      await sectionGroupHandler.fetchGroups(sectionType, direction);
      setTimeout(() => {
        expect(
          preFetchConversationDataHandler.addProcessor,
        ).toHaveBeenCalledTimes(2);
        done();
      });
    });
  });
});
