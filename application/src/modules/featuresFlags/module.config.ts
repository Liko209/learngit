/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-04 16:12:23
 * Copyright © RingCentral. All rights reserved.
 */
import { ModuleConfig, Jupiter } from 'framework';
import { FeaturesFlagsModule } from './FeaturesFlagsModule';
import { FeaturesFlagsService } from './service';

const config: ModuleConfig = {
  entry: FeaturesFlagsModule,
  binding: (jupiter: Jupiter) => {
    jupiter.registerClass(FeaturesFlagsService);
  },
};

export { config };
