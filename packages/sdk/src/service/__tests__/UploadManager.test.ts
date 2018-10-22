/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-04-11 10:39:26
 * Copyright © RingCentral. All rights reserved.
 */
import UploadManager from '../UploadManager';

describe('UploadManager', () => {
  it('1 should be called', () => {
    const noop = jest.fn();
    UploadManager.on('1', noop);
    UploadManager.emit('1');
    expect(noop).toHaveBeenCalled();
  });

  it('not called', () => {
    const noop = jest.fn();
    UploadManager.on('1', noop);
    UploadManager.off('1', noop);
    UploadManager.emit('1');
    expect(noop).not.toHaveBeenCalled();
  });

  it('should get one arg', () => {
    UploadManager.on('1', (arg) => {
      expect(arg).toBe(1);
    });
    UploadManager.emit('1', 1);
  });

  it('should get mulit arg', () => {
    UploadManager.on('1', (arg1, arg2) => {
      expect(arg1).toBe(1);
      expect(arg2).toBe(2);
    });
    UploadManager.emit('1', 1, 2);
  });
});
