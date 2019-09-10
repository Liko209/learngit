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
  getDefaultList,
} from '../switchConversationHandler';
import portalManager from '@/common/PortalManager';
import { goToConversationWithLoading } from '@/common/goToConversation';
import { isDialogOpen } from '@/containers/Dialog/utils';
import { mockService } from 'shield/sdk';
import { ServiceConfig } from 'sdk/module/serviceLoader';
import prettyFormat from 'pretty-format';

jest.mock('@/containers/Dialog/utils');
jest.mock('@/common/goToConversation');

describe('switch conversation handler', () => {
  const searchService = {
    name: ServiceConfig.SEARCH_SERVICE,
    doFuzzySearchAllGroups() {},
  };
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
      (isDialogOpen as jest.Mock) = jest.fn(() => true);
      switchConversationHandler();
      expect(Dialog.simple).not.toHaveBeenCalled();
    }

    @test(
      'should close all dialog and call gotoConversationWithLoading when call switchToConversation()',
    )
    async t3() {
      const conversationId = 123;
      jest.spyOn(portalManager, 'dismissAll').mockImplementation(jest.fn());
      switchToConversation({ id: conversationId });
      expect(portalManager.dismissAll).toHaveBeenCalled();
      setTimeout(() => {
        expect(goToConversationWithLoading).toHaveBeenCalled();
      });
    }

    @(test.each`
      isThereDialogOpen | isMeOpen | expected
      ${true}           | ${true}  | ${false}
      ${true}           | ${false} | ${true}
      ${false}          | ${true}  | ${false}
      ${false}          | ${false} | ${false}
    `('should have correct return value when called'))
    t4({ isThereDialogOpen, isMeOpen, expected }) {
      jest.spyOn(Dialog, 'simple').mockReturnValue({ dismiss: () => {} });
      jest.spyOn(portalManager, 'isOpened').mockReturnValue(isMeOpen);
      (isDialogOpen as jest.Mock) = jest.fn(() => isThereDialogOpen);
      expect(switchConversationHandler()).toBe(expected);
    }

    @test(
      'should call searchService.doFuzzySearchAllGroups correctly when called',
    )
    @mockService(searchService, 'doFuzzySearchAllGroups')
    async getDefaultListTest() {
      searchService.doFuzzySearchAllGroups = jest.fn(() => []);
      await getDefaultList();
      expect(
        prettyFormat(searchService.doFuzzySearchAllGroups.mock.calls[0]),
      ).toMatchSnapshot();
    }
  }
});
