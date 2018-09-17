/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-04 09:31:32
 * Copyright © RingCentral. All rights reserved.
 */
import { service } from 'sdk';
import ConversationPageHeaderPresenter, {
  ConversationTypes,
} from '../ConversationPageHeaderPresenter';
import {
  groupModelFactory,
  personModelFactory,
} from '../../../../__tests__/factories';
import { ENTITY_NAME } from '@/store';
import { getEntity, getSingleEntity } from '@/store/utils';
const { AccountService } = service;

jest.mock('@/store/utils', () => {
  return {
    getEntity: jest.fn(),
    getSingleEntity: jest.fn(),
  };
});

const mockGetEntity = (entityName: string, impl: Function) => {
  (getEntity as jest.Mock).mockImplementation((en: string, id: number) => {
    if (en === entityName) {
      return impl(id);
    }
  });
};

const mockGetSingleEntity = (entityName: string, impl: Function) => {
  (getSingleEntity as jest.Mock).mockImplementation(
    (en: string, property: string) => {
      if (en === entityName) {
        return impl(property);
      }
    },
  );
};
let presenter: ConversationPageHeaderPresenter;
function initiatePresenter() {
  const mockAccountService = {
    getCurrentUserId: jest.fn().mockReturnValue(123),
  };
  AccountService.getInstance = jest.fn().mockReturnValue(mockAccountService);
  presenter = new ConversationPageHeaderPresenter(1);
}
describe('ConversationPageHeaderPresenter', () => {
  afterEach(() => {
    if (presenter) {
      presenter.dispose();
    }
  });
  describe('getConversationType', () => {
    it('should be Team conversation if isTeam = true', () => {
      mockGetEntity(ENTITY_NAME.GROUP, () => groupModelFactory.build({
        isTeam: true,
      }));
      initiatePresenter();
      expect(presenter.getConversationType()).toBe(ConversationTypes.TEAM);
    });

    it('should not be Team if isTeam = false', () => {
      mockGetEntity(ENTITY_NAME.GROUP, () => groupModelFactory.build({
        isTeam: false,
      }));
      initiatePresenter();
      expect(presenter.getConversationType()).not.toBe(ConversationTypes.TEAM);
    });

    it('should be Me conversation if has only one member and it is current user', () => {
      mockGetEntity(ENTITY_NAME.GROUP, () => groupModelFactory.build({
        members: [123],
      }));
      initiatePresenter();
      expect(presenter.getConversationType()).toBe(ConversationTypes.ME);
    });

    it('should NOT be Me conversation if has only one member and it is NOT current user', () => {
      mockGetEntity(ENTITY_NAME.GROUP, () => groupModelFactory.build({
        members: [1234],
      }));
      initiatePresenter();
      expect(presenter.getConversationType()).not.toBe(ConversationTypes.ME);
    });

    it('should be 1:1 conversation if has two members', () => {
      mockGetEntity(ENTITY_NAME.GROUP, () => groupModelFactory.build({
        members: [123, 1213],
      }));
      initiatePresenter();
      expect(presenter.getConversationType()).toBe(ConversationTypes.NORMAL_ONE_TO_ONE);
    });

    it('should be SMS conversation if has two members and one of them is pseudo', () => {
      (getEntity as jest.Mock).mockImplementation(
        (en: string, id: number) => {
          if (en === ENTITY_NAME.PERSON) {
            if (id === 1213) {
              return personModelFactory.build({
                isPseudoUser: true,
              });
            }
          }

          if (en === ENTITY_NAME.GROUP) {
            return groupModelFactory.build({
              members: [123, 1213],
            });
          }

          return null;
        },
      );
      initiatePresenter();
      expect(presenter.getConversationType()).toBe(ConversationTypes.SMS);
    });

    it('should be group conversation if has more than two members', () => {
      mockGetEntity(ENTITY_NAME.GROUP, () => groupModelFactory.build({
        members: [123, 1213, 888, 999],
      }));
      initiatePresenter();
      expect(presenter.getConversationType()).toBe(ConversationTypes.NORMAL_GROUP);
    });

    describe('groupIsInFavorites', () => {
      beforeAll(() => {
        mockGetSingleEntity(ENTITY_NAME.PROFILE, (property: string) => {
          if (property === 'favoriteGroupIds') {
            return [1, 3, 4, 5];
          }
          return null;
        });
      });
      it('should return true', () => {
        mockGetEntity(ENTITY_NAME.GROUP, () => groupModelFactory.build({ id: 1 }));
        initiatePresenter();
        expect(presenter.groupIsInFavorites()).toBe(true);
      });

      it('should return false', () => {
        mockGetEntity(ENTITY_NAME.GROUP, () => groupModelFactory.build({ id: 6 }));
        initiatePresenter();
        expect(presenter.groupIsInFavorites()).toBe(false);
      });
    });

    describe('getRightButtons', () => {
      it('should return correct array for TEAM type', () => {
        mockGetEntity(ENTITY_NAME.GROUP, () => groupModelFactory.build({
          isTeam: true,
        }));
        initiatePresenter();
        expect(presenter.getRightButtons()).toMatchObject([
          {
            name: 'audio conference',
          },
          {
            name: 'meeting',
          },
          {
            name: 'add member',
          },
        ]);
      });

      it('should return correct array for ME type', () => {
        mockGetEntity(ENTITY_NAME.GROUP, () => groupModelFactory.build({
          members: [123],
        }));
        initiatePresenter();
        expect(presenter.getRightButtons()).toEqual([]);
      });

      it('should return correct array for 1:1 type', () => {
        mockGetEntity(ENTITY_NAME.GROUP, () => groupModelFactory.build({
          members: [123, 345],
        }));
        initiatePresenter();
        expect(presenter.getRightButtons()).toMatchObject([
          {
            name: 'call',
          },
          {
            name: 'meeting',
          },
          {
            name: 'add member',
          },
        ]);
      });

      it('should return correct array for group type', () => {
        mockGetEntity(ENTITY_NAME.GROUP, () => groupModelFactory.build({
          members: [123, 345, 678],
        }));
        initiatePresenter();
        expect(presenter.getRightButtons()).toMatchObject([
          {
            name: 'audio conference',
          },
          {
            name: 'meeting',
          },
          {
            name: 'add member',
          },
        ]);
      });

    });
  });
});
