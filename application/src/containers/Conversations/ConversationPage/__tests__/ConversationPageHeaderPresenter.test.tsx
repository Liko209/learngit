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
describe('ConversationPageHeaderPresenter', () => {
  let presenter: ConversationPageHeaderPresenter;
  beforeAll(() => {
    const mockAccountService = {
      getCurrentUserId: jest.fn().mockReturnValue(123),
    };
    AccountService.getInstance = jest.fn().mockReturnValue(mockAccountService);
    presenter = new ConversationPageHeaderPresenter();
  });
  describe('getConversationType', () => {
    it('should be Team conversation if isTeam = true', () => {
      expect(
        presenter.getConversationType(
          groupModelFactory.build({
            isTeam: true,
          }),
        ),
      ).toBe(ConversationTypes.TEAM);
    });

    it('should not be Team if isTeam = false', () => {
      expect(
        presenter.getConversationType(
          groupModelFactory.build({
            isTeam: false,
          }),
        ),
      ).not.toBe(ConversationTypes.TEAM);
    });

    it('should be Me conversation if has only one member and it is current user', () => {
      expect(
        presenter.getConversationType(
          groupModelFactory.build({
            members: [123],
          }),
        ),
      ).toBe(ConversationTypes.ME);
    });

    it('should NOT be Me conversation if has only one member and it is NOT current user', () => {
      expect(
        presenter.getConversationType(
          groupModelFactory.build({
            members: [1234],
          }),
        ),
      ).not.toBe(ConversationTypes.ME);
    });

    it('should be 1:1 conversation if has two members', () => {
      expect(
        presenter.getConversationType(
          groupModelFactory.build({
            members: [123, 1213],
          }),
        ),
      ).toBe(ConversationTypes.NORMAL_ONE_TO_ONE);
    });

    it('should be SMS conversation if has two members and one of them is pseudo', () => {
      mockGetEntity(ENTITY_NAME.PERSON, (id: number) => {
        if (id === 1213) {
          return personModelFactory.build({
            isPseudoUser: true,
          });
        }
        return null;
      });
      expect(
        presenter.getConversationType(
          groupModelFactory.build({
            members: [123, 1213],
          }),
        ),
      ).toBe(ConversationTypes.SMS);
    });

    it('should be group conversation if has more than two members', () => {
      expect(
        presenter.getConversationType(
          groupModelFactory.build({
            members: [123, 1213, 888, 999],
          }),
        ),
      ).toBe(ConversationTypes.NORMAL_GROUP);
    });
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
      expect(
        presenter.groupIsInFavorites(groupModelFactory.build({ id: 1 })),
      ).toBe(true);
    });

    it('should return false', () => {
      expect(
        presenter.groupIsInFavorites(groupModelFactory.build({ id: 6 })),
      ).toBe(false);
    });
  });
});
