/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-08-22 14:44:54
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { shallow } from 'enzyme';
import { AudioConferenceView } from '../AudioConference.View';
import { JuiProfileDialogContentSummaryButton } from 'jui/pattern/Profile/Dialog';
import { JuiIconButton } from 'jui/components/Buttons';
import portalManager from '@/common/PortalManager';

describe('AudioConference.View', () => {
  const props = {
    groupId: 123,
    showIcon: {
      get: jest.fn().mockReturnValue(true),
    },
    startAudioConference: jest.fn(),
  };

  it('it not render if showIcon is false', () => {
    const showIcon = {
      get: jest.fn().mockReturnValue(false),
    };
    const wrapper = shallow(
      <AudioConferenceView {...props} showIcon={showIcon} />,
    );
    expect(wrapper.type()).toBe(null);
  });

  it('should render ProfileDialogContentSummaryButton if variant is text', () => {
    const wrapper = shallow(<AudioConferenceView {...props} variant="text" />);
    expect(wrapper.find(JuiProfileDialogContentSummaryButton).exists()).toBe(
      true,
    );
  });

  it('should render IconButton by default', () => {
    const wrapper = shallow(<AudioConferenceView {...props} />);
    expect(wrapper.find(JuiIconButton).exists()).toBe(true);
  });

  it('should call startAudioConference when click', () => {
    const wrapper = shallow(<AudioConferenceView {...props} />);
    const event = {
      stopPropagation: jest.fn(),
    };
    wrapper.simulate('click', event);
    expect(props.startAudioConference).toHaveBeenCalled();
  });
});
