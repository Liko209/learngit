/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-29 13:22:02
 * Copyright © RingCentral. All rights reserved.
 */

import { MoreViewModel } from '../More.ViewModel';
import { ServiceLoader } from 'sdk/module/serviceLoader';

const groupService = {
  getGroupEmail: jest.fn(),
};

ServiceLoader.getInstance = jest.fn().mockReturnValue(groupService);

const props = {
  id: 123,
};

const vm = new MoreViewModel(props);

describe('MoreViewModel', () => {
  describe('url', () => {
    it('should be get route url when invoke class instance property url [JPT-405]', () => {
      const url = `${window.location.origin}/messages/${props.id}`;
      expect(vm.url).toBe(url);
    });
  });

  describe('email', () => {
    it('should be get conversation email when invoke class instance property email [JPT-405]', () => {
      const EMAIL = 'EMAIL';
      groupService.getGroupEmail = jest.fn().mockResolvedValueOnce(EMAIL);
      expect(vm.getEmail()).resolves.toBe(EMAIL);
    });
  });
});
