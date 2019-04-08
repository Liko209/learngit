/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-04-02 18:00:50
 * Copyright © RingCentral. All rights reserved.
 */

import { FileTypeUtils } from '../FileTypeUtils';

describe('FileTypeUtils', () => {
  it('should return true when it is gif', () => {
    const path = 'http://test.com/a.gif';
    expect(FileTypeUtils.isGif(path)).toBe(true);
  });

  it('should return false when it is not gif', () => {
    const path = 'http://test.com/a.jpg';
    expect(FileTypeUtils.isGif(path)).toBe(false);
  });
});
