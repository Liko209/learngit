/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-01-28 10:15:56
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { shallow } from 'enzyme';
import { ProfileDialogGroupTitleView } from '../Title.View';
import { TeamSettingButton } from '@/containers/common/TeamSettingButton';

describe('ProfileDialogGroupTitleView', () => {
  describe('render()', () => {
    it('should not render setting button if it is not a team', () => {
      const props: any = {
        t: (s: string) => s,
        id: 123,
        group: {
          isTeam: false,
        },
      };
      const result = shallow(<ProfileDialogGroupTitleView {...props} />);
      expect(result.find(TeamSettingButton).length).toBe(0);
    });

    it('should not render setting button if current user is not member', () => {
      const props: any = {
        t: (s: string) => s,
        id: 123,
        group: {
          isAdmin: false,
          isMember: false,
          isTeam: true,
        },
      };
      const result = shallow(<ProfileDialogGroupTitleView {...props} />);
      expect(result.find(TeamSettingButton).length).toBe(0);
    });

    it('should render setting button if current user is member', () => {
      const props: any = {
        t: (s: string) => s,
        id: 123,
        group: {
          isAdmin: false,
          isMember: true,
          isTeam: true,
        },
      };
      const result = shallow(<ProfileDialogGroupTitleView {...props} />);
      expect(result.find(TeamSettingButton).length).toBe(1);
    });
  });
});
