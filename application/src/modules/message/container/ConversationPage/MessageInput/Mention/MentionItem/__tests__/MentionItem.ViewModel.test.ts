/*
 * @Author: ken.li
 * @Date: 2019-07-26 17:59:25
 * Copyright © RingCentral. All rights reserved.
 */

import { testable, test } from 'shield';
import { GlipTypeUtil } from 'sdk/utils';
import { MentionItemViewModel } from '../MentionItem.ViewModel';

describe('MentionViewModel', () => {
  @testable
  class isTeam {
    @test('should return true if id is Team ID')
    t1() {
      const mentionItemViewModel = new MentionItemViewModel();
      GlipTypeUtil.extractTypeId = jest.fn().mockImplementation(() => 6);
      expect(mentionItemViewModel.isTeam).toBeTruthy();
    }
    @test('should return false if id is NOT Team ID')
    t2() {
      const mentionItemViewModel = new MentionItemViewModel();
      GlipTypeUtil.extractTypeId = jest.fn().mockImplementation(() => 3);
      expect(mentionItemViewModel.isTeam).toBeFalsy();
    }
  }
});
