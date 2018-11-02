/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-23 09:56:37
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { getFileName } from '../../../foundation/utils/getFileName';
import * as Jui from './style';

type JuiFileWithPreviewProps = {
  size: string;
  actions: JSX.Element;
  fileName: string;
  url: string;
  iconType: string | null;
};

class JuiFileWithPreview extends React.Component<JuiFileWithPreviewProps> {
  render() {
    const { size, fileName, url, actions, iconType } = this.props;
    const [left, right] = getFileName(fileName);

    return (
      <Jui.FileCard>
        <Jui.FileCardMedia image={url} />
        <Jui.FileCardContent>
          <Jui.CardFileName>
            <span className="left-name">{left}</span>
            <span className="right-name">{right}</span>
          </Jui.CardFileName>
          <Jui.CardFileInfo component="div">
            <Jui.CardSize>
              <Jui.FileIcon iconType={iconType} size="small" />
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
