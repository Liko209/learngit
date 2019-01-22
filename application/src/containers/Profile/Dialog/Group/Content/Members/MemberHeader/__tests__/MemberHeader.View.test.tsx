/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-01-15 15:03:48
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { shallow } from 'enzyme';
import { MemberHeaderView } from '../MemberHeader.View';
import { JuiProfileDialogContentSummaryButtonInRight as ButtonInRight } from 'jui/pattern/Profile/Dialog';

describe('MemberHeaderView', () => {
  describe('render()', () => {
    it('should display [AddTeamMembers] button when user has permission to add team. [JPT-911]', () => {
      const props: any = {
        group: {},
        isCurrentUserHasPermissionAddTeam: true,
      };
      const Wrapper = shallow(<MemberHeaderView {...props} />);
      expect(Wrapper.find(ButtonInRight).exists()).toEqual(true);
    });
    it('should display none [AddTeamMembers] button when user has not permission to add team. [JPT-911]', () => {
      const props: any = {
        group: {},
        isCurrentUserHasPermissionAddTeam: false,
      };
      const Wrapper = shallow(<MemberHeaderView {...props} />);
      expect(Wrapper.find(ButtonInRight).exists()).toEqual(false);
    });
  });
});
