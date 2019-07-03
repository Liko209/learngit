/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-06-24 13:13:21
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { BlockView } from './Block.View';
import { BlockViewModel } from './Block.ViewModel';
import { BlockProps } from './types';

const Block = buildContainer<BlockProps>({
  View: BlockView,
  ViewModel: BlockViewModel,
});

export { Block };
