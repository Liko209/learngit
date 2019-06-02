/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-23 13:29:29
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiFileWithoutPreview } from '../';
import { JuiIconButton } from '../../../../components/Buttons/IconButton/IconButton';
import download from '../../../../assets/jupiter-icon/icon-download.svg';

storiesOf('Pattern/ConversationCard', module).add('FileWithoutPreview', () => {
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
      <JuiFileWithoutPreview
        fileName="Conversation Card VxD.pdf"
        size="3.5MB"
        iconType={'pdf'}
        Actions={actions}
      />
      <JuiFileWithoutPreview
        fileName="Conversation Card VxD.pdf"
        size="3.5MB"
        iconType={'pdf'}
        Actions={actions}
      />
      <JuiFileWithoutPreview
        fileName="Conversation Card VxD.pdf"
        size="3.5MB"
        iconType={'pdf'}
        Actions={actions}
      />
      <JuiFileWithoutPreview
        fileName="Conversation Card VxD.pdf"
        size="3.5MB"
        iconType={'pdf'}
        Actions={actions}
      />
    </div>
  );
});
