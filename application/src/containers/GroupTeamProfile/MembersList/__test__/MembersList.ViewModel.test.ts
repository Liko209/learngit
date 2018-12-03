/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-26 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { MembersListViewModel } from '../MembersList.ViewModel';
jest.mock('../../../../store/utils');

const membersListVM = new MembersListViewModel({ id: 123 });
const ID_1 = 23121;
const ID_2 = 56789;

const twentyItems: number[] = [];
for (let i = 0; i < 20; i++) {
  twentyItems[i] = i;
}

describe('MembersListViewModel', () => {
  it('should computed gid while id changed', () => {
    membersListVM.props.id = ID_1;
    expect(membersListVM.gid).toEqual(ID_1);
    membersListVM.props.id = ID_2;
    expect(membersListVM.gid).toEqual(ID_2);
  });
  it('should return memberIds if get group id', () => {
    jest.spyOn<MembersListViewModel, any>(membersListVM, 'memberIds', 'get').mockReturnValue(twentyItems);

    expect(membersListVM.memberIds).toMatchObject(twentyItems);
  });
});
