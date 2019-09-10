/*
 * @Author: Spike.Yang
 * @Date: 2019-08-22 16:59:19
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework/ioc';
import { TelephonyService } from '../../../service/TelephonyService';
import { EndAndAnswerViewModel } from '../EndAndAnswer.ViewModel';
import { TELEPHONY_SERVICE } from '../../../interface/constant';

jest.mock('../../../service/TelephonyService');

decorate(injectable(), TelephonyService);

container.bind(TELEPHONY_SERVICE).to(TelephonyService);

let endAndAnswerViewModel: EndAndAnswerViewModel;

beforeAll(() => {
  endAndAnswerViewModel = new EndAndAnswerViewModel();
  (endAndAnswerViewModel as any)._telephonyService.endAndAnswer = jest.fn();
});

describe('AnswerViewModel', () => {
  it('should call ignore function', () => {
    endAndAnswerViewModel.endAndAnswer();
    const _telephonyService: TelephonyService = container.get(
      TELEPHONY_SERVICE,
    );
    expect(_telephonyService.endAndAnswer).toHaveBeenCalled();
  });
});
