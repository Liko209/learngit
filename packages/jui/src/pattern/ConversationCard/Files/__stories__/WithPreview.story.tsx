/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-23 16:55:28
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiFileWithPreview } from '../';
import { JuiIconButton } from '../../../../components/Buttons/IconButton/IconButton';
import download from '../../../../assets/jupiter-icon/icon-download.svg';
import image from './contemplative-reptile.jpg';

storiesOf('Pattern/ConversationCard', module).add('FileWithPreview', () => {
  const actions = [
    <JuiIconButton
      key="download"
      variant="plain"
      tooltipTitle="download"
      symbol={download}
    />,
  ];

  return (
    <div>
      <JuiFileWithPreview
        url={image}
        fileName="fileName"
        size="2.3Mb"
        iconType={'pdf'}
        Actions={actions}
      />
      <JuiFileWithPreview
        url={image}
        fileName="fileName"
        size="2.3Mb"
        iconType={'pdf'}
        Actions={actions}
      />
      <JuiFileWithPreview
        url={image}
        fileName="fileName"
        size="2.3Mb"
        iconType={'pdf'}
        Actions={actions}
      />
      <JuiFileWithPreview
        url={image}
        fileName="fileName"
        size="2.3Mb"
        iconType={'pdf'}
        Actions={actions}
      />
    </div>
  );
});
