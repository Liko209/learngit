/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-06 09:50:46
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { shallow } from 'enzyme';
import { i18n } from 'i18next';
import { ConfigType } from '../types';
import { NetworkBannerView } from '../NetworkBanner.View';

describe('NetworkBannerView', () => {
  describe('render()', () => {
    it('should not render view if offline [JPT-470] 1', () => {
      const props = {
        t: () => 'a',
        i18n: {} as i18n,
        tReady: true,
        config: { shouldShow: false, message: '', type: 'error' } as ConfigType,
      };
      const wrapper = shallow(<NetworkBannerView {...props} />);
      expect(wrapper.find('JuiSnackbarContent').length).toBe(0);
    });
    it('should not render view if online [JPT-470] 2', () => {
      const props = {
        t: () => 'a',
        i18n: {} as i18n,
        tReady: true,
        config: {
          shouldShow: true,
          message: 'NoInternetConnection',
          type: 'error',
        } as ConfigType,
      };
      const wrapper = shallow(<NetworkBannerView {...props} />);
      expect(wrapper.find('JuiSnackbarContent').length).toBe(1);
    });
  });
});
