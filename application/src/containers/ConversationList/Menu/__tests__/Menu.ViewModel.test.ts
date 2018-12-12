/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-12 14:08:17
 * Copyright © RingCentral. All rights reserved.
 */
import { MenuViewModel } from '../Menu.ViewModel';
describe('MenuViewModel', () => {
  it('shouldSkipCloseConfirmation', () => {
    const model = new MenuViewModel();
    const skip = model.shouldSkipCloseConfirmation();
    expect(skip).toBeFalsy();
  });
});
