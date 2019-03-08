/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:35
 * Copyright © RingCentral. All rights reserved.
 */

import { MouseEvent } from 'react';

type OpenProfileDialogProps = {
  id: number; // personId || conversationId
  beforeClick?: (event: MouseEvent<HTMLElement>) => void;
  afterClick?: (event: MouseEvent<HTMLElement>) => void;
};

type OpenProfileDialogViewProps = {};

export { OpenProfileDialogProps, OpenProfileDialogViewProps };
