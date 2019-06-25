/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2019-01-02 15:06:10
 * Copyright © RingCentral. All rights reserved.
 */
import { getFileSize, fileItemAvailable } from '../helper';
const Bytes = 100;
describe('getFileSize', () => {
  it('should return 0B if bytes not a number', () => {
    expect(getFileSize(null)).toEqual('0B');
    expect(getFileSize('xxx')).toEqual('0B');
    expect(getFileSize()).toEqual('0B');
  });

  it('should return x.xB while bytes less than 0.1kb', () => {
    expect(getFileSize(Bytes - 1)).toEqual('99.0B');
  });
  it('should return 0.xKB while bytes less than 0.1kb', () => {
    expect(getFileSize(Bytes)).toEqual('0.1KB');
  });
  it('should return x.xKB while bytes more than 1kb', () => {
    expect(getFileSize(Bytes * 1024)).toEqual('100.0KB');
  });
  it('should return x.xMB while bytes more than 1024kb', () => {
    expect(getFileSize(Bytes * 1024 * 1024)).toEqual('100.0MB');
  });
  it('should return x.xGB while bytes more than 1024mb', () => {
    expect(getFileSize(Bytes * 1024 * 1024 * 1024)).toEqual('100.0GB');
  });
});

describe('fileItemAvailable()', () => {
  it('should be false when fileItem is mocked or deactivated', () => {
    expect(fileItemAvailable({ isMocked: true }, undefined)).toBeFalsy();
    expect(fileItemAvailable({ deactivated: true }, undefined)).toBeFalsy();
  });

  it('should be false when item version is deactivated', () => {
    const post = { fileItemVersion: () => 1 };
    const fileItem = {
      versions: [
        { deactivated: false },
        { deactivated: false },
        { deactivated: true },
      ],
    };
    expect(fileItemAvailable(fileItem, post)).toBeFalsy();
  });

  it('should be true when item version is not deactivated', () => {
    const post = { fileItemVersion: () => 1 };
    const fileItem = {
      versions: [
        { deactivated: true },
        { deactivated: true },
        { deactivated: false },
      ],
    };
    expect(fileItemAvailable(fileItem, post)).toBeTruthy();
  });

  it('should be false when item version is not in versions array', () => {
    const post = { fileItemVersion: () => 3 };
    const fileItem = {
      versions: [{ deactivated: true }, { deactivated: false }],
    };
    expect(fileItemAvailable(fileItem, post)).toBeFalsy();
  });
});
