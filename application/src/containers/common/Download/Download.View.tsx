/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-21 17:04:53
 * Copyright © RingCentral. All rights reserved.
 */

import { withTranslation, WithTranslation } from 'react-i18next';
import React from 'react';
import { JuiIconButton } from 'jui/components/Buttons';
import { observer } from 'mobx-react';
import { DownloadViewProps } from './types';

const formatUrl = (url: string) =>
  url &&
  url.replace(/s3[\w\d-]*\.amazonaws\.com/, 's3-accelerate.amazonaws.com');

const Download = observer(
  ({ url, variant = 'plain', t }: DownloadViewProps & WithTranslation) => {
    return (
      <JuiIconButton
        component="a"
        download={true}
        href={formatUrl(url)}
        variant={variant}
        aria-label={t('common.download')}
        tooltipTitle={t('common.download')}
      >
        download
      </JuiIconButton>
    );
  },
);

const DownloadView = withTranslation('translations')(Download);

export { DownloadView };
