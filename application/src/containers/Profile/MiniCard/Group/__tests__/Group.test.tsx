/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-27 09:50:18
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { shallow } from 'enzyme';
import { ProfileMiniCardGroup } from '../Group';
import {
  JuiMiniCard,
  JuiMiniCardHeader,
  JuiMiniCardFooter,
} from 'jui/pattern/MiniCard';
import { ProfileMiniCardGroupHeader } from '../Header';
import { ProfileMiniCardGroupFooter } from '../Footer';

describe('Profile mini card group component', () => {
  it('should be display a team or group profile mini card', () => {
    const Wrapper = shallow(<ProfileMiniCardGroup id={1} />);
    expect(Wrapper.find(JuiMiniCard)).toHaveLength(1);
    expect(Wrapper.find(JuiMiniCardHeader)).toHaveLength(1);
    expect(Wrapper.find(JuiMiniCardFooter)).toHaveLength(1);
    expect(Wrapper.find(ProfileMiniCardGroupHeader)).toHaveLength(1);
    expect(Wrapper.find(ProfileMiniCardGroupFooter)).toHaveLength(1);
  });
});
