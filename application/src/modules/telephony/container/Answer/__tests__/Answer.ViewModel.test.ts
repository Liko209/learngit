/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-05-08 17:25:22
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework/ioc';
import { TelephonyService } from '../../../service/TelephonyService';
import { AnswerViewModel } from '../Answer.ViewModel';
import { TELEPHONY_SERVICE } from '../../../interface/constant';

jest.mock('../../../service/TelephonyService');

decorate(injectable(), TelephonyService);

container.bind(TELEPHONY_SERVICE).to(TelephonyService);

let answerViewModel: AnswerViewModel;

beforeAll(() => {
  answerViewModel = new AnswerViewModel();
  answerViewModel._telephonyService.answer = jest.fn();
});

describe('AnswerViewModel', () => {
  it('should call ignore function', () => {
    answerViewModel.ignore();
    const _telephonyService: TelephonyService = container.get(
      TELEPHONY_SERVICE,
    );
    expect(_telephonyService.answer).toBeCalled();
  });
});
