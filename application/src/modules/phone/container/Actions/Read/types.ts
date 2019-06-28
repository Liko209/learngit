/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-24 07:22:04
 * Copyright © RingCentral. All rights reserved.
 */

import { BUTTON_TYPE } from '../types';

type ReadProps = {
  id: number;
  type: BUTTON_TYPE;
};

type ReadViewProps = {
  isRead: boolean;
  read: () => void;
  type: BUTTON_TYPE;
  hookAfterClick: () => void;
};

export { BUTTON_TYPE, ReadProps, ReadViewProps };
