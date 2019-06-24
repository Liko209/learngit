/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-06-24 13:15:24
 * Copyright © RingCentral. All rights reserved.
 */

import { Caller } from 'sdk/module/RCItems/types';
import { ENTITY_TYPE } from '../../constants';
import { BUTTON_TYPE } from '../types';

type BlockProps = {
  caller: Caller;
};

type BlockViewProps = {
  type: BUTTON_TYPE;
  block: () => Promise<boolean>;
  isBlocked: boolean;
  unblock: () => void;
  entity: ENTITY_TYPE;
  hookAfterClick: () => void;
};

export { BUTTON_TYPE, BlockProps, BlockViewProps };
