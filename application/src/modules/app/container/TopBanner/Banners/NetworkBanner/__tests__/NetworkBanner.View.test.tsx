/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-06 09:50:46
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { shallow } from 'enzyme';
import { NetworkBannerView } from '../NetworkBanner.View';

const baseProps = {
  t: (): any => 'a',
};

describe('NetworkBannerView', () => {
  describe('render()', () => {
    it('should not render view if isShow is false [JPT-470] 2', () => {
      const props = {
        ...baseProps,
        isShow: false,
      };
      const wrapper = shallow(<NetworkBannerView {...props} />);
      expect(wrapper.find('JuiSnackbarContent').length).toBe(0);
    });

    it('should render view if offline [JPT-470] 1', () => {
      const props = {
        ...baseProps,
        isShow: true,
      };
      const wrapper = shallow(<NetworkBannerView {...props} />);
      expect(wrapper.find('JuiSnackbarContent').length).toBe(1);
    });
  });
});
