/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-29 13:22:02
 * Copyright © RingCentral. All rights reserved.
 */

import { MoreViewModel } from '../More.ViewModel';
import { service } from 'sdk';

const { GroupService } = service;

const groupService = {
  getGroupEmail: jest.fn(),
};

GroupService.getInstance = jest.fn().mockResolvedValue(groupService);

const props = {
  id: 123,
};

const vm = new MoreViewModel(props);

describe('More.ViewModel', () => {
  it('should be get route url when invoke class instance property url [JPT-405]', () => {
    const url = `${window.location.origin}/messages/${props.id}`;
    expect(vm.url).toBe(url);
  });

  it('should be get conversation email when invoke class instance property email [JPT-405]', () => {
    const EMAIL = 'EMAIL';
    groupService.getGroupEmail = jest.fn().mockResolvedValueOnce(EMAIL);
    expect(vm.getEmail()).resolves.toBe(EMAIL);
  });
});
