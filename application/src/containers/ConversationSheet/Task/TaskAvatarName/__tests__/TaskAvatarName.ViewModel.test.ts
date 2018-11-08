/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 17:27:47
 * Copyright © RingCentral. All rights reserved.
 */
import { TaskAvatarNameViewModel } from '../TaskAvatarName.ViewModel';

let ViewModel: FormViewModel;

describe('TaskAvatarNameVM', () => {
  beforeAll(() => {
    jest.resetAllMocks();
    ViewModel = new TaskAvatarNameViewModel();
  });

  it('Expect to have unit tests specified', () => {
    expect(true).toEqual(false);
  });
});
