/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-06-24 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import { ModuleConfig } from 'framework/types';
import { MediaModule } from './MediaModule';
import { MediaService } from './service';
import { IMediaService } from '@/interface/media';

const config: ModuleConfig = {
  entry: MediaModule,
  provides: [
    {
      name: IMediaService,
      value: MediaService,
    },
  ],
};

export { config };
