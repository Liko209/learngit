/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-23 16:55:28
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Fragment } from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../../foundation/utils/decorators';
import { FileWithPreview } from '../';
import { JuiIconButton } from '../../../../components/Buttons/IconButton/IconButton';

storiesOf('Pattern/ConversationCard', module)
  .addDecorator(withInfoDecorator(FileWithPreview, { inline: true }))
  .add('FileWithPreview', () => (
    <FileWithPreview
      size="2.3Mb"
      actions={
        <JuiIconButton variant="plain" tooltipTitle="download">
          vertical_align_bottom
        </JuiIconButton>
      }
    />
  ));
