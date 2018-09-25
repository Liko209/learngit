import ConversationSectionPresenter from '../ConversationSectionPresenter';
import { GROUP_QUERY_TYPE, ENTITY } from 'sdk/service';

import { transformGroupSortKey } from '../../transformFunc';

jest.mock('@/store/utils', () => {
  return {
    getEntity: jest.fn(),
    getSingleEntity: jest.fn(),
  };
});

describe('ConversationSectionPresenter', () => {
  let presenter: ConversationSectionPresenter;
  beforeAll(() => {
    presenter = new ConversationSectionPresenter({
      queryType: GROUP_QUERY_TYPE.GROUP,
      entity: ENTITY.PEOPLE_GROUPS,
      transformFunc: transformGroupSortKey,
    });
  });
  describe('calculateUmi', () => {
    it('should return unread count if isTeam=false', () => {
      expect(presenter.calculateUmi()).toEqual({
        important: false,
        unreadCount: 0,
      });
    });
  });
});
