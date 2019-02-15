/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-23 16:55:28
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../../foundation/utils/decorators';
import { JuiFileWithPreview } from '../';
import { JuiIconButton } from '../../../../components/Buttons/IconButton/IconButton';

storiesOf('Pattern/ConversationCard', module)
  .addDecorator(withInfoDecorator(JuiFileWithPreview, { inline: true }))
  .add('FileWithPreview', () => (
    <div>
      <JuiFileWithPreview
        url="https://material-ui.com/static/images/cards/contemplative-reptile.jpg"
        fileName="fileName"
        size="2.3Mb"
        iconType={'pdf'}
        Actions={
          <JuiIconButton variant="plain" tooltipTitle="download">
            download
          </JuiIconButton>
        }
      />
      <JuiFileWithPreview
        url="https://material-ui.com/static/images/cards/contemplative-reptile.jpg"
        fileName="fileName"
        size="2.3Mb"
        iconType={'pdf'}
        Actions={
          <JuiIconButton variant="plain" tooltipTitle="download">
            download
          </JuiIconButton>
        }
      />
      <JuiFileWithPreview
        url="https://material-ui.com/static/images/cards/contemplative-reptile.jpg"
        fileName="fileName"
        size="2.3Mb"
        iconType={'pdf'}
        Actions={
          <JuiIconButton variant="plain" tooltipTitle="download">
            download
          </JuiIconButton>
        }
      />
      <JuiFileWithPreview
        url="https://material-ui.com/static/images/cards/contemplative-reptile.jpg"
        fileName="fileName"
        size="2.3Mb"
        iconType={'pdf'}
        Actions={
          <JuiIconButton variant="plain" tooltipTitle="download">
            download
          </JuiIconButton>
        }
      />
    </div>
  ));
