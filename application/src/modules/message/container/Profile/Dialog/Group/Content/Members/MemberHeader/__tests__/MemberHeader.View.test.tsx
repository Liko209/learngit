/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-01-15 15:03:48
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { shallow } from 'enzyme';
import { MemberHeaderView } from '../MemberHeader.View';
import {
  JuiProfileDialogContentSummaryButtonInRight as ButtonInRight,
  JuiProfileDialogContentMemberHeaderSearch,
} from 'jui/pattern/Profile/Dialog';

describe('MemberHeaderView', () => {
  describe('render()', () => {
    it('should display [AddTeamMembers] button when user has permission to add team. [JPT-911]', () => {
      const props: any = {
        group: {
          isTeam: true,
        },
        isCurrentUserHasPermissionAddMember: true,
      };
      const Wrapper = shallow(<MemberHeaderView {...props} />);
      expect(Wrapper.find(ButtonInRight).exists()).toEqual(true);
      expect(Wrapper.find(ButtonInRight).text()).toContain(
        'people.team.AddTeamMembers',
      );
    });
    it('should display none [AddTeamMembers] button when user has not permission to add team. [JPT-911]', () => {
      const props: any = {
        group: {
          isTeam: true,
        },
        isCurrentUserHasPermissionAddMember: false,
      };
      const Wrapper = shallow(<MemberHeaderView {...props} />);
      expect(Wrapper.find(ButtonInRight).exists()).toEqual(false);
    });
    it('should display [AddGroupMembers] button when isTeam is false', () => {
      const props: any = {
        group: {
          isTeam: false,
        },
      };
      const Wrapper = shallow(<MemberHeaderView {...props} />);
      expect(Wrapper.find(ButtonInRight).exists()).toEqual(true);
      expect(Wrapper.find(ButtonInRight).text()).toContain(
        'people.group.addPeople',
      );
    });
  });

  describe('render()', () => {
    it('should be display Search input when group members greater than 10. [JPT-1251]', () => {
      const group = {
        isTeam: true,
        members: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      };
      const props: any = {
        group,
        isCurrentUserHasPermissionAddMember: true,
        hasSearch: group.members.length > 10,
      };
      const Wrapper = shallow(<MemberHeaderView {...props} />);
      expect(
        Wrapper.find(JuiProfileDialogContentMemberHeaderSearch).exists(),
      ).toEqual(true);
    });

    it('should be not display Search input when group members less than or equal to 10. [JPT-1251]', () => {
      const group = {
        isTeam: true,
        members: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      };
      const props: any = {
        group,
        isCurrentUserHasPermissionAddMember: true,
        hasSearch: group.members.length > 10,
      };
      const Wrapper = shallow(<MemberHeaderView {...props} />);
      expect(
        Wrapper.find(JuiProfileDialogContentMemberHeaderSearch).exists(),
      ).toEqual(false);
    });
  });
});
