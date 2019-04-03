/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-21 17:04:53
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import i18next from 'i18next';
import { JuiIconButton } from 'jui/components/Buttons';
import { observer } from 'mobx-react';
import { DownloadViewProps } from './types';

const DownloadView = observer(
  ({ url, variant = 'plain' }: DownloadViewProps) => {
    return (
      <JuiIconButton
        component="a"
        download={true}
        href={url}
        variant={variant}
        aria-label={i18next.t('common.download')}
        tooltipTitle={i18next.t('common.download')}
      >
        download
      </JuiIconButton>
    );
  },
);

export { DownloadView };
