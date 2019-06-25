/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-28 12:07:26
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
import { JuiPreviewImage, JuiDelayPlaceholder } from '../';
import { JuiIconButton } from '../../../../components/Buttons/IconButton/IconButton';
import download from '../../../../assets/jupiter-icon/icon-download.svg';
import image from './contemplative-reptile.jpg';

storiesOf('Pattern/ConversationCard', module).add('JuiPreviewImage', () => {
  const fileName = text('fileName', '123.jpg');
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
      <JuiPreviewImage
        url={image}
        width={360}
        height={202}
        fileName={fileName}
        Actions={actions}
      />
      <JuiPreviewImage
        url={image}
        fileName={fileName}
        width={360}
        height={202}
        Actions={actions}
      />
      <JuiPreviewImage
        url={image}
        fileName={fileName}
        width={360}
        height={202}
        Actions={actions}
      />
      <JuiPreviewImage
        url={image}
        fileName={fileName}
        width={360}
        height={202}
        Actions={actions}
      />
      <JuiDelayPlaceholder width={400} height={400} />
    </div>
  );
});
