/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-21 17:04:53
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import i18next from 'i18next';
import { JuiListItemSecondaryAction } from 'jui/components/Lists';
import { JuiIconButton } from 'jui/components/Buttons';

type Props = {
  url: string;
};

const Download = React.memo(({ url }: Props) => {
  return (
    <JuiListItemSecondaryAction>
      <JuiIconButton
        component="a"
        download={true}
        href={url}
        variant="plain"
        tooltipTitle={i18next.t('common.download')}
      >
        download
      </JuiIconButton>
    </JuiListItemSecondaryAction>
  );
});

export { Download };
