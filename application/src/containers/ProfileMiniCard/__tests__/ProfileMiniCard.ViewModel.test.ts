/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-26 20:14:55
 * Copyright © RingCentral. All rights reserved.
 */

import { ProfileMiniCardViewModel } from '../ProfileMiniCard.ViewModel';
import { TypeDictionary } from 'sdk/utils';

describe('Profile mini card view model', () => {
  it('should be a team conversation', () => {
    const vm = new ProfileMiniCardViewModel({ id: 11370502 });
    expect(vm.type).toBe(TypeDictionary.TYPE_ID_TEAM);
  });

  it('should be a group conversation', () => {
    const vm = new ProfileMiniCardViewModel({ id: 14974978 });
    expect(vm.type).toBe(TypeDictionary.TYPE_ID_GROUP);
  });

  it('should be a person type', () => {
    const vm = new ProfileMiniCardViewModel({ id: 2514947 });
    expect(vm.type).toBe(TypeDictionary.TYPE_ID_PERSON);
  });
});
