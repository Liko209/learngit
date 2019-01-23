/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-21 17:04:53
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { t } from 'i18next';
import {
  JuiListItemIcon,
  JuiListItemSecondaryAction,
} from 'jui/components/Lists';
import { JuiIconButton } from 'jui/components/Buttons';

type Props = {
  url: string;
};

const Download = React.memo(({ url }: Props) => {
  return (
    <JuiListItemSecondaryAction>
      <JuiListItemIcon>
        <JuiIconButton
          component="a"
          download={true}
          href={url}
          variant="plain"
          tooltipTitle={t('download')}
        >
          download
        </JuiIconButton>
      </JuiListItemIcon>
    </JuiListItemSecondaryAction>
  );
});

export { Download };
