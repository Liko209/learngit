/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-29 13:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { ProfileHeaderViewModel } from '../ProfileHeader.ViewModel';

const profileHeaderVM = new ProfileHeaderViewModel();
const ID_1 = 12034054;
const ID_2 = 87656782;
const TITLE_1 = 'name1';
const TITLE_2 = 'name 2';
describe('ProfileHeaderViewModel', () => {
  it('should computed groupId while id changed', () => {
    profileHeaderVM.props.id = ID_1;
    expect(profileHeaderVM.id).toEqual(ID_1);
    profileHeaderVM.props.id = ID_2;
    expect(profileHeaderVM.id).toEqual(ID_2);
  });
  it('should computed title while title changed', () => {
    profileHeaderVM.props.title = TITLE_1;
    expect(profileHeaderVM.title).toEqual(TITLE_1);
    profileHeaderVM.props.title = TITLE_2;
    expect(profileHeaderVM.title).toEqual(TITLE_2);
  });
});
