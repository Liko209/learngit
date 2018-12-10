/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-27 09:50:18
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { shallow } from 'enzyme';
import { ProfileMiniCardPerson } from '../ProfileMiniCardPerson';
import {
  JuiMiniCard,
  JuiMiniCardHeader,
  JuiMiniCardFooter,
} from 'jui/pattern/MiniCard';
import { ProfileMiniCardPersonHeader } from '../ProfileMiniCardPersonHeader';
import { JuiIconButton } from 'jui/components/Buttons';

describe('Profile mini card person component', () => {
  it('should be display a person profile mini card', () => {
    const Wrapper = shallow(<ProfileMiniCardPerson id={1} />);
    expect(Wrapper.find(JuiMiniCard)).toHaveLength(1);
    expect(Wrapper.find(JuiMiniCardHeader)).toHaveLength(1);
    expect(Wrapper.find(JuiMiniCardFooter)).toHaveLength(1);
    expect(Wrapper.find(ProfileMiniCardPersonHeader)).toHaveLength(1);
    expect(Wrapper.find(JuiIconButton)).toHaveLength(1);
  });
});
