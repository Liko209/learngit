/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-05-22 10:14:19
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { shallow } from 'enzyme';
import { withDialogOrNewWindow, getDefaultPos } from '../withDialogOrNewWindow';
import { TelephonyService } from '../../service/TelephonyService';
import { TELEPHONY_SERVICE } from '../../interface/constant';
import { TelephonyStore } from '../../store/TelephonyStore';
import { container, injectable, decorate } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';
import { ClientService } from '@/modules/common';
import { CLIENT_SERVICE } from '@/modules/common/interface';
import * as media from '@/modules/media/module.config';

jest.mock('@/modules/media/service');

const jupiter = container.get(Jupiter);
jupiter.registerModule(media.config);
decorate(injectable(), TelephonyStore);
decorate(injectable(), TelephonyService);
decorate(injectable(), ClientService);

container.bind(TELEPHONY_SERVICE).to(TelephonyService);
container.bind(TelephonyStore).to(TelephonyStore);
container.bind(CLIENT_SERVICE).to(ClientService);

const defaultX = Math.floor((document.body.clientWidth - 344) / 2);
const defaultY = Math.floor((document.body.clientHeight - 552) / 2);

describe('withDialogOrNewWindow', () => {
  it('should return a react component that wrap an original component', () => {
    const Dummy = () => null;
    const Wrapped = withDialogOrNewWindow(Dummy);

    const wrapper = shallow(<Wrapped />);
    expect(wrapper.find(Dummy).length).toBe(1);
  });

  it('should return a current pos getDefaultPos', () => {
    const { x, y } = getDefaultPos();
    expect(x).toBe(defaultX);
    expect(y).toBe(defaultY);
  });

  it('should return a current state', () => {
    const Dummy = () => null;
    const Wrapped = withDialogOrNewWindow(Dummy);

    const wrapper = shallow(<Wrapped />);

    const { x, y } = wrapper.state('controlledPosition');
    expect(x).toBe(defaultX);
    expect(y).toBe(defaultY);
  });
});
