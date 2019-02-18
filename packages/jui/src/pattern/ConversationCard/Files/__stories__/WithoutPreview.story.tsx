/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-23 13:29:29
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../../foundation/utils/decorators';
import { JuiFileWithoutPreview } from '../';
import { JuiIconButton } from '../../../../components/Buttons/IconButton/IconButton';

storiesOf('Pattern/ConversationCard', module)
  .addDecorator(withInfoDecorator(JuiFileWithoutPreview, { inline: true }))
  .add('FileWithoutPreview', () => (
    <div>
      <JuiFileWithoutPreview
        fileName="Conversation Card VxD.pdf"
        size="3.5MB"
        iconType={'pdf'}
        Actions={
          <JuiIconButton variant="plain" tooltipTitle="download">
            download
          </JuiIconButton>
        }
      />
      <JuiFileWithoutPreview
        fileName="Conversation Card VxD.pdf"
        size="3.5MB"
        iconType={'pdf'}
        Actions={
          <JuiIconButton variant="plain" tooltipTitle="download">
            download
          </JuiIconButton>
        }
      />
      <JuiFileWithoutPreview
        fileName="Conversation Card VxD.pdf"
        size="3.5MB"
        iconType={'pdf'}
        Actions={
          <JuiIconButton variant="plain" tooltipTitle="download">
            download
          </JuiIconButton>
        }
      />
      <JuiFileWithoutPreview
        fileName="Conversation Card VxD.pdf"
        size="3.5MB"
        iconType={'pdf'}
        Actions={
          <JuiIconButton variant="plain" tooltipTitle="download">
            download
          </JuiIconButton>
        }
      />
    </div>
  ));
