/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-23 09:57:08
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';

import * as Jui from './style';
import { FileName } from './FileName';

type JuiFileWithoutPreviewProps = {
  fileName: string;
  size: string;
  Actions: JSX.Element;
  iconType: string;
};

const FileSecondary = (secondary: string, children: JSX.Element) => {
  return (
    <>
      <span data-test-automation-id="file-no-preview-size">{secondary}</span>
      <Jui.FileActionsWrapper>{children}</Jui.FileActionsWrapper>
    </>
  );
};

const JuiFileWithoutPreview: React.SFC<JuiFileWithoutPreviewProps> = (
  props: JuiFileWithoutPreviewProps,
) => {
  const { size, fileName, Actions, iconType } = props;

  return (
    <Jui.FileItem disableGutters={true}>
      <Jui.FileIcon>{iconType}</Jui.FileIcon>
      <Jui.FileInfo
        secondaryTypographyProps={{
          component: 'div',
        }}
        classes={{
          primary: 'file-item-primary',
          secondary: 'file-item-secondary',
        }}
        primary={<FileName filename={fileName} />}
        secondary={FileSecondary(size, Actions)}
      />
    </Jui.FileItem>
  );
};

export { JuiFileWithoutPreview, JuiFileWithoutPreviewProps };
