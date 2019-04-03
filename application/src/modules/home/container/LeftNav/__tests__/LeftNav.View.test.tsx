/*
 * @Author: Andy Hu
 * @Date: 2018-12-07 15:03:00
 * Copyright Â© RingCentral. All rights reserved.
 */

import * as i18n from 'react-i18next';
import * as router from 'react-router-dom';
jest.spyOn(i18n, 'withTranslation').mockImplementation(x => x);
jest.spyOn(router, 'withRouter').mockImplementation(x => x);
import { shallow } from 'enzyme';
import history from '@/history';
import { LeftNavView } from '../LeftNav.View';
import React from 'react';

describe.only('LeftNav.View', () => {
  describe('onRouteChange', () => {
    jest.spyOn(history, 'push').mockImplementation();
    const props = {
      history: { listen: jest.fn(), push: history.push },
      location: { pathname: '/message/123' },
      icons: {
        get: () => [],
      },
    } as any;
    let view: any;
    beforeEach(() => {
      view = shallow(<LeftNavView {...props} />).instance() as any;
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('do nothing when incoming url is the same as current url', () => {
      const inComingUrl = '/message/123';
      view.onRouteChange(inComingUrl);
      expect(history.push).not.toBeCalled();
    });
    it('do nothing when incoming url is the subset of current url', () => {
      const inComingUrl = '/message/';
      view.onRouteChange(inComingUrl);
      expect(history.push).not.toBeCalled();
    });
    it('do nothing when incoming url is different from current url', () => {
      const inComingUrl = '/telephone/';
      view.onRouteChange(inComingUrl);
      expect(history.push).toBeCalledWith(inComingUrl);
    });
  });
});
