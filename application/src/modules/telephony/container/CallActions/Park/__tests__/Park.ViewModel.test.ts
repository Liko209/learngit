/*
 * @Author: Peng Yu (peng.yu@ringcentral.com)
 * @Date: 2019-05-29 17:10:31
 * Copyright © RingCentral. All rights reserved.
 */
import { ParkViewModel } from '../Park.ViewModel';

let vm: ParkViewModel;

describe('ParkViewModel', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    vm = new ParkViewModel();
  });

  it('Expect to have unit tests specified', () => {
    expect(true).toEqual(false);
  });
});
