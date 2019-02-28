/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-02-27 10:46:49
 * Copyright © RingCentral. All rights reserved.
 */
import { PinViewModel } from '../Pin.ViewModel';

let ViewModel: FormViewModel;

describe('PinVM', () => {
  beforeAll(() => {
    jest.resetAllMocks();
    ViewModel = new PinViewModel();
  });

  it('Expect to have unit tests specified', () => {
    expect(true).toEqual(false);
  });
});
