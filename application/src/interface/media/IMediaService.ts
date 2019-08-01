/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-06-24 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */

import { createDecorator } from 'framework';
import { IMedia } from './IMedia';
import { MediaOptions } from './Media';

const IMediaService = createDecorator('IMediaService');

interface IMediaService {
  /**
   *
   * @param mediaOptions
   */
  createMedia(mediaOptions: MediaOptions): IMedia;

  /**
   *
   * @param mediaId
   */
  getMedia(mediaId: string): IMedia | null;

  /**
   * @param trackId
   */
  pauseTrack(trackId: string): void;

  canPlayType(mimeType: string): boolean;
}

export { IMediaService };
