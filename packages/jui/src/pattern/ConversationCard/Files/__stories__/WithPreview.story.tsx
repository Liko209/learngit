/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-23 16:55:28
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Fragment } from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../../foundation/utils/decorators';
import { JuiFileWithPreview } from '../';
import { JuiIconButton } from '../../../../components/Buttons/IconButton/IconButton';

storiesOf('Pattern/ConversationCard', module)
  .addDecorator(withInfoDecorator(JuiFileWithPreview, { inline: true }))
  .add('FileWithPreview', () => (
    <JuiFileWithPreview
      url="https://material-ui.com/static/images/cards/contemplative-reptile.jpg"
      fileName="fileName"
      size="2.3Mb"
      actions={
        <JuiIconButton variant="plain" tooltipTitle="download">
          vertical_align_bottom
        </JuiIconButton>
      }
    />
  ));
