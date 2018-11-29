/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-27 09:50:18
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { shallow } from 'enzyme';
import { ProfileMiniCardGroup } from '../ProfileMiniCardGroup';
import {
  JuiMiniCard,
  JuiMiniCardHeader,
  JuiMiniCardFooter,
} from 'jui/pattern/MiniCard';
import { ProfileMiniCardGroupHeader } from '../ProfileMiniCardGroupHeader';
import { ProfileButton } from '@/containers/common/ProfileButton';
import { JuiIconButton } from 'jui/components/Buttons';

describe('Profile mini card group component', () => {
  it('should be display a team or group profile mini card', () => {
    const Wrapper = shallow(<ProfileMiniCardGroup id={1} />);
    expect(Wrapper.find(JuiMiniCard)).toHaveLength(1);
    expect(Wrapper.find(JuiMiniCardHeader)).toHaveLength(1);
    expect(Wrapper.find(JuiMiniCardFooter)).toHaveLength(1);
    expect(Wrapper.find(ProfileMiniCardGroupHeader)).toHaveLength(1);
    expect(Wrapper.find(ProfileButton)).toHaveLength(1);
    expect(Wrapper.find(JuiIconButton)).toHaveLength(1);
  });
});
