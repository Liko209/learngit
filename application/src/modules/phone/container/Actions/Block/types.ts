/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-06-24 13:15:24
 * Copyright © RingCentral. All rights reserved.
 */

import { BUTTON_TYPE } from '../types';
import { ENTITY_TYPE } from '../../constants';

type BlockProps = {};

type BlockViewProps = {
  type: BUTTON_TYPE;
  block: () => void;
  isBlocked: boolean;
  entity: ENTITY_TYPE;
  hookAfterClick: () => void;
};

export { BUTTON_TYPE, BlockProps, BlockViewProps };
