/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-08-30 10:56:13
 * Copyright © RingCentral. All rights reserved.
 */

import { isDialogOpen } from '../utils';

describe('isDialogOpen', () => {
  it('should return true when find element', () => {
    document.querySelector = jest.fn().mockReturnValue(true);
    expect(isDialogOpen()).toBe(true);
    expect(document.querySelector).toHaveBeenCalled();
  });
  it('should return false when can not find element', () => {
    document.querySelector = jest.fn().mockReturnValue(false);
    expect(isDialogOpen()).toBe(false);
  });
});
