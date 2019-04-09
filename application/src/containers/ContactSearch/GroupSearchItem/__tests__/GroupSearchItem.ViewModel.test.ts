/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-04-09 09:53:57
 * Copyright © RingCentral. All rights reserved.
 */
import { GroupSearchItemViewModel } from '../GroupSearchItem.ViewModel';

let ViewModel: FormViewModel;

describe('GroupSearchItemVM', () => {
  beforeAll(() => {
    jest.resetAllMocks();
    ViewModel = new GroupSearchItemViewModel();
  });

  it('Expect to have unit tests specified', () => {
    expect(true).toEqual(false);
  });
});
