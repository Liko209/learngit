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
  JuiFileWithExpand,
  JuiFileWithPreview,
  JuiExpandImage,
} from '../';
import { JuiIconButton } from '../../../../components/Buttons/IconButton/IconButton';

storiesOf('Pattern/ConversationCard', module).add('PreviewFiles', () => {
  const fileName = text(
    'filename',
    'Conversation Card ConversationConversation Card VxD.pdf',
  );
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
                  download
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
              fileName={fileName}
              size="2.3Mb"
              iconType={'pdf'}
              Actions={
                <JuiIconButton variant="plain" tooltipTitle="download">
                  download
                </JuiIconButton>
              }
            />
          );
        })}
      </div>
      <div>
        {[1, 2, 3, 4].map((id: number) => {
          return (
            <JuiFileWithExpand
              key={id}
              fileName={fileName}
              Actions={
                <JuiIconButton variant="plain" tooltipTitle="download">
                  download
                </JuiIconButton>
              }
            />
          );
        })}
      </div>
      <div>
        {[1, 2, 3, 4].map((id: number) => {
          return (
            <JuiExpandImage
              key={id}
              fileName={fileName}
              previewUrl="https://material-ui.com/static/images/cards/contemplative-reptile.jpg"
              Actions={
                <>
                  <JuiIconButton variant="plain" tooltipTitle="download">
                    download
                  </JuiIconButton>
                </>
              }
            />
          );
        })}
      </div>
    </div>
  );
});
