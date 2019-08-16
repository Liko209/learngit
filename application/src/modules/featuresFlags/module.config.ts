/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-04 16:12:23
 * Copyright © RingCentral. All rights reserved.
 */
import { ModuleConfig } from 'framework/types';
import { FeaturesFlagsModule } from './FeaturesFlagsModule';
import { FeaturesFlagsService } from './service';

const config: ModuleConfig = {
  entry: FeaturesFlagsModule,
  provides: [FeaturesFlagsService],
};

export { config };
