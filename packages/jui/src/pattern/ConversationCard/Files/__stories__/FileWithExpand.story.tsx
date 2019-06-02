/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-28 12:07:26
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { text, boolean } from '@storybook/addon-knobs';
import { withInfoDecorator } from '../../../../foundation/utils/decorators';
import { JuiFileWithExpand, JuiPreviewImage } from '../';
import { JuiIconButton } from '../../../../components/Buttons/IconButton/IconButton';
import download from '../../../../assets/jupiter-icon/icon-download.svg';

storiesOf('Pattern/ConversationCard', module)
  .addDecorator(withInfoDecorator(JuiFileWithExpand, { inline: true }))
  .add('JuiFileWithExpand', () => {
    const fileName = text('fileName', '土asd豆你个马拉松sdsds.jpg');
    const expand = boolean('expand', false);
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
        <JuiFileWithExpand
          icon="default_file"
          fileName={fileName}
          expand={expand}
          Actions={
            <div>
              <JuiIconButton
                variant="plain"
                tooltipTitle="download"
                symbol={download}
              />
            </div>
          }
        >
          <JuiPreviewImage
            url="https://material-ui.com/static/images/cards/contemplative-reptile.jpg"
            fileName={fileName}
            width={360}
            height={202}
            Actions={actions}
          />
        </JuiFileWithExpand>
        <JuiFileWithExpand
          icon="default_file"
          fileName={fileName}
          expand={expand}
          Actions={
            <div>
              <JuiIconButton
                variant="plain"
                tooltipTitle="download"
                symbol={download}
              />
            </div>
          }
        >
          <JuiPreviewImage
            url="https://material-ui.com/static/images/cards/contemplative-reptile.jpg"
            fileName={fileName}
            width={360}
            height={202}
            Actions={actions}
          />
        </JuiFileWithExpand>
        <JuiFileWithExpand
          icon="default_file"
          fileName={fileName}
          expand={expand}
          Actions={
            <div>
              <JuiIconButton
                variant="plain"
                tooltipTitle="download"
                symbol={download}
              />
              >
            </div>
          }
        >
          <JuiPreviewImage
            url="https://material-ui.com/static/images/cards/contemplative-reptile.jpg"
            fileName={fileName}
            width={360}
            height={202}
            Actions={actions}
          />
        </JuiFileWithExpand>
        <JuiFileWithExpand
          icon="default_file"
          fileName={fileName}
          expand={expand}
          Actions={
            <div>
              <JuiIconButton
                variant="plain"
                tooltipTitle="download"
                symbol={download}
              />
            </div>
          }
        >
          <JuiPreviewImage
            url="https://material-ui.com/static/images/cards/contemplative-reptile.jpg"
            fileName={fileName}
            width={360}
            height={202}
            Actions={actions}
          />
        </JuiFileWithExpand>
        <JuiFileWithExpand
          icon="default_file"
          fileName={fileName}
          expand={expand}
          Actions={
            <div>
              <JuiIconButton
                variant="plain"
                tooltipTitle="download"
                symbol={download}
              />
              >
            </div>
          }
        >
          <JuiPreviewImage
            url="https://material-ui.com/static/images/cards/contemplative-reptile.jpg"
            fileName={fileName}
            width={360}
            height={202}
            Actions={actions}
          />
        </JuiFileWithExpand>
      </div>
    );
  });
