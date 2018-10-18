import storeManager from '../../../../store';
import { SectionViewModel } from '../Section.ViewModel';
import { SECTION_TYPE } from '../types';

jest.mock('../../../../store/base/fetch');

describe('SectionViewModel', () => {
  describe('updateGlobalGroups()', () => {
    it('should update groupIds in globalStore', async () => {
      const groupIds = [1, 2, 3];

      const vm = new SectionViewModel();
      Object.assign(vm, {
        _config: { queryType: SECTION_TYPE.FAVORITE },
        _listHandler: {
          sortableListStore: {
            getIds: jest
              .fn()
              .mockName('vm._listHandler.sortableListStore.getIds()')
              .mockReturnValue(groupIds),
          },
        },
      });

      await vm.updateGlobalGroups();

      const globalStore = storeManager.getGlobalStore();
      expect(globalStore.get(SECTION_TYPE.FAVORITE)).toEqual([1, 2, 3]);
    });
  });
});
