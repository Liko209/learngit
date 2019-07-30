/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-07-29 17:56:52
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { shallow } from 'enzyme';
import { RightShelfMemberListView } from '../RightShelfMemberList.View';
import { OpenProfile } from '@/common/OpenProfile';
import JuiLink from 'jui/components/Link';
import { JuiIconButton } from 'jui/components/Buttons';
import { NewConversation } from '@/containers/NewConversation';
import { Dialog } from '@/containers/Dialog';

jest.mock('resize-observer-polyfill');
jest.mock('@/containers/NewConversation', () => ({
  NewConversation: {
    key: 1,
    dismiss: jest.fn(),
    show: jest.fn(),
  },
}));
jest.mock('@/containers/ConvertToTeam', () => 'ConvertToTeam');
jest.mock('@/common/OpenProfile', () => ({
  OpenProfile: {
    show: jest.fn(),
  },
}));
jest.mock('@/containers/Dialog', () => ({
  Dialog: {
    simple: jest.fn(),
  },
}));
jest.mock('../../Profile/Dialog/Group/Content/AddMembers', () => ({
  AddMembers: () => 'Add Member Dialog',
}));

const props = {
  groupId: 123,
  group: {},
  isLoading: false,
  fullMemberIds: [],
  fullGuestIds: [],
  shownMemberIds: [],
  shownGuestIds: [],
  allMemberLength: 0,
  isTeam: false,
  personNameMap: {},
  setWrapperWidth: jest.fn(),
  t: (str: string) => str,
};
let wrapper;
describe('RightShelfMemberList.View', () => {
  it('should open profile dialog when click the link button', () => {
    wrapper = shallow(<RightShelfMemberListView {...props} />);
    wrapper
      .find(JuiLink)
      .shallow()
      .find('a')
      .childAt(0)
      .simulate('click');
    expect(OpenProfile.show).toHaveBeenCalled();
  });
  it('should show add member dialog', () => {
    wrapper = shallow(<RightShelfMemberListView {...props} />);
    wrapper.find(JuiIconButton).simulate('click');
    expect(NewConversation.show).toHaveBeenCalled();

    wrapper = shallow(<RightShelfMemberListView {...props} isTeam />);
    wrapper.find(JuiIconButton).simulate('click');
    expect(Dialog.simple).toHaveBeenCalled();
  });
});
