/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-29 12:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { ProfileButtonViewModel } from '../ProfileButton.ViewModel';

const profileVM = new ProfileButtonViewModel({ id: 1234 });
const id1 = 67890;
describe('ProfileButtonViewModel', () => {
  it('should computed id while id changed', () => {
    profileVM.props.id = id1;
    expect(profileVM.id).toBe(id1);
  });
});
