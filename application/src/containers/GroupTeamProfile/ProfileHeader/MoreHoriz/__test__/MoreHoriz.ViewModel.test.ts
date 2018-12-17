/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-29 13:22:02
 * Copyright © RingCentral. All rights reserved.
 */
import { MoreHorizViewModel } from '../MoreHoriz.ViewModel';
import { service } from 'sdk';
const { GroupService } = service;
const groupService = {
  getGroupEmail: jest.fn(),
};
GroupService.getInstance = jest.fn().mockResolvedValue(groupService);

const moreVM = new MoreHorizViewModel();
describe('MoreHorizViewModel', () => {
  it('should computed groupUrl while id changed', () => {
    moreVM.props.id = 456789;
    expect(moreVM.groupUrl).toBe('http://localhost/messages/456789');
    moreVM.props.id = 123456;
    expect(moreVM.groupUrl).toBe('http://localhost/messages/123456');
  });
});
