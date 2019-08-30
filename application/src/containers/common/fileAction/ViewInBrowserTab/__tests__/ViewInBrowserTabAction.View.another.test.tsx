/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-08-28 09:38:44
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { ViewInBrowserTabAction } from '../ViewInBrowserTabAction.View';
import { shallow } from 'enzyme';
import { Translation } from 'react-i18next';

jest.mock('@/common/isUserAgent', () => ({ isElectron: true }));
describe('ViewInBrowserTabActionAnotherTest', () => {
  const wrapper = shallow(<ViewInBrowserTabAction />);
  it('should show correct text in electron [JPT-2926]', () => {
    expect(wrapper.find(Translation).shallow()).toMatchSnapshot();
  });
});
