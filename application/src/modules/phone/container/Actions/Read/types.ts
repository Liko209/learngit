/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-24 07:22:04
 * Copyright © RingCentral. All rights reserved.
 */

import { BUTTON_TYPE } from 'jui/pattern/Phone/VoicemailItem';
import { ENTITY_TYPE } from '../../constants';

type ReadProps = {
  id: number;
  type: BUTTON_TYPE;
};

type ReadViewProps = {
  type: BUTTON_TYPE;
  isRead: boolean;
  read: () => void;
  entity: ENTITY_TYPE;
  hookAfterClick: () => void;
};

export { ReadProps, ReadViewProps };
