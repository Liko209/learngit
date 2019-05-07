/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-06 10:32:47
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { shallow } from 'enzyme';
import { TopBannerView } from '../TopBanner.View';
import { TopBannerViewModel } from '@/modules/app/container/TopBanner/TopBanner.ViewModel';
import { ElectronUpgradeBanner } from '../Banners/ElectronUpgradeBanner/ElectronUpgradeBanner';
import { NetworkBanner } from '../Banners/NetworkBanner';

describe('TopBannerView', () => {
  describe('render', () => {
    it('should not render networkBannerView', () => {
      const wrapper = shallow(<TopBannerView />);
      expect(wrapper.find(NetworkBanner).length).toBe(0);
    });

    it('should render banners defined in data', () => {
      TopBannerViewModel.data = [
        {
          priority: 200,
          Component: ElectronUpgradeBanner,
          props: {},
          isShow: true,
        },
      ];
      const wrapper = shallow(<TopBannerView />);
      expect(wrapper.find(ElectronUpgradeBanner).length).toBe(1);
    });

    it('should not render banners defined in data if isShow is false', () => {
      TopBannerViewModel.data = [
        {
          priority: 200,
          Component: ElectronUpgradeBanner,
          props: {},
          isShow: false,
        },
      ];
      const wrapper = shallow(<TopBannerView />);
      expect(wrapper.find(ElectronUpgradeBanner).length).toBe(0);
    });
  });
});
