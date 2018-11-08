/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 17:27:47
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '../../../../../store/utils';
import { TaskAvatarNameViewModel } from '../TaskAvatarName.ViewModel';
jest.mock('../../../../../store/utils');

const ViewModel = new TaskAvatarNameViewModel();

describe('TaskAvatarNameVM', () => {
  beforeAll(() => {
    jest.resetAllMocks();
  });

  it('name()', () => {
    (getEntity as jest.Mock).mockReturnValue({ displayName: 'Alan' });
    expect(ViewModel.name).toEqual('Alan');
  });
});
