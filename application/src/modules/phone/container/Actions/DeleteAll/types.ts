/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-24 13:31:52
 * Copyright © RingCentral. All rights reserved.
 */

import { BUTTON_TYPE } from '../types';
import { ENTITY_TYPE } from '../../constants';

type DeleteProps = {
  id: number | string;
  type: BUTTON_TYPE;
};

type DeleteViewProps = {
  type: BUTTON_TYPE;
  entity: ENTITY_TYPE;
  clearCallLog: () => Promise<void>;
  listHandler: number;
};

export { BUTTON_TYPE, DeleteProps, DeleteViewProps };
