/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-23 09:56:37
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';

import * as Jui from './style';

type JuiFileWithPreviewProps = {
  size: string;
  actions: JSX.Element;
  fileName: string;
  url: string;
};

class JuiFileWithPreview extends React.Component<JuiFileWithPreviewProps> {
  render() {
    const { size, fileName, url, actions } = this.props;
    return (
      <Jui.FileCard>
        <Jui.FileCardMedia image={url} />
        <Jui.FileCardContent>
          <Jui.CardFileName>{fileName}</Jui.CardFileName>
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

export { JuiFileWithPreview, JuiFileWithPreviewProps };
