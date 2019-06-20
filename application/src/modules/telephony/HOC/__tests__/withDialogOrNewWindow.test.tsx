/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-05-22 10:14:19
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { shallow } from 'enzyme';
import { withDialogOrNewWindow } from '../withDialogOrNewWindow';
import { TelephonyService } from '../../service/TelephonyService';
import { TELEPHONY_SERVICE } from '../../interface/constant';
import { TelephonyStore } from '../../store/TelephonyStore';
import { container, injectable, decorate } from 'framework';
import { ClientService } from '@/modules/common';
import { CLIENT_SERVICE } from '@/modules/common/interface';

decorate(injectable(), TelephonyStore);
decorate(injectable(), TelephonyService);
decorate(injectable(), ClientService);

container.bind(TELEPHONY_SERVICE).to(TelephonyService);
container.bind(TelephonyStore).to(TelephonyStore);
container.bind(CLIENT_SERVICE).to(ClientService);

describe('withDialogOrNewWindow', () => {
  it('should return a react component that wrap an original component', () => {
    const Dummy = () => null;
    const Wrapped = withDialogOrNewWindow(Dummy);

    const wrapper = shallow(<Wrapped />);
    expect(wrapper.find(Dummy).length).toBe(1);
  });
});
