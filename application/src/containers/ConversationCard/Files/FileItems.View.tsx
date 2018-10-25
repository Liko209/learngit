/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-24 15:44:40
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiFileWithoutPreview } from 'jui/pattern/ConversationCard/Files';
import { JuiIconButton } from 'jui/components/Buttons/IconButton';

import { FileItemsViewProps } from './types';

class FileItemsView extends React.Component<FileItemsViewProps> {
  render() {
    const { getFileItems } = this.props;
    console.log(getFileItems(), '-----getFileItems');
    return (
      <JuiFileWithoutPreview
        title="Conversation Card VxD.pdf"
        secondary="3.5MB"
        actions={
          <JuiIconButton variant="plain" tooltipTitle="download">
            vertical_align_bottom
          </JuiIconButton>
        }
      />
    );
  }
}

export { FileItemsView };
