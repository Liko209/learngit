/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-21 20:03:29
 * Copyright © RingCentral. All rights reserved.
 */
import { test, testable } from 'shield';

import { ContactTabRouterViewModel } from '../ContactTabRouter.ViewModel';
import { IContactStore } from '@/modules/contact/interface';

jest.mock('@/modules/contact/interface');

describe('ContactTabRouterViewModel', () => {
  @testable
  class updateCurrentUrl {
    @IContactStore _contactStore: IContactStore;

    @test('should update current url if setCurrent url')
    t1() {
      const contactTabRouterViewModel = new ContactTabRouterViewModel();
      contactTabRouterViewModel.updateCurrentUrl('sss');
      expect(this._contactStore.setCurrentUrl).toHaveBeenCalled();
    }
  }
});
