/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-06 10:32:47
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { shallow, mount } from 'enzyme';
import { TopBannerView } from '../TopBanner.View';
import { ElectronUpgradeBanner } from '../Banners/ElectronUpgradeBanner/ElectronUpgradeBanner';
import { NetworkBanner } from '../Banners/NetworkBanner';
import { DndBanner } from '../Banners/DndBanner';
import { container } from 'framework/ioc';

jest.spyOn(container, 'get').mockReturnValue({
  topBanners: [],
});

describe('TopBannerView', () => {
  describe('render', () => {
    it('should not render networkBannerView', () => {
      const wrapper = shallow(<TopBannerView />);
      expect(wrapper.find(NetworkBanner).length).toBe(0);
    });

    it('should render banners defined in data', () => {
      jest.spyOn(container, 'get').mockReturnValue({
        topBanners: [
          {
            priority: 200,
            Component: ElectronUpgradeBanner,
            props: {},
            isShow: true,
          },
        ],
      });
      const wrapper = shallow(<TopBannerView />);
      expect(wrapper.find(ElectronUpgradeBanner).length).toBe(1);
    });

    it('should not render banners defined in data if isShow is false', () => {
      jest.spyOn(container, 'get').mockReturnValue({
        topBanners: [
          {
            priority: 200,
            Component: ElectronUpgradeBanner,
            props: {},
            isShow: false,
          },
        ],
      });
      const wrapper = shallow(<TopBannerView />);
      expect(wrapper.find(ElectronUpgradeBanner).length).toBe(0);
    });

    it('should not display banner defined in data if priority is less than other banner [JPT-2531]', () => {
      jest.spyOn(container, 'get').mockReturnValue({
        topBanners: [
          {
            priority: 200,
            Component: DndBanner,
            props: {},
            isShow: true,
          },
          {
            priority: 100,
            Component: NetworkBanner,
            props: {},
            isShow: true,
          },
        ],
      });
      const wrapper = mount(<TopBannerView />);
      expect(wrapper).toMatchSnapshot();
    });
  });
});
