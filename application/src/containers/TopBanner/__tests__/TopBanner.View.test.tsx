/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-06 10:32:47
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { shallow } from 'enzyme';
import { TopBannerView } from '../TopBanner.View';

describe('TopBannerView', () => {
  describe('render', () => {
    it('should not render networkBannerView', () => {
      const wrapper = shallow(<TopBannerView />);
      expect(wrapper.find('NetworkBanner').length).toBe(0);
    });
  });
});
