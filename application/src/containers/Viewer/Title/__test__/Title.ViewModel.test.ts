/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-03-07 10:40:55
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '../../../../store/utils';
import { ViewerTitleViewModel } from '../Title.ViewModel';
import { ViewerTitleViewModelProps } from '../types';
jest.mock('../../../../store/utils');
const props: ViewerTitleViewModelProps = {
  groupId: 1,
  itemId: 1,
  type: 1,
  init: jest.fn(),
  currentItemId: 1,
  currentIndex: 1,
  total: 1,
  ids: [],
  updateCurrentItemIndex: jest.fn(),
  loadMore: jest.fn(),
  setOnCurrentItemDeletedCb: jest.fn(),
  getCurrentItemId: jest.fn(),
  getCurrentIndex: jest.fn(),
  setOnItemSwitchCb: jest.fn(),
  switchToPrevious: jest.fn(),
  switchToNext: jest.fn(),
  hasPrevious: true,
  hasNext: true,
};

describe('TitleViewModel', () => {
  beforeAll(() => {
    jest.resetAllMocks();
  });
  describe('item()', () => {
    it('should be return Item info when call item()', () => {
      const vm = new ViewerTitleViewModel(props);
      (getEntity as jest.Mock).mockReturnValue({ itemId: 1 });
      expect(vm.item).toEqual({ itemId: 1 });
    });
  });
  describe('person()', () => {
    it('should be return person info when call person() and newestCreatorId exist', () => {
      const vm = new ViewerTitleViewModel(props);
      (getEntity as jest.Mock).mockImplementation((type: string) =>
        type === 'person' ? { personId: 1 } : { newestCreatorId: 1 },
      );
      expect(vm.person).toEqual({ personId: 1 });
    });
    it('should be return null when call person() and newestCreatorId not exist', () => {
      const vm = new ViewerTitleViewModel(props);
      (getEntity as jest.Mock).mockImplementation((type: string) =>
        type === 'person' ? { personId: 1 } : {},
      );
      expect(vm.person).toEqual({});
    });
  });
});
