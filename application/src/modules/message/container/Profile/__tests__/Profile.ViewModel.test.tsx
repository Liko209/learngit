/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-26 20:14:55
 * Copyright © RingCentral. All rights reserved.
 */

import { ProfileViewModel } from '../Profile.ViewModel';
import { PROFILE_TYPE } from '../types';
import { TypeDictionary } from 'sdk/utils';

describe('Profile view model', () => {
  it('should be a team typeId', () => {
    const vm = new ProfileViewModel({
      id: 11370502,
      type: PROFILE_TYPE.MINI_CARD,
    });
    expect(vm.type).toBe(PROFILE_TYPE.MINI_CARD);
    expect(vm.typeId).toBe(TypeDictionary.TYPE_ID_TEAM);
  });

  it('should be a group typeId', () => {
    const vm = new ProfileViewModel({
      id: 14974978,
      type: PROFILE_TYPE.MINI_CARD,
    });
    expect(vm.type).toBe(PROFILE_TYPE.MINI_CARD);
    expect(vm.typeId).toBe(TypeDictionary.TYPE_ID_GROUP);
  });

  it('should be a person typeId', () => {
    const vm = new ProfileViewModel({
      id: 2514947,
      type: PROFILE_TYPE.MINI_CARD,
    });
    expect(vm.type).toBe(PROFILE_TYPE.MINI_CARD);
    expect(vm.typeId).toBe(TypeDictionary.TYPE_ID_PERSON);
  });
});
