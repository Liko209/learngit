/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-26 16:19:02
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '../../../../../store/utils';
import { MemberListHeaderViewModel } from '../MemberListHeader.ViewModel';
const memberListHeaderVM = new MemberListHeaderViewModel();

jest.mock('../../../../../store/utils');

describe('MemberListHeaderViewModel', () => {
  it('should return members length if group id provided', () => {
    (getEntity as jest.Mock).mockReturnValue({ members: [123, 345, 677, 90023] });
    expect(memberListHeaderVM.counts).toBe(4);
  });
});
