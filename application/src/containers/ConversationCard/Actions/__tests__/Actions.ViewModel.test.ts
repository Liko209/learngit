/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-12 13:54:13
 * Copyright © RingCentral. All rights reserved.
 */

import { ActionsViewModel } from '../Actions.ViewModel';

let actionsViewModel: ActionsViewModel;

beforeAll(() => {
  actionsViewModel = new ActionsViewModel({ postId: 1, groupId: 2 });
});

describe('ActionsViewModel', () => {
  it('lifecycle method', () => {
    expect(actionsViewModel.postId).toBe(1);
    expect(actionsViewModel.groupId).toBe(2);
  });
});
