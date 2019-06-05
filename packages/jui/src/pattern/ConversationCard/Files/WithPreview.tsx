/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-23 09:56:37
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import * as Jui from './style';
import { FileName } from './FileName';
import { JuiButtonBar } from '../../../components/Buttons';

type JuiFileWithPreviewProps = {
  size: string;
  Actions: JSX.Element[];
  fileName: React.ReactChild | (React.ReactChild | null)[] | null;
  url: string;
  iconType: string;
  disabled?: boolean;
};

class JuiFileWithPreview extends React.PureComponent<JuiFileWithPreviewProps> {
  render() {
    const {
      size,
      fileName,
      url,
      Actions,
      iconType,
      disabled = true,
    } = this.props;

    return (
      <Jui.FileCard>
        <Jui.FileCardMedia disabled={disabled} image={url} />
        <Jui.FileCardContent>
          <Jui.CardFileName>
            <FileName>{fileName}</FileName>
          </Jui.CardFileName>
          <Jui.CardFileInfo component="div">
            <Jui.CardSize data-test-automation-id="file-size">
              <Jui.FileIcon size="small">{iconType}</Jui.FileIcon>
              {size}
            </Jui.CardSize>
            <Jui.CardFileActions>
              <JuiButtonBar overlapSize={-2}>{Actions}</JuiButtonBar>
            </Jui.CardFileActions>
          </Jui.CardFileInfo>
        </Jui.FileCardContent>
      </Jui.FileCard>
    );
  }
}

export { JuiFileWithPreview, JuiFileWithPreviewProps };
