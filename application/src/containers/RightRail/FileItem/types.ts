/*
 * @Author: isaac.liu
 * @Date: 2019-01-08 14:28:15
 * Copyright © RingCentral. All rights reserved.
 */

import { ReactElement } from 'react';

type FileItemProps = {
  disabled?: boolean;
  icon: ReactElement<any>;
  name: string;
  subtitle: string;
  action?: () => void;
};

export { FileItemProps };
