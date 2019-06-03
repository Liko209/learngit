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
jest.useFakeTimers();

const jupiter = container.get(Jupiter);
jupiter.registerModule(telephony.config);

let endViewModel: EndViewModel;

describe('EndViewModel', () => {
  it('should call hangUp function', () => {
    endViewModel = new EndViewModel({});
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);
    endViewModel.end();
    const _telephonyService: TelephonyService = container.get(
      TELEPHONY_SERVICE,
    );
    expect(_telephonyService.hangUp).not.toBeCalled();
    jest.advanceTimersByTime(1000);
    endViewModel.end();
    expect(_telephonyService.hangUp).toBeCalled();
  });
});
