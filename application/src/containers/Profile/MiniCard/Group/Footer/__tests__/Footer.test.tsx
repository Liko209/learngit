/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-27 09:50:18
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { shallow } from 'enzyme';
import { ProfileMiniCardGroupFooter } from '../Footer';

import {
  JuiProfileMiniCardFooterLeft,
  JuiProfileMiniCardFooterRight,
} from 'jui/pattern/ProfileMiniCard';
import { ProfileButton } from '@/containers/common/ProfileButton';
import { JuiIconButton } from 'jui/components/Buttons';

describe('Profile mini card person component', () => {
  it('should be display a person profile mini card', () => {
    const Wrapper = shallow(<ProfileMiniCardGroupFooter id={1} />);
    expect(Wrapper.find(JuiProfileMiniCardFooterLeft)).toHaveLength(1);
    expect(Wrapper.find(JuiProfileMiniCardFooterRight)).toHaveLength(1);
    expect(Wrapper.find(ProfileButton)).toHaveLength(1);
    expect(Wrapper.find(JuiIconButton)).toHaveLength(1);
  });
});
