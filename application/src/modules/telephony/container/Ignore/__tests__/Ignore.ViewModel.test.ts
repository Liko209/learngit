/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-04-08 18:26:45
 * Copyright © RingCentral. All rights reserved.
 */

import { container } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';
import { TelephonyService } from '../../../service/TelephonyService';
import { IgnoreViewModel } from '../Ignore.ViewModel';
import { TELEPHONY_SERVICE } from '../../../interface/constant';
import * as telephony from '@/modules/telephony/module.config';

jest.mock('../../../service/TelephonyService');
jest.mock('@/modules/telephony/HOC');
const jupiter = container.get(Jupiter);
jupiter.registerModule(telephony.config);

let ignoreViewModel: IgnoreViewModel;

beforeAll(() => {
  ignoreViewModel = new IgnoreViewModel();
});

describe('IgnoreViewModel', () => {
  it('should call ignore function', () => {
    ignoreViewModel.ignore();
    const _telephonyService: TelephonyService = container.get(
      TELEPHONY_SERVICE,
    );
    expect(_telephonyService.ignore).toHaveBeenCalled();
  });
});
