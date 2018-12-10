/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-09 10:10:02
 * Copyright © RingCentral. All rights reserved.
 */
import { DeleteViewModel } from '../Delete.ViewModel';

let ViewModel: FormViewModel;

describe('DeleteVM', () => {
  beforeAll(() => {
    jest.resetAllMocks();
    ViewModel = new DeleteViewModel();
  });

  it('Expect to have unit tests specified', () => {
    expect(true).toEqual(false);
  });
});
