/*
 * @Author: Spike.Yang
 * @Date: 2019-08-27 08:54:37
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { shallow } from 'enzyme';
import { ConferenceView } from '../Conference.View';
import { JuiAudioConferenceJoin } from 'jui/pattern/ConversationItemCard/ConversationItemCardBody';
import { PhoneLink } from '../../PhoneLink';

describe('AudioConference.View', () => {
  const props = {
    conference: {
      hostCode: '1',
      participantCode: '2',
    },
    isHostByMe: true,
    phoneNumber: '123',
    globalNumber: '1',
    canUseConference: {
      get: jest.fn().mockReturnValue(true),
    },
    joinAudioConference: jest.fn(),
    disabled: false,
  } as any;

  it('Should NOT show [Join] button and link if login user has no WebRTC permission. [JPT-2749]', () => {
    const wrapper = shallow(
      <ConferenceView {...props} canUseConference={false} />,
    );

    const phoneLink = wrapper.find(PhoneLink);
    expect(wrapper.find(JuiAudioConferenceJoin).exists()).toBe(false);
    expect(phoneLink.exists()).toBe(true);
    expect(phoneLink.props().canUseConference).toBeFalsy();
    expect(phoneLink.props().type).toBe('conference');
    expect(phoneLink.props().text).toBe('123');
    expect(phoneLink.props().handleClick).toBeDefined();
  });

  it('Should show [Join] button and link if login user has WebRTC permission. [JPT-2750]', () => {
    const wrapper = shallow(<ConferenceView {...props} canUseConference />);
    const phoneLink = wrapper.find(PhoneLink);

    expect(wrapper.find(JuiAudioConferenceJoin).exists()).toBe(true);
    expect(phoneLink.exists()).toBe(true);
    expect(phoneLink.props().canUseConference).toBeTruthy();
    expect(phoneLink.props().type).toBe('conference');
    expect(phoneLink.props().text).toBe('123');
    expect(phoneLink.props().handleClick).toBeDefined();
  });

  it('[Join] button and dial-in number are disabled when user is already making a call(inbound/outbound) [JPT-2897]', () => {
    props.disabled = true;
    const wrapper = shallow(<ConferenceView {...props} />);
    const phoneLink = wrapper.find(PhoneLink);
    const juiAudioConferenceJoin = wrapper.find(JuiAudioConferenceJoin);

    expect(juiAudioConferenceJoin.props().disabled).toBeTruthy();
    expect(phoneLink.props().canUseConference).toBeFalsy();
  });
});
