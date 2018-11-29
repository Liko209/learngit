/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-26 16:19:02
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity, getGlobalValue } from '../../../../../store/utils';
import { MemberListHeaderViewModel } from '../MemberListHeader.ViewModel';
const memberListHeaderVM = new MemberListHeaderViewModel();

jest.mock('../../../../../store/utils');

describe('MemberListHeaderViewModel', () => {
  it('should computed members length if members id changed', () => {
    (getEntity as jest.Mock).mockReturnValue({ members: [123, 345, 677, 90023] });
    expect(memberListHeaderVM.counts).toBe(4);
    (getEntity as jest.Mock).mockReturnValue({ members: [123] });
    expect(memberListHeaderVM.counts).toBe(1);
  });
  it('should computed isShowHeaderShadow while global value changed', () => {
    (getGlobalValue as jest.Mock).mockReturnValue(true);
    expect(memberListHeaderVM.isShowHeaderShadow).toBe(true);
  });
});
