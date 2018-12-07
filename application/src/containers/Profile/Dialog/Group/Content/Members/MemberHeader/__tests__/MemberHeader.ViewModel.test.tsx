/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-12-06 16:57:29
 * Copyright © RingCentral. All rights reserved.
 */

import storeManager from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import { MemberHeaderViewModel } from '../MemberHeader.ViewModel';

const globalStore = storeManager.getGlobalStore();

const props = {
  id: 1,
  dismiss: jest.fn(),
};
const vm = new MemberHeaderViewModel(props);

describe('MemberHeader.ViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be get correct boolean value when invoke class instance property hasShadow', () => {
    globalStore.set(GLOBAL_KEYS.IS_SHOW_MEMBER_LIST_HEADER_SHADOW, true);
    expect(vm.hasShadow).toEqual(true);
    globalStore.set(GLOBAL_KEYS.IS_SHOW_MEMBER_LIST_HEADER_SHADOW, false);
    expect(vm.hasShadow).toEqual(false);
  });
});
