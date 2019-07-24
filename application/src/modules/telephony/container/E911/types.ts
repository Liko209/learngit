/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-23 14:24:47
 * Copyright © RingCentral. All rights reserved.
 */
import { ChangeEvent } from 'react';

type E911Props = {};

type E911ViewProps = E911Props & {
  handleNameChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

export { E911Props, E911ViewProps };
