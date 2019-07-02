/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-26 13:18:18
 * Copyright © RingCentral. All rights reserved.
 */
import { Caller } from 'sdk/module/RCItems/types';

import { ENTITY_TYPE } from '../../constants';

type CallProps = {
  id: number;
  caller: Caller;
  entity: ENTITY_TYPE;
};

type CallViewProps = {
  entity: ENTITY_TYPE;
  hookAfterClick?: () => void;
  doCall: () => Promise<void>;
};

export { CallProps, CallViewProps, ENTITY_TYPE };
