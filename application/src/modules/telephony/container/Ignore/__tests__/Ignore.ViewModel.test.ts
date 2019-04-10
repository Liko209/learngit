/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-04-08 18:26:45
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework';
import { TelephonyStore } from '../../../store';
import { TelephonyService } from '../../../service/TelephonyService';
import { IgnoreViewModel } from '../Ignore.ViewModel';

jest.mock('../../../service/TelephonyService');

decorate(injectable(), TelephonyStore);
decorate(injectable(), TelephonyService);

container.bind(TelephonyService).to(TelephonyService);
container.bind(TelephonyStore).to(TelephonyStore);

let ignoreViewModel: IgnoreViewModel;

beforeAll(() => {
  ignoreViewModel = new IgnoreViewModel();
});

describe('IgnoreViewModel', () => {
  it('should call ignore function', () => {
    ignoreViewModel.ignore();
    const _telephonyService: TelephonyService = container.get(TelephonyService);
    expect(_telephonyService.ignore).toBeCalled();
  });
});
