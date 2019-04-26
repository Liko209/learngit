/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-09 10:01:24
 * Copyright © RingCentral. All rights reserved.
 */
import { ItemListViewModel } from '../ItemList.ViewModel';
import { RIGHT_RAIL_ITEM_TYPE } from '../constants';

describe('ItemListViewModel', () => {
  describe('mobx reaction', () => {
    it('should dispose old listHandler and build a new listHandler when groupId change', () => {
      const vm = new ItemListViewModel({
        groupId: 1,
        type: RIGHT_RAIL_ITEM_TYPE.NOT_IMAGE_FILES,
        active: true,
        width: 100,
        height: 100,
      });
      const oldListHandler = vm.listHandler;
      jest.spyOn(oldListHandler, 'dispose');
      vm.props.groupId = 2;

      expect(oldListHandler.dispose).toBeCalled();
      expect(vm.listHandler).not.toBe(oldListHandler);
    });
  });
});
