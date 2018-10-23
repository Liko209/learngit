/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-23 09:56:37
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';

import * as Jui from './style';

type FileWithPreviewProps = {
  size: string;
  actions: JSX.Element;
};

class FileWithPreview extends React.Component<FileWithPreviewProps> {
  render() {
    const { size, actions } = this.props;
    return (
      <Jui.FileCard>
        <Jui.FileCardMedia image="https://material-ui.com/static/images/cards/contemplative-reptile.jpg" />
        <Jui.FileCardContent>
          <Jui.CardFileName>sdfsdfsfsdf.png</Jui.CardFileName>
          <Jui.CardFileInfo>
            <Jui.CardSize>
              <Jui.FileIcon size="small" />
              {size}
            </Jui.CardSize>
            <Jui.CardFileActions>{actions}</Jui.CardFileActions>
          </Jui.CardFileInfo>
        </Jui.FileCardContent>
      </Jui.FileCard>
    );
  }
}

export { FileWithPreview };
