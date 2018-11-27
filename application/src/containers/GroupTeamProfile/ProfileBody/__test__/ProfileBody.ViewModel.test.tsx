/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-24 22:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '../../../../store/utils';
import React from 'react';
import { shallow } from 'enzyme';
import { ProfileBody } from '..';
jest.mock('../../../../store/utils');
import { ProfileBodyViewModel } from '../ProfileBody.ViewModel';

const profileBodyVM = new ProfileBodyViewModel();

const destroy = function () {};
describe('ProfileBodyViewModel', () => {
  beforeEach(() => {
    const wrapper = shallow(<ProfileBody id={8839174} destroy={destroy} />);
    wrapper.setProps({ id: 8839174 });
  })
  it('should return displayName if team/group id provided', () => {
    (getEntity as jest.Mock).mockReturnValue({
      displayName: 'test',
    });
    expect(profileBodyVM.displayName).toBe('test');
  });
  it('should return description if team/group id provided', () => {
    (getEntity as jest.Mock).mockReturnValue({
      description: 'description',
    });
    expect(profileBodyVM.description).toBe('description');
  });
});
