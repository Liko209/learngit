import ConversationSectionPresenter from '../ConversationSectionPresenter';
import { GROUP_QUERY_TYPE, ENTITY } from 'sdk/service';

import { transformGroupSortKey } from '../../transformFunc';
import { getEntity, getSingleEntity } from '@/store/utils';

jest.mock('@/store/utils', () => {
  return {
    getEntity: jest.fn(),
    getSingleEntity: jest.fn(),
  };
});

const mockGetSingleEntity = (entityName: string, impl: Function) => {
  (getSingleEntity as jest.Mock).mockImplementation(
    (en: string, property: string) => {
      if (en === entityName) {
        return impl(property);
      }
    },
  );
};
const mockGetEntity = (entityName: string, impl: Function) => {
  (getEntity as jest.Mock).mockImplementation((en: string, id: number) => {
    if (en === entityName) {
      return impl(id);
    }
  });
};
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
