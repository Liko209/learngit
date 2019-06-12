/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-30 09:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { FileActionViewModel } from '../FIleAction.ViewModel';
import { getEntity } from '../../../../../store/utils';

jest.mock('../../../../../store/utils');

describe('FileActionViewModel', () => {
  describe('item()', () => {
    it('should be return item', () => {
      const item = { name: '12' };
      const vm = new FileActionViewModel();
      (getEntity as jest.Mock).mockReturnValue(item);
      expect(vm.item).toEqual(item);
    });
  });
  describe('fileName()', () => {
    it('should be return fileName', () => {
      const item = { name: '12' };
      const vm = new FileActionViewModel();
      (getEntity as jest.Mock).mockReturnValue(item);
      expect(vm.fileName).toEqual('12');
    });
  });
  describe('post()', () => {
    it('should be return post data when has postId', () => {
      const vm = new FileActionViewModel({ postId: 1, fileId: 2 });
      vm.post;
      expect(getEntity).toBeCalled();
    });
    it('should be return null when has postId', () => {
      const vm = new FileActionViewModel();
      expect(vm.post).toEqual(null);
    });
  });
});
