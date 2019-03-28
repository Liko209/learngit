/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-03-05 10:25:07
 * Copyright © RingCentral. All rights reserved.
 */

import { ImageDownloader } from '../ImageDownloader';

describe('ImageDownloader', () => {
  const lisenterMock = {
    onSuccess: jest.fn(() => {}),
    onFailure: jest.fn(() => {}),
    onCancel: jest.fn(() => {}),
  };

  it('download', () => {
    const imageDownloader: ImageDownloader = new ImageDownloader();

    const imageElement = {
      setAttribute: jest.fn(),
    };

    Object.assign(imageDownloader, { _imgElement: imageElement });

    imageDownloader.download(
      { id: 1, url: 'https://xxxx.xxx.jpg', thumbnail: true },
      lisenterMock,
    );

    expect(imageElement.setAttribute).toBeCalledWith(
      'src',
      'https://xxxx.xxx.jpg',
    );
  });
});
