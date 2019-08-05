/*
 * @Author: Spike.Yang
 * @Date: 2019-08-02 14:29:18
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import {
  JuiDropdownContactInfo,
  JuiDropdownContactInfoProps,
} from 'jui/pattern/TopBar';

import { JuiDivider } from 'jui/components/Divider';
import { withRCMode } from '@/containers/withRCMode';

const DropdownContactInfo = withRCMode()(
  (props: JuiDropdownContactInfoProps) => {
    return (
      <>
        <JuiDropdownContactInfo {...props} />
        <JuiDivider key="divider-avatar-menu" />
      </>
    );
  },
);

export { DropdownContactInfo };
