/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-30 09:53:07
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Fragment } from 'react';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
import { withInfoDecorator } from '../../../../foundation/utils/decorators';
import {
  JuiPreviewImage,
  JuiFileWithoutPreview,
  JuiFileWithPreview,
} from '../';
import { JuiIconButton } from '../../../../components/Buttons/IconButton/IconButton';

storiesOf('Pattern/ConversationCard', module).add('PreviewFiles', () => {
  const fileName = text('fileName', '123.jpg');
  return (
    <div>
      <div>
        {[1, 2, 3].map((id: number) => {
          return (
            <JuiPreviewImage
              key={id}
              url="https://material-ui.com/static/images/cards/contemplative-reptile.jpg"
              ratio={2}
              fileName={fileName}
              Actions={
                <JuiIconButton variant="plain" tooltipTitle="download">
                  get_app
                </JuiIconButton>
              }
            />
          );
        })}
      </div>
      <div>
        {[1, 2, 3, 4].map((id: number) => {
          return (
            <JuiFileWithPreview
              key={id}
              url="https://material-ui.com/static/images/cards/contemplative-reptile.jpg"
              fileName="fileName"
              size="2.3Mb"
              iconType={'pdf'}
              Actions={
                <JuiIconButton variant="plain" tooltipTitle="download">
                  get_app
                </JuiIconButton>
              }
            />
          );
        })}
      </div>
      <div>
        {[1, 2, 3, 4].map((id: number) => {
          return (
            <JuiFileWithoutPreview
              key={id}
              fileName="Conversation Card VxD.pdf"
              size="3.5MB"
              iconType={'pdf'}
              Actions={
                <JuiIconButton variant="plain" tooltipTitle="download">
                  get_app
                </JuiIconButton>
              }
            />
          );
        })}
      </div>
    </div>
  );
});
