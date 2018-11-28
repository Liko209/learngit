/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-11-26 21:04:09
 * Copyright © RingCentral. All rights reserved.
 */

import { isValidEmailAddress } from '../regexUtils';

describe('regexUtils', () => {
  describe('valid email', () => {
    type ty = {
      key: string;
      isValid: boolean;
    };
    it('should return right status of each email', () => {
      const emailAndValid: ty[] = [
        { key: 'hjkl', isValid: false },
        { key: '@ringcentral.com', isValid: false },
        { key: 'text@ringcentral.c', isValid: false },
        { key: 'text@ringcentral@ringcentral.c', isValid: false },
        { key: 'text%ringcentral@ringcentral.c', isValid: false },
        { key: 'Test()@ringcentral.com', isValid: false },
        { key: 'Test()@ringcentral', isValid: false },

        { key: 'text@ringcentral.com', isValid: true },
        { key: 'text@ringcentral.mobile', isValid: true },
        { key: 'text_test123@ringcentral.mobile', isValid: true },
        {
          key: "TESTtest123.!#$%&'*+/=?^_`{|}~-@ringcentral.com",
          isValid: true,
        },
        {
          key: "TESTtest123.!#$%&'*+/=?^_`{|}~-@ringcentral.COM123com456",
          isValid: true,
        },
        {
          key: "TESTtest123.!#$%&'*+/=?^_`{|}~-@ringcentral.COM-123-com-456",
          isValid: true,
        },
        { key: "john.o'connor@weidner.com", isValid: true },
        {
          key: 'disposable.style.email.with+symbol@example.com',
          isValid: true,
        },
        {
          key:
            "TESTtest123.!#$%&'*+/=?^_`{|}~-@ringcentral.COM-123-com-456.123.com.cn.hello.world",
          isValid: true,
        },
        { key: 'example@s.solutions', isValid: true },
        { key: "a.as'jk1KS#$%^&&*+123@acme.com", isValid: true },
        { key: "as'jk1KS#$%^&&*+123@acme.com", isValid: true },
      ];
      emailAndValid.forEach(element => {
        expect(isValidEmailAddress(element.key)).toBe(element.isValid);
      });
    });
  });
});
