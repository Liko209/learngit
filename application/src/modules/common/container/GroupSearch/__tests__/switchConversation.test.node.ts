/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-08-25 23:23:15
 * Copyright © RingCentral. All rights reserved.
 */

import { testable, test } from 'shield';
import { Dialog } from '@/containers/Dialog';
import {
  switchConversationHandler,
  switchToConversation,
} from '../switchConversationHandler';
import portalManager from '@/common/PortalManager';
import { goToConversation } from '@/common/goToConversation';

jest.mock('@/common/goToConversation');

describe('switch conversation handler', () => {
  @testable
  class openGroupSearch {
    @test('should open group search when called')
    t1() {
      jest.spyOn(Dialog, 'simple').mockReturnValue({ dismiss: () => {} });
      switchConversationHandler();
      expect(Dialog.simple).toHaveBeenCalled();
    }

    @test('should not open GroupSearch when it has been opened')
    t2() {
      jest.spyOn(Dialog, 'simple').mockReturnValue({ dismiss: () => {} });
      jest.spyOn(portalManager, 'isOpened').mockReturnValue(true);
      switchConversationHandler();
      expect(Dialog.simple).not.toHaveBeenCalled();
    }

    @test(
      'should close dialog and call gotoConversation when call switchToConversation()',
    )
    async t3() {
      const conversationId = 123;
      jest.spyOn(portalManager, 'dismissLast').mockImplementation(jest.fn());
      switchToConversation({ id: conversationId });
      expect(portalManager.dismissLast).toHaveBeenCalled();
      setTimeout(() => {
        expect(goToConversation).toHaveBeenCalled();
      });
    }
  }
});
