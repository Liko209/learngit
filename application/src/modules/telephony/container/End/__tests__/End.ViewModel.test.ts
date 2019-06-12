/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-11 09:50:10
 * Copyright © RingCentral. All rights reserved.
 */

import { container, Jupiter } from 'framework';
import { TelephonyService } from '../../../service/TelephonyService';
import { EndViewModel } from '../End.ViewModel';
import { TELEPHONY_SERVICE } from '../../../interface/constant';
import * as telephony from '@/modules/telephony/module.config';

jest.mock('../../../service/TelephonyService');

const jupiter = container.get(Jupiter);
jupiter.registerModule(telephony.config);

let endViewModel: EndViewModel;

describe('EndViewModel', () => {
  it('should not call hangUp function', () => {
    endViewModel = new EndViewModel({});
    endViewModel._telephonyService.uiCallStartTime = +new Date();
    endViewModel.end();
    const _telephonyService: TelephonyService = container.get(
      TELEPHONY_SERVICE,
    );
    expect(_telephonyService.hangUp).not.toBeCalled();
  });

  it('should call hangUp function', async () => {
    endViewModel = new EndViewModel({});
    endViewModel._telephonyService.uiCallStartTime = +new Date();

    debugger;
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

    endViewModel.end();
    const _telephonyService: TelephonyService = container.get(
      TELEPHONY_SERVICE,
    );
    expect(_telephonyService.hangUp).toBeCalled();
  });
});
