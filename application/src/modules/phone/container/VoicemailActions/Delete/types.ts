/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-24 07:28:07
 * Copyright © RingCentral. All rights reserved.
 */
import { BUTTON_TYPE } from '../types';

type DeleteProps = {
  id: number;
  type: BUTTON_TYPE;
};

type DeleteViewProps = {
  type: BUTTON_TYPE;
  delete: () => Promise<any>;
};

export { BUTTON_TYPE, DeleteProps, DeleteViewProps };
