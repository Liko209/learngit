/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-28 12:07:26
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Fragment } from 'react';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
import { withInfoDecorator } from '../../../../foundation/utils/decorators';
import { JuiPreviewImage } from '../';
import { JuiIconButton } from '../../../../components/Buttons/IconButton/IconButton';

storiesOf('Pattern/ConversationCard', module)
  .addDecorator(withInfoDecorator(JuiPreviewImage, { inline: true }))
  .add('JuiPreviewImage', () => {
    const fileName = text('fileName', '123.jpg');
    return (
      <div>
        <JuiPreviewImage
          url="https://material-ui.com/static/images/cards/contemplative-reptile.jpg"
          ratio={2}
          fileName={fileName}
          actions={
            <JuiIconButton variant="plain" tooltipTitle="download">
              get_app
            </JuiIconButton>
          }
        />
        <JuiPreviewImage
          url="https://material-ui.com/static/images/cards/contemplative-reptile.jpg"
          fileName={fileName}
          ratio={1}
          actions={
            <JuiIconButton variant="plain" tooltipTitle="download">
              get_app
            </JuiIconButton>
          }
        />
        <JuiPreviewImage
          url="https://material-ui.com/static/images/cards/contemplative-reptile.jpg"
          fileName={fileName}
          ratio={1}
          actions={
            <JuiIconButton variant="plain" tooltipTitle="download">
              get_app
            </JuiIconButton>
          }
        />
        <JuiPreviewImage
          url="https://material-ui.com/static/images/cards/contemplative-reptile.jpg"
          fileName={fileName}
          ratio={1}
          actions={
            <JuiIconButton variant="plain" tooltipTitle="download">
              get_app
            </JuiIconButton>
          }
        />
      </div>
    );
  });
