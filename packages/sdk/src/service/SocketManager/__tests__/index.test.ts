/*
 * @Author: steven.zhuang
 * @Date: 2018-06-25 11:58:36
 * Copyright © RingCentral. All rights reserved.
 */
import socketFSM from '..';

describe('Socket Manager', () => {
  // beforeEach(() => {});

  it('getInstance', () => {
    expect(socketFSM).not.toBeNull();
  });
});
