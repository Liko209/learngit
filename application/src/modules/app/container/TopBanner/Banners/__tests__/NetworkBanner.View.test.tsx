/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-06 09:50:46
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { shallow } from 'enzyme';
import i18next from 'i18next';
import { BannerType } from '../types';
import { NetworkBannerView } from '../NetworkBanner.View';

const baseProps = {
  t: (): any => 'a',
  i18n: {} as i18next.i18n,
  tReady: true,
};

describe('NetworkBannerView', () => {
  describe('render()', () => {
    it('should not render view if online [JPT-470] 2', () => {
      const props = {
        ...baseProps,
        banner: null,
      };
      const wrapper = shallow(<NetworkBannerView {...props} />);
      expect(wrapper.find('JuiSnackbarContent').length).toBe(0);
    });

    it('should render view if offline [JPT-470] 1', () => {
      const props = {
        ...baseProps,
        banner: { message: 'You are offline', type: 'error' } as BannerType,
      };
      const wrapper = shallow(<NetworkBannerView {...props} />);
      expect(wrapper.find('JuiSnackbarContent').length).toBe(1);
    });
  });
});
