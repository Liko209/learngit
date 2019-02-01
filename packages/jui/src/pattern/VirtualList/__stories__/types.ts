/*
 * @Author: isaac.liu
 * @Date: 2019-01-08 19:42:28
 * Copyright © RingCentral. All rights reserved.
 */

import { ReactElement } from 'react';

type FileItemProps = {
  disabled?: boolean;
  icon?: ReactElement<any>;
  name: string;
  subtitle: string;
  action?: () => void;
};

export { FileItemProps };
