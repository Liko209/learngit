/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-11-26 13:13:19
 * Copyright © RingCentral. All rights reserved.
 */

const mailRegexTest = /[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@([A-Za-z0-9-]+.)+[A-Za-z0-9-]{2,}/;

export function isValidEmailAddress(email: string) {
  return mailRegexTest.test(email);
}
