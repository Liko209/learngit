/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-27 09:50:18
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { shallow } from 'enzyme';
import { ProfileDialogPerson } from '../Person';
import {
  JuiDialogTitleWithAction,
  JuiDialogContentWithFill,
} from 'jui/components/Dialog';
import { ProfileDialogPersonTitle } from '../Title';
import { ProfileDialogPersonContent } from '../Content';

describe('ProfileDialogPerson', () => {
  describe('render()', () => {
    it('should be render title and content component when instance component', () => {
      const Wrapper = shallow(
        <ProfileDialogPerson id={1} dismiss={() => {}} />,
      );
      expect(Wrapper.find(JuiDialogTitleWithAction)).toHaveLength(1);
      expect(Wrapper.find(JuiDialogContentWithFill)).toHaveLength(1);
      expect(Wrapper.find(ProfileDialogPersonTitle)).toHaveLength(1);
      expect(Wrapper.find(ProfileDialogPersonContent)).toHaveLength(1);
    });
  });
});
