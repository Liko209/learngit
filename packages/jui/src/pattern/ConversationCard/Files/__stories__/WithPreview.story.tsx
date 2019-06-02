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
import download from '../../../../assets/jupiter-icon/icon-download.svg';

storiesOf('Pattern/ConversationCard', module)
  .addDecorator(withInfoDecorator(JuiFileWithPreview, { inline: true }))
  .add('FileWithPreview', () => {
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
          url="https://material-ui.com/static/images/cards/contemplative-reptile.jpg"
          fileName="fileName"
          size="2.3Mb"
          iconType={'pdf'}
          Actions={actions}
        />
        <JuiFileWithPreview
          url="https://material-ui.com/static/images/cards/contemplative-reptile.jpg"
          fileName="fileName"
          size="2.3Mb"
          iconType={'pdf'}
          Actions={actions}
        />
        <JuiFileWithPreview
          url="https://material-ui.com/static/images/cards/contemplative-reptile.jpg"
          fileName="fileName"
          size="2.3Mb"
          iconType={'pdf'}
          Actions={actions}
        />
        <JuiFileWithPreview
          url="https://material-ui.com/static/images/cards/contemplative-reptile.jpg"
          fileName="fileName"
          size="2.3Mb"
          iconType={'pdf'}
          Actions={actions}
        />
      </div>
    );
  });
