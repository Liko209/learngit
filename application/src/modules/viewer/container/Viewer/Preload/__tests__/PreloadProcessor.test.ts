/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-03-14 18:35:53
 * Copyright © RingCentral. All rights reserved.
 */

import { PreloadProcessor } from '../PreloadProcessor';
import { ImageDownloader } from '@/common/ImageDownloader';

describe('PreloadProcessor', () => {
  const itemInfo = {
    id: 1,
    url: 'about:blank',
  };
  const lisenterMock = {
    onSuccess: jest.fn(() => {}),
    onFailure: jest.fn(() => {}),
    onCancel: jest.fn(() => {}),
  };
  const downloader = new ImageDownloader();
  jest.spyOn(downloader, 'download').mockImplementation(jest.fn());
  it('process should be called', () => {
    const processor = new PreloadProcessor(itemInfo, downloader, lisenterMock);
    processor.process();
    expect(downloader.download).toBeCalled();
  });
});
