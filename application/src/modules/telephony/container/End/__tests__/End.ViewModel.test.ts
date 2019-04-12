/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-11 09:50:10
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework';
import { TelephonyStore } from '../../../store';
import { TelephonyService } from '../../../service/TelephonyService';
import { EndViewModel } from '../End.ViewModel';

jest.mock('../../../service/TelephonyService');

decorate(injectable(), TelephonyStore);
decorate(injectable(), TelephonyService);

container.bind(TelephonyService).to(TelephonyService);
container.bind(TelephonyStore).to(TelephonyStore);

let endViewModel: EndViewModel;

beforeAll(() => {
  endViewModel = new EndViewModel();
  endViewModel._telephonyService.hangUp = jest.fn();
});

describe('EndViewModel', () => {
  it('should call hangUp function', () => {
    endViewModel.end();
    const _telephonyService: TelephonyService = container.get(TelephonyService);
    expect(_telephonyService.hangUp).toBeCalled();
  });
});
