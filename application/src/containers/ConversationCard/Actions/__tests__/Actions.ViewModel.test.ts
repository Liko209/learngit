/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-12 13:54:13
 * Copyright © RingCentral. All rights reserved.
 */

import { ActionsViewModel } from '../Actions.ViewModel';

let actionsViewModel: ActionsViewModel;

beforeAll(() => {
  actionsViewModel = new ActionsViewModel({ id: 1 });
});

describe('ActionsViewModel', () => {
  it('lifecycle method', () => {
    expect(actionsViewModel.id).toBe(1);
  });
});
