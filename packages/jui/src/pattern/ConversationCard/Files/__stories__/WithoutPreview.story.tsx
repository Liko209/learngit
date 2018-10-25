/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-23 13:29:29
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Fragment } from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../../foundation/utils/decorators';
import { JuiFileWithoutPreview } from '../';
import { JuiIconButton } from '../../../../components/Buttons/IconButton/IconButton';

storiesOf('Pattern/ConversationCard', module)
  .addDecorator(withInfoDecorator(JuiFileWithoutPreview, { inline: true }))
  .add('FileWithoutPreview', () => (
    <JuiFileWithoutPreview
      title="Conversation Card VxD.pdf"
      secondary="3.5MB"
      actions={
        <JuiIconButton variant="plain" tooltipTitle="download">
          vertical_align_bottom
        </JuiIconButton>
      }
    />
  ));
