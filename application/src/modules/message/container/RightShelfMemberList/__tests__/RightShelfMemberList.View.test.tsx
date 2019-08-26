/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-07-29 17:56:52
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { shallow } from 'enzyme';
import { mountWithTheme } from 'shield/utils';
import { RightShelfMemberListView } from '../RightShelfMemberList.View';
import { OpenProfile } from '@/common/OpenProfile';
import JuiLink from 'jui/components/Link';
import { JuiIconButton } from 'jui/components/Buttons';
import { NewConversation } from '@/containers/NewConversation';
import { Dialog } from '@/containers/Dialog';
import { CONVERSATION_TYPES } from '@/constants';
import GroupModel from '@/store/models/Group';

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
jest.mock('../../MiniCard', () => ({
  MiniCard: {
    show: jest.fn(),
  },
}));
jest.mock('@/containers/Dialog', () => ({
  Dialog: {
    simple: jest.fn(),
  },
  withEscTracking: jest.fn(),
}));
jest.mock('../../Profile/Dialog/Group/Content/AddMembers', () => ({
  AddMembers: () => 'Add Member Dialog',
}));

const props = {
  init: jest.fn(),
  groupId: 123,
  group: {
    type: CONVERSATION_TYPES.TEAM,
  } as GroupModel,
  membersData: {
    isLoading: false,
    fullMemberLen: 0,
    fullGuestLen: 0,
    shownMemberIds: [],
    shownGuestIds: [],
    personNameMap: {},
  },
  shouldShowLink: true,
  allMemberLength: 0,
  isTeam: false,
  personNameMap: {},
  setWrapperWidth: jest.fn(),
  t: (str: string) => str,
  shouldHide: false,
  loadingH: 100,
  dispose: jest.fn(),
  canAddMembers: true,
};
let wrapper;
describe('RightShelfMemberList.View', () => {
  it('should return null if shouldHide is true', () => {
    wrapper = shallow(<RightShelfMemberListView {...props} shouldHide />);
    expect(wrapper.type()).toBe(null);
  });

  it('should call observer.observe if shouldHide change from true to false', () => {
    const mountedWrapper = mountWithTheme(
      <RightShelfMemberListView {...props} shouldHide />,
    );
    const instance = mountedWrapper.find(RightShelfMemberListView).instance();
    instance._resizeObserver.observe = jest.fn();
    mountedWrapper.setProps({
      children: <RightShelfMemberListView {...props} shouldHide={false} />,
    });
    expect(instance._resizeObserver.observe).toHaveBeenCalled();
  });

  it('should call observer.disconnect if shouldHide change from false to true', () => {
    // jest.spyOn()
    const mountedWrapper = mountWithTheme(
      <RightShelfMemberListView {...props} shouldHide={false} />,
    );

    const instance = mountedWrapper.find(RightShelfMemberListView).instance();
    expect(instance._resizeObserver.observe).toHaveBeenCalled();
    instance._resizeObserver.disconnect = jest.fn();
    mountedWrapper.setProps({
      children: <RightShelfMemberListView {...props} shouldHide />,
    });
    expect(instance._resizeObserver.disconnect).toHaveBeenCalled();
  });

  it('should NOT render link according to shouldShowLink [JPT-2658]', () => {
    wrapper = shallow(<RightShelfMemberListView {...props} shouldShowLink={true} />);
    expect(wrapper.find(JuiLink).exists()).toBe(true);

    wrapper = shallow(<RightShelfMemberListView {...props} shouldShowLink={false} />);
    expect(wrapper.find(JuiLink).exists()).toBe(false);
  });

  it('should open profile dialog when click the link button', () => {
    wrapper = shallow(<RightShelfMemberListView {...props} shouldShowLink={true}  />);
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
