/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-28 12:07:26
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
import { withInfoDecorator } from '../../../../foundation/utils/decorators';
import { JuiPreviewImage, JuiDelayPlaceholder } from '../';
import { JuiIconButton } from '../../../../components/Buttons/IconButton/IconButton';

storiesOf('Pattern/ConversationCard', module)
  .addDecorator(withInfoDecorator(JuiPreviewImage, { inline: true }))
  .add('JuiPreviewImage', () => {
    const fileName = text('fileName', '123.jpg');
    return (
      <div>
        <JuiPreviewImage
          url="https://material-ui.com/static/images/cards/contemplative-reptile.jpg"
          width={360}
          height={202}
          fileName={fileName}
          Actions={
            <JuiIconButton variant="plain" tooltipTitle="download">
              download
            </JuiIconButton>
          }
        />
        <JuiPreviewImage
          url="https://material-ui.com/static/images/cards/contemplative-reptile.jpg"
          fileName={fileName}
          width={360}
          height={202}
          Actions={
            <JuiIconButton variant="plain" tooltipTitle="download">
              download
            </JuiIconButton>
          }
        />
        <JuiPreviewImage
          url="https://material-ui.com/static/images/cards/contemplative-reptile.jpg"
          fileName={fileName}
          width={360}
          height={202}
          Actions={
            <JuiIconButton variant="plain" tooltipTitle="download">
              download
            </JuiIconButton>
          }
        />
        <JuiPreviewImage
          url="https://material-ui.com/static/images/cards/contemplative-reptile.jpg"
          fileName={fileName}
          width={360}
          height={202}
          Actions={
            <JuiIconButton variant="plain" tooltipTitle="download">
              download
            </JuiIconButton>
          }
        />
        <JuiDelayPlaceholder width={400} height={400} />
      </div>
    );
  });
