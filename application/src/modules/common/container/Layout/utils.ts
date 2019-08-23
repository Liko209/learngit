/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-22 17:26:59
 * Copyright © RingCentral. All rights reserved.
 */

import { SectionTabs, LeftNav } from './types';

function isSectionTabs(config: LeftNav): config is SectionTabs {
  return !!(config as SectionTabs).sections;
}

export { isSectionTabs };
