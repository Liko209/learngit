/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-23 09:57:08
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';

import * as Jui from './style';

type JuiFileWithoutPreviewProps = {
  title: string;
  secondary: string;
  actions: JSX.Element;
};

const FileSecondary = (secondary: string, children: JSX.Element) => {
  return (
    <>
      <span>{secondary}</span>
      <Jui.FileActionsWrapper>{children}</Jui.FileActionsWrapper>
    </>
  );
};

const JuiFileWithoutPreview: React.SFC<JuiFileWithoutPreviewProps> = (
  props: JuiFileWithoutPreviewProps,
) => {
  const { secondary, title, actions } = props;

  return (
    <Jui.FileItem disableGutters={true}>
      <Jui.FileIcon />
      <Jui.FileInfo
        classes={{
          primary: 'file-item-primary',
          secondary: 'file-item-secondary',
        }}
        primary={title}
        secondary={FileSecondary(secondary, actions)}
      />
    </Jui.FileItem>
  );
};

export { JuiFileWithoutPreview, JuiFileWithoutPreviewProps };
