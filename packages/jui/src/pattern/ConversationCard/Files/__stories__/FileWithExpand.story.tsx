/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-28 12:07:26
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Fragment } from 'react';
import { storiesOf } from '@storybook/react';
import { text, boolean } from '@storybook/addon-knobs';
import { withInfoDecorator } from '../../../../foundation/utils/decorators';
import { JuiFileWithExpand, JuiPreviewImage } from '../';
import { JuiIconButton } from '../../../../components/Buttons/IconButton/IconButton';

storiesOf('Pattern/ConversationCard', module)
  .addDecorator(withInfoDecorator(JuiFileWithExpand, { inline: true }))
  .add('JuiFileWithExpand', () => {
    const fileName = text('fileName', '12312312312312313.jpg');
    const expand = boolean('expand', false);
    return (
      <div>
        <JuiFileWithExpand
          fileName={fileName}
          expand={expand}
          actions={
            <div>
              <JuiIconButton variant="plain" tooltipTitle="download">
                get_app
              </JuiIconButton>
            </div>
          }
        >
          <JuiPreviewImage
            url="https://material-ui.com/static/images/cards/contemplative-reptile.jpg"
            fileName={fileName}
            ratio={0.5}
            actions={
              <JuiIconButton variant="plain" tooltipTitle="download">
                get_app
            </JuiIconButton>
            }
          />
        </JuiFileWithExpand>
      </div>
    );
  });
